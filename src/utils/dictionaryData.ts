/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DictionaryEntry, DataWazan } from "../types";

export const PRESET_DICTIONARY: DictionaryEntry[] = [
  {
    id: "nasara",
    root: { fa: "ن", ain: "ص", lam: "ر" },
    translation: "Menolong / Membantu",
    babNum: 1,
    notes: "Fi'il Shohih (tidak ada huruf penyakit). Menggunakan pola Bab 1 (فَعَلَ - يَفْعُلُ). Pola standard perubahan harakah 'Ain dari fatha di Madhi ke damma di Mudhari."
  },
  {
    id: "kataba",
    root: { fa: "ك", ain: "ت", lam: "ب" },
    translation: "Menulis",
    babNum: 1,
    masdar: "كِتَابَةً",
    notes: "Fi'il Shohih. Pola Bab 1 (فَعَلَ - يَفْعُلُ). Contoh mutawatir yang sangat sering dipakai dalam pembelajaran bahasa Arab tsulatsi mujarrad."
  },
  {
    id: "dharaba",
    root: { fa: "ض", ain: "ر", lam: "ب" },
    translation: "Memukul / Mengetuk",
    babNum: 2,
    notes: "Fi'il Shohih. Bab 2 (فَعَلَ - يَفْعِلُ). Perubahan 'Ain harakah fatha ke kasra (fathul-kasri)."
  },
  {
    id: "jalasa",
    root: { fa: "ج", ain: "ل", lam: "س" },
    translation: "Duduk",
    babNum: 2,
    masdar: "جُلُوسًا",
    notes: "Fi'il Shohih. Bab 2 (فَعَلَ - يَفْعِلُ). Kata kerja lazim (intransitif) yang sangat mendasar."
  },
  {
    id: "fataha",
    root: { fa: "ف", ain: "ت", lam: "ح" },
    translation: "Membuka / Membebaskan",
    babNum: 3,
    notes: "Fi'il Shohih dengan huruf tenggorokan (Halaq) 'ح' sebagai Lam Fi'il. Bab 3 (فَعَلَ - يَفْتَحُ). Harakah 'Ain tetap fatha (fathatani)."
  },
  {
    id: "alima",
    root: { fa: "ع", ain: "ل", lam: "م" },
    translation: "Mengetahui / Belajar",
    babNum: 4,
    masdar: "عِلْمًا",
    notes: "Fi'il Shohih. Bab 4 (فَعِلَ - يَفْعَلُ). Transisi harakah 'Ain dari kasra di Madhi ke fatha di Mudhari (kasrul-fathi)."
  },
  {
    id: "hasuna",
    root: { fa: "ح", ain: "س", lam: "ن" },
    translation: "Menjadi Baik / Bagus",
    babNum: 5,
    masdar: "حُسْنًا",
    notes: "Fi'il Shohih. Bab 5 (فَعُلَ - يَشْرُفُ / يَفْعُلُ). Kata kerja pensifatan (Lazim) dengan harakah damma di kedua bentuk (dammudammi)."
  },
  {
    id: "hasiba",
    root: { fa: "ح", ain: "س", lam: "ب" },
    translation: "Mengira / Menyangka",
    babNum: 6,
    notes: "Fi'il Shohih yang langka. Bab 6 (فَعِلَ - يَفْعِلُ). Mengalami perubahan kasra di kedua bentuk (kasratani)."
  },
  {
    id: "qala",
    root: { fa: "ق", ain: "و", lam: "ل" },
    translation: "Berkata / Mengucapkan",
    babNum: 1,
    notes: "Fi'il Ajwaf Wawi (huruf penyakit 'و' di tengah). Mengalami I'ilal pemindahan harakah dan penggantian huruf menjadi Alif pada Madhi: قَوَلَ -> قَالَ."
  },
  {
    id: "baa",
    root: { fa: "ب", ain: "ي", lam: "ع" },
    translation: "Menjual",
    babNum: 2,
    notes: "Fi'il Ajwaf Ya'i (huruf penyakit 'ي' di tengah). Mengalami I'ilal penggantian huruf menjadi Alif pada Madhi: بَيَعَ -> بَاعَ, dan kasra pada Mudhari: يَبْيِعُ -> يَبِيعُ."
  },
  {
    id: "khafa",
    root: { fa: "خ", ain: "و", lam: "ف" },
    translation: "Takut / Khawatir",
    babNum: 4,
    masdar: "خَوْفًا",
    notes: "Fi'il Ajwaf Wawi. Pola Bab 4 (فَعِلَ - يَفْعَلُ). Menjadi خَافَ - يَخَافُ. Terjadi pembuangan huruf lemah saat sukun bertemu pada tasrif lughowi (mulai dari khifna)."
  },
  {
    id: "daa",
    root: { fa: "د", ain: "ع", lam: "و" },
    translation: "Berdoa / Mengajak / Menyeru",
    babNum: 1,
    masdar: "دُعَاءً",
    notes: "Fi'il Naqis Wawi (huruf lemah 'و' di akhir). Mengalami pergantian akhir menjadi Alif Tegak pada Madhi: دَعَوَ -> دَعَا, dan tetap di Mudhari: يَدْعُو."
  },
  {
    id: "rama",
    root: { fa: "ر", ain: "م", lam: "ي" },
    translation: "Melempar",
    babNum: 2,
    notes: "Fi'il Naqis Ya'i (huruf lemah 'ي' di akhir). Akhiran menjadi Alif Layyinah/Maqshurah pada Madhi: رَمَيَ -> رَمَى."
  },
  {
    id: "radhiya",
    root: { fa: "ر", ain: "ض", lam: "ي" },
    translation: "Ridha / Puas / Setuju",
    babNum: 4,
    notes: "Fi'il Naqis Ya'i. Bab 4 (فَعِلَ - يَفْعَلُ). Bentuknya رَضِيَ - يَرْضَى. Akhiran Mudhari berupa Alif Maqshurah."
  },
  {
    id: "waada",
    root: { fa: "و", ain: "ع", lam: "د" },
    translation: "Berjanji / Mengancam",
    babNum: 2,
    notes: "Fi'il Mitsal Wawi (huruf lemah 'و' di depan). Mengalami pembuangan Waw pada Mudhari karena berada di antara Fatha dan Kasra: يَوْعِدُ -> يَعِدُ."
  },
  {
    id: "madda",
    root: { fa: "م", ain: "د", lam: "د" },
    translation: "Memperpanjang / Membentangkan",
    babNum: 1,
    notes: "Fi'il Mudho'af (huruf kedua dan ketiga sama). Mengalami Idgham (peleburan/tasydid): مَدَدَ -> مَدَّ, يَمْدُدُ -> يَمُدُّ. Tasrif lughowi memecah tasydid dari hunna ke bawah."
  }
];

// Map Bab Number to representative Wazan templates
export const WAZAN_TEMPLATES: Record<number, DataWazan> = {
  1: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعَلَ",
    wazanMudhari: "يَفْعُلُ",
    masdar: "فَعْلًا"
  },
  2: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعَلَ",
    wazanMudhari: "يَفْعِلُ",
    masdar: "فَعْلًا"
  },
  3: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعَلَ",
    wazanMudhari: "يَفْعَلُ",
    masdar: "فَعْلًا"
  },
  4: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعِلَ",
    wazanMudhari: "يَفْعَلُ",
    masdar: "فُعْلَانًا"
  },
  5: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعُلَ",
    wazanMudhari: "يَفْعُلُ",
    masdar: "فَعَالَةً"
  },
  6: {
    fa: "ف",
    ain: "ع",
    lam: "ل",
    wazanMadhi: "فَعِلَ",
    wazanMudhari: "يَفْعِلُ",
    masdar: "فِعْلَانًا"
  }
};

export const BINA_DEFINITIONS: Record<string, { title: string; desc: string; rule: string }> = {
  Shohih: {
    title: "Bina Shohih (بِنَاء صَحِيح)",
    desc: "Semua huruf pembentuknya sehat (shahih), tidak ganda, tidak mengandung huruf penyakit (Alif, Waw, Ya') dan tidak ada hamzah.",
    rule: "Perubahan harakah standar tanpa ada pelesapan atau penggantian huruf."
  },
  Mitsal: {
    title: "Bina Mitsal (بِنَاء مِثَال)",
    desc: "Huruf pertamanya (Fa Fi'il) berupa huruf penyakit, umumnya Waw ('و') atau Ya' ('ي').",
    rule: "Huruf penyakit di depan biasanya dibuang pada bentuk Fi'il Mudhari jika berharakah kasra (e.g. وَعَدَ -> يَعِدُ)."
  },
  Ajwaf: {
    title: "Bina Ajwaf (بِنَاء أَجْوَف)",
    desc: "Huruf tengahnya ('Ain Fi'il) berupa huruf penyakit, bisa Waw ('و') atau Ya' ('ي').",
    rule: "Huruf tengah dilemahkan menjadi Alif pada Fi'il Madhi. Di Fi'il Madhi Lughowi, huruf penyakit dibuang saat sukun bertemu (mulai dari dhomir Hunna)."
  },
  Naqis: {
    title: "Bina Naqis (بِنَاء نَاقِص)",
    desc: "Huruf terakhirnya (Lam Fi'il) berupa huruf penyakit, bisa Waw ('و') atau Ya' ('ي').",
    rule: "Mengalami peleburan di akhir kata kerja. Akhiran diganti Alif atau Alif Maqshurah tergantung jenis huruf lemah asalnya."
  },
  "Mudho'af": {
    title: "Bina Mudho'af (بِنَاء مُضَاعَف)",
    desc: "Huruf kedua ('Ain Fi'il) dan huruf ketiga (Lam Fi'il) adalah huruf sejenis yang sama.",
    rule: "Dua huruf sejenis digabungkan dan diberi tanda tasydid (Idgham). Pada Fi'il Madhi, tasydid ini diurai/dipecah kembali dari dhomir Hunna sampai Nahnu."
  },
  "Lafif Maqrun": {
    title: "Bina Lafif Maqrun (بِنَاء لَفِيف مَقْرُون)",
    desc: "Akar kata yang memiliki dua huruf penyakit berdampingan, yaitu pada 'Ain Fi'il dan Lam Fi'il (e.g. شَوَى).",
    rule: "Huruf penyakit di akhir (Lam) mengalami I'ilal layaknya Bina Naqis, sedangkan 'Ain Fi'il dipertahankan tetap tampak."
  },
  "Lafif Mafruq": {
    title: "Bina Lafif Mafruq (بِنَاء لَفِيف مَفْرُوق)",
    desc: "Akar kata yang memiliki dua huruf penyakit terpisah, yaitu pada Fa Fi'il dan Lam Fi'il (e.g. وَقَى).",
    rule: "Menggabungkan dua kaidah: pelesapan huruf depan pada Mudhari (Bina Mitsal) dan perubahan huruf akhir pada bentuk madhi/nahi (Bina Naqis)."
  },
  "Mahmuz Fa": {
    title: "Bina Mahmuz Fa (بِنَاء مَهْمُوز الْفَاء)",
    desc: "Akar kata yang huruf pertamanya (Fa Fi'il) berupa huruf Hamzah (e.g. أَكَلَ).",
    rule: "Mengikuti pola tasrif Shohih secara umum. Namun pada bentukan seperti Isim Fail, hamzah bertemu alif melebur menjadi alif mad (e.g. أَكَلَ -> آكِلٌ)."
  },
  "Mahmuz 'Ain": {
    title: "Bina Mahmuz 'Ain (بِنَاء مَهْمُوز الْعَيْن)",
    desc: "Akar kata yang huruf keduanya ('Ain Fi'il) berupa huruf Hamzah (e.g. سَأَلَ).",
    rule: "Tasrif berjalan layaknya Bina Shohih, di mana karakter Hamzah bertahan dan pelafalan 'Ain diucapkan secara tegas/hambat glotal."
  },
  "Mahmuz Lam": {
    title: "Bina Mahmuz Lam (بِنَاء مَهْمُوز اللَّام)",
    desc: "Akar kata yang huruf ketiganya (Lam Fi'il) berupa huruf Hamzah (e.g. قَرَأَ).",
    rule: "Tasrif mengikuti pola Shohih. Penulisan Hamzah disesuaikan dengan harakah pendahulu (di atas alif, ya, waw, atau sebaris sendiri)."
  }
};

export const PRONOUNS_14 = [
  { arabic: "هُوَ", translit: "Huwa", desc: "Dia (1 Laki-laki)" },
  { arabic: "هُمَا", translit: "Huma", desc: "Mereka (2 Laki-laki)" },
  { arabic: "هُمْ", translit: "Hum", desc: "Mereka (>2 Laki-laki)" },
  { arabic: "هِيَ", translit: "Hiya", desc: "Dia (1 Perempuan)" },
  { arabic: "هُمَا", translit: "Huma", desc: "Mereka (2 Perempuan)" },
  { arabic: "هُنَّ", translit: "Hunna", desc: "Mereka (>2 Perempuan)" },
  { arabic: "أَنْتَ", translit: "Anta", desc: "Kamu (1 Laki-laki)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 Laki-laki)" },
  { arabic: "أَنْتُمْ", translit: "Antum", desc: "Kalian (>2 Laki-laki)" },
  { arabic: "أَنْتِ", translit: "Anti", desc: "Kamu (1 Perempuan)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 Perempuan)" },
  { arabic: "أَنْتُنَّ", translit: "Antunna", desc: "Kalian (>2 Perempuan)" },
  { arabic: "أَنَا", translit: "Ana", desc: "Saya (Laki-laki/Perempuan)" },
  { arabic: "نَحْنُ", translit: "Nahnu", desc: "Kami/Kita" }
];

export const PRONOUNS_6 = [
  { arabic: "أَنْتَ", translit: "Anta", desc: "Kamu (L / Mukhotob)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 L / Mukhotobani)" },
  { arabic: "أَنْتُمْ", translit: "Antum", desc: "Kalian (Pria / Mukhotobun)" },
  { arabic: "أَنْتِ", translit: "Anti", desc: "Kamu (P / Mukhotobah)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 P / Mukhotobatani)" },
  { arabic: "أَنْتُنَّ", translit: "Antunna", desc: "Kalian (Wanita / Mukhotobna)" }
];

export const PRONOUNS_12 = [
  // Ghoib
  { arabic: "هُوَ", translit: "Huwa", desc: "Dia (1 L / Ghaib)" },
  { arabic: "هُمَا", translit: "Huma", desc: "Mereka (2 L / Ghaibani)" },
  { arabic: "هُمْ", translit: "Hum", desc: "Mereka (L > 2 / Ghaibun)" },
  // Ghoibah
  { arabic: "هِيَ", translit: "Hiya", desc: "Dia (1 P / Ghaibah)" },
  { arabic: "هُمَا", translit: "Huma", desc: "Mereka (2 P / Ghaibata_ni)" },
  { arabic: "هُنَّ", translit: "Hunna", desc: "Mereka (P > 2 / Ghaibat)" },
  // Mukhotob
  { arabic: "أَنْتَ", translit: "Anta", desc: "Kamu (1 L / Mukhotob)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 L / Mukhotobani)" },
  { arabic: "أَنْتُمْ", translit: "Antum", desc: "Kalian (L > 2 / Mukhotobun)" },
  // Mukhotobah
  { arabic: "أَنْتِ", translit: "Anti", desc: "Kamu (1 P / Mukhotobah)" },
  { arabic: "أَنْتُمَا", translit: "Antuma", desc: "Kalian (2 P / Mukhotobatani)" },
  { arabic: "أَنْتُنَّ", translit: "Antunna", desc: "Kalian (P > 2 / Mukhotobna)" }
];

export const PRONOUNS_ISIM_6 = [
  { arabic: "مُفْرَد مُذَكَّر", translit: "Singular Maskulin", desc: "Seorang Laki-laki" },
  { arabic: "تَثْنِيَة مُذَكَّر", translit: "Dual Maskulin", desc: "Dua orang Laki-laki" },
  { arabic: "جَمْع مُذَكَّر", translit: "Plural Maskulin", desc: "Banyak Laki-laki" },
  { arabic: "مُفْرَد مُؤَنَّث", translit: "Singular Feminin", desc: "Seorang Perempuan" },
  { arabic: "تَثْنِيَة مُؤَنَّث", translit: "Dual Feminin", desc: "Dua orang Perempuan" },
  { arabic: "جَمْع مُؤَنَّث", translit: "Plural Feminin", desc: "Banyak Perempuan" }
];
