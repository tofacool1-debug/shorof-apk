/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to storage JSON file
const DB_FILE = path.join(process.cwd(), "favorites_db.json");

// Helper to read database
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = [
      {
        id: "fav-nasara",
        root: { fa: "ن", ain: "ص", lam: "ر" },
        translation: "Menolong / Membantu",
        babNum: 1,
        notes: "Tersimpan otomatis di cloud database bawaan.",
        custom: false
      }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal membaca database:", err);
    return [];
  }
}

// Helper to write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Gagal menulis ke database:", err);
  }
}

// REST GET endpoint
app.get("/api/favorites", (req, res) => {
  const faves = readDb();
  res.json({ success: true, count: faves.length, data: faves });
});

// REST POST endpoint
app.post("/api/favorites", (req, res) => {
  const { id, root, translation, babNum, notes, custom, aiExplanation } = req.body;
  if (!root || !root.fa || !root.ain || !root.lam) {
    return res.status(400).json({ success: false, error: "Data akar kata tidak lengkap" });
  }
  const faves = readDb();
  
  // Check duplication
  const duplicate = faves.find(
    (f: any) =>
      f.root.fa === root.fa &&
      f.root.ain === root.ain &&
      f.root.lam === root.lam &&
      f.babNum === babNum
  );

  if (duplicate) {
    return res.json({ success: false, error: "Akar kata ini sudah tersimpan di database!" });
  }

  const newFav = {
    id: id || `fav-cloud-${Date.now()}`,
    root,
    translation,
    babNum,
    notes: notes || "Tersimpan di Cloud",
    custom: !!custom,
    aiExplanation: aiExplanation || ""
  };

  faves.unshift(newFav);
  writeDb(faves);

  res.json({ success: true, data: newFav });
});

// REST POST bulk endpoint
app.post("/api/favorites/bulk", (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, error: "Ekspresi masukan salah, butuh array 'entries'" });
  }

  const faves = readDb();
  let addedCount = 0;

  for (const entry of entries) {
    const { id, root, translation, babNum, notes, custom, aiExplanation } = entry;
    if (!root || !root.fa || !root.ain || !root.lam) {
      continue;
    }

    // Check duplicate
    const duplicate = faves.find(
      (f: any) =>
        f.root.fa === root.fa &&
        f.root.ain === root.ain &&
        f.root.lam === root.lam &&
        f.babNum === babNum
    );

    if (duplicate) {
      continue;
    }

    const newFav = {
      id: id || `fav-cloud-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      root,
      translation: translation || "Kata Impor",
      babNum: Number(babNum) || 1,
      notes: notes || "Diimpor secara otomatis via berkas",
      custom: !!custom,
      aiExplanation: aiExplanation || ""
    };

    faves.unshift(newFav);
    addedCount++;
  }

  if (addedCount > 0) {
    writeDb(faves);
  }

  res.json({ success: true, count: addedCount, data: faves });
});

// REST DELETE endpoint
app.delete("/api/favorites/:id", (req, res) => {
  const id = req.params.id;
  let faves = readDb();
  faves = faves.filter((item: any) => item.id !== id);
  writeDb(faves);
  res.json({ success: true, message: "Berhasil menghapus favorit dari cloud database." });
});// Helper to execute Gemini requests with automatic retries, backoff,
// and automatic fallback to alternative stable models if the primary model is overloaded (e.g. 503 / 429).
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  parameters: {
    contents: any;
    config?: any;
  },
  maxRetries = 3,
  delayMs = 1200
): Promise<any> {
  const modelsToTry = [
    "gemini-3.5-flash",       // Primary high-quality model
    "gemini-3.1-flash-lite"   // Highly stable, fast, lightweight fallback model
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    let currentDelay = delayMs;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini Client] Calling model '${model}' (Attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model,
          contents: parameters.contents,
          config: parameters.config
        });
        if (response && response.text) {
          return response;
        }
        throw new Error("Empty response received from Gemini API");
      } catch (error: any) {
        lastError = error;
        const errorStr = String(error?.message || error);
        
        // Match standard transient error patterns
        const isTransient = errorStr.includes("503") || 
                            errorStr.includes("UNAVAILABLE") || 
                            errorStr.includes("high demand") || 
                            errorStr.includes("429") || 
                            errorStr.includes("rate limit") ||
                            errorStr.includes("Resource has been exhausted") ||
                            errorStr.includes("Overloaded");

        console.warn(`[Gemini Client] Model '${model}' attempt ${attempt} failed: ${errorStr}`);

        if (isTransient && attempt < maxRetries) {
          console.warn(`Retrying model '${model}' in ${currentDelay}ms due to transient error...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 1.5; // Exponential backoff
        } else {
          break; // Break current model retry loop to try the next fallback model
        }
      }
    }
  }

  throw lastError;
}

// Server-side Gemini API explanation route
app.get("/api/gemini/explain", async (req, res) => {
  try {
    const { fa, ain, lam, babNum, bina, translation } = req.query;
    if (!fa || !ain || !lam) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        explanation: "API Key Gemini belum diset di server. Silakan konfigurasi melalui Settings > Secrets di AI Studio."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("ya29.")) {
      const apiKey = process.env.GEMINI_API_KEY;
      const anyAi = ai as any;
      if (anyAi.apiClient && anyAi.apiClient.clientOptions && anyAi.apiClient.clientOptions.auth) {
        anyAi.apiClient.clientOptions.auth.addAuthHeaders = async function (headers: any) {
          headers.set('Authorization', `Bearer ${apiKey}`);
        };
      }
    }

    const prompt = `Berikan analisis linguistik morfologi sharaf bahasa Arab yang mendalam, fasih, dan akademik untuk akar tri-literal dengan radikal ${fa} - ${ain} - ${lam}, Bab ${babNum}, Bina ${bina} (Bina' dari akar kata ini), yang memiliki makna dasar "${translation}".

Berikan rincian penjelasan yang rapi dalam bahasa Indonesia dengan pembagian sub-bab berikut:

1. 📚 **Rujukan Kamus Klasik & Modern**:
   - Jelaskan kedalaman makna kata ini berdasarkan rujukan kamus klasik terkemuka seperti **Lisanul 'Arab** (Karya Ibnu Manzhur), **Tajul 'Arus** (Karya Al-Zabidi), **Al-Sihah** (Karya Al-Jauhari), atau **Mu'jam Maqa'is al-Lughah** (Karya Ibnu Faris).
   - Hubungkan pula dengan penjelasan kamus modern seperti **Al-Mu'jam al-Wasit** (Majma' Al-Lughah Al-Arabiyyah), **Al-Munjid**, dan **Kamus Al-Munawwir** (Karya KH. Ali Munawwir). Detailkan bagaimana pergeseran makna atau perluasan penggunaan kata tersebut secara bahasa dan sastra (balaghah).

2. ⚙️ **Transformasi Prinsip I'lal & 19 Qaidah Sharaf**:
   - Analisis secara mendalam transformasi morfologi yang terjadi pada akar kata ini berdasarkan **19 Qaidah I'lal (Kaidah Sharaf Klasik Arab)**.
   - Jelaskan apakah terjadi:
     - *Ibtidal* (Penggantian huruf, seperti huruf 'illah menjadi alif/hamzah).
     - *Idgham* (Peleburan/tasydid huruf ganda).
     - *Naql* (Pemindahan harakah/vokal).
     - *Hadzf* (Pembuangan huruf 'illah karena jazem, amar, atau pertemuan dua sukun / *iltiqao'issakinayni*).
   - Hubungkan analisis ini dengan jenis **Bina'** dari akar kata aktif (${bina}). Berikan penjelasan detail kenapa harakahnya dibaca demikian (misalnya pada bentuk Madhi, Mudhari, Amar, Isim Fail, dan Isim Maful). Jika akar ini tidak mengalami I'lal (Bina' Shohih), jelaskan secara teoritis perbandingannya dengan akar bina' mu'tal yang se-bab, sehingga menjelaskan sistem 19 qaidah secara tuntas!

3. 📂 **Peta 23 Wazan Masdar**:
   - Ulas kecocokan akar kata ini terhadap **23 Wazan Masdar** (dari fi'il tsulatsi mujarrad, baik Masdar Mim, Ghoiru Mim, Isim Masdar, Masdar Marrah [sekali klik/kejadian], dan Masdar Nau' [gaya/spesifikasi]).
   - Jelaskan wazan masdar mana yang sima'i (umum didengar) dan mana yang qiyasi (terukur secara aturan) untuk akar kata ini berdasarkan kamus rujukan.

4. 👥 **Karakteristik Tasrif Lughowi (14 Dhomir)**:
   - Jelaskan bagaimana dinamika pelafalan terjadi pada konjugasi dhomir tasrif lughowi dari dhomir Huwa (هُوَ) hingga Nahnu (نَحْنُ) baik pada bentuk Madhi, Mudhari, maupun Amar & Nahi.
   - Tunjukkan letak terjadinya pembuangan huruf 'illah atau pemecahan tasydid idgham (fakkul idgham) ketika bersambung dengan dhomir rafa' mutaharrik (seperti pada dhomir Hunna (هُنَّ) ke bawah).

5. ✍️ **Untaian Hikmah & Sastra (Aplikasi Riil)**:
   - Tuliskan untaian kata hikmah (Amsal/Mahfuzhat klasik), kutipan ayat Al-Qur'an pendek, hadits nabi, atau bait syi'ir Arab yang menggunakan turunan kata dari akar kata ini beserta artinya yang menginspirasi.

Formatlah teks Markdown ini secara sangat indah, rapi, terstruktur tegas dengan emoji yang relevan, menggunakan font tebal (bold) untuk penekanan kaidah, serta sajikan porsi teks Arab berharakat lengkap (menggunakan span berkelas font Arabic) agar memudahkan pembelajaran secara luring/offline!`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("Gagal memanggil Gemini:", error);
    res.json({ success: false, explanation: `Gagal memanggil analisis AI saat ini karena beban server tinggi. Silakan coba klik tombol 'Segarkan' beberapa saat lagi. Detail: ${error.message || error}` });
  }
});

// Server-side Gemini API root generator from Indonesian or Arabic query
app.get("/api/gemini/generate-root", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, error: "Missing query parameter" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        error: "API Key Gemini belum diset di server. Silakan konfigurasi melalui Settings > Secrets."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("ya29.")) {
      const apiKey = process.env.GEMINI_API_KEY;
      const anyAi = ai as any;
      if (anyAi.apiClient && anyAi.apiClient.clientOptions && anyAi.apiClient.clientOptions.auth) {
        anyAi.apiClient.clientOptions.auth.addAuthHeaders = async function (headers: any) {
          headers.set('Authorization', `Bearer ${apiKey}`);
        };
      }
    }

    const prompt = `Analisis lafadz atau kosa kata berikut menggunakan rujukan komparatif kamus bahasa Arab klasik (seperti Lisanul 'Arab karya Ibnu Manzhur, Tajul 'Arus karya Al-Zabidi, Al-Sihah karya Al-Jauhari, Mu'jam Maqa'is al-Lughah karya Ibnu Faris) dan kamus bahasa Arab modern (seperti Al-Mu'jam al-Wasith, Kamus Al-Munawwir karya KH. Ali Munawwir, Al-Munjid): "${query}".

Tujuan Anda adalah menelusuri kosa kata tersebut secara morfologis (tasrif/isytiqaq) dan menemukan seluruh akar kata tri-literal (fi'il tsulatsi mujarrad fusha) yang cocok. 

Aturan dan Ketentuan Khusus:
1. Jika pengguna menginput lafadz Arab yang mengalami pengerutan (seperti "غَزَا" atau "قَالَ" atau "دَعَا"): lacak bentuk asal radikalnya dari kamus. Contoh: "غَزَا" bentuk asalnya adalah "غَزَوَ" (akar: غ - ze - w / غ - ز - w), bukan "غزا". Begitu pula "دَعَا" berasal dari "دَعَوَ" (akar: d - 'a - w / د - ع - و).
2. Jika ada homograf atau beberapa akar kata berbeda yang bisa merujuk ke lafadz yang sama, Anda WAJIB mengembalikan SEMULANYA (lebih dari 1 objek di dalam array "results") agar dapat dibandingkan dan dipilih pengguna. Contoh: "قَالَ" dapat berasal dari:
   - Akar: "ق" + "و" + "ل" (dari kata "قَوَلَ" - Bab 1: قَالَ-يَقُولُ untuk arti "berkata").
   - Akar: "ق" + "ي" + "ل" (dari kata "قَيَلَ" - Bab 6: قَالَ-يَقِيلُ untuk arti "istirahat tidur siang / qailulah").
3. Jika pengguna mencari kata kerja/benda/sifat dalam bahasa Indonesia (misal: "perang", "membantu", "makan"), cari kata yang setimbal dalam bahasa Arab klasik/modern, lalu tentukan akar kata radikal 3 huruf dan Bab-nya.
4. Setiap entri di dalam array wajib memiliki penjelasan rujukan kamus klasik dan modern yang menerangkan asal-usul filologi kata tersebut secara mendalam.

Kembalikan respon hanya dalam bentuk JSON murni yang valid dengan bentuk skema berikut:
{
  "results": [
    {
      "fa": "Huruf radikal pertama murni satu karakter hija'iyah tanpa harakat sama sekali (contoh: 'غ' atau 'ق')",
      "ain": "Huruf radikal kedua murni satu karakter hija'iyah tanpa harakat sama sekali (contoh: 'ز' atau 'و')",
      "lam": "Huruf radikal ketiga murni satu karakter hija'iyah tanpa harakat sama sekali (contoh: 'و' atau 'ل')",
      "babNum": 1, // Bab dalam ilmu sharaf yaitu angka bulat dari 1 sampai 6
      "translation": "Terjemahan maknawi spesifik dalam Bahasa Indonesia",
      "rootWordArabic": "Lafadz fi'il madhi asal asli berharakat lengkap (contoh: 'غَزَوَ' atau 'قَوَلَ' atau 'قَيَلَ')",
      "explanation": "Penjelasan rujukan kamus klasik & modern yang menerangkan asal kata serta maknanya"
    }
  ]
}

PENTING: Jangan menyertakan teks pembuka atau penutup markdown (seperti \`\`\`json). Kembalikan JSON murni agar bisa langsung di-parse. Jaga agar penulisan huruf fa, ain, lam murni masing-masing satu karakter Arab tunggal tanpa harakat/syakal.`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let textResponse = response.text || "";
    textResponse = textResponse.replace(/^```json/i, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(textResponse);
    
    // Safely structure as a result array
    let results: any[] = [];
    if (parsed && Array.isArray(parsed.results)) {
      results = parsed.results;
    } else if (Array.isArray(parsed)) {
      results = parsed;
    } else if (parsed && typeof parsed === "object") {
      if (parsed.fa && parsed.ain && parsed.lam) {
        results = [parsed];
      } else {
        // Try any inner array
        const foundArray = Object.values(parsed).find(v => Array.isArray(v));
        if (foundArray) {
          results = foundArray as any[];
        }
      }
    }

    res.json({ success: true, results });
  } catch (error: any) {
    console.error("Gagal melakukan pencarian akar kata lewat Gemini:", error);
    res.json({
      success: false,
      error: `Asisten AI sedang sibuk memproses antrean lain (Kelebihan Beban). Silakan coba lagi beberapa saat lagi. Detail: ${error.message || error}`
    });
  }
});

// Vite middleware for development or serving assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
