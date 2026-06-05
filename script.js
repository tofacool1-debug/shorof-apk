const selectBab = document.getElementById('bab');
const inputAkar = document.getElementById('akar');
const btnTampil = document.getElementById('btnTampil');
const divOpsi = document.getElementById('opsi');
const btnMujarrod = document.getElementById('btnMujarrod');
const btnMazid = document.getElementById('btnMazid');
const hasilDiv = document.getElementById('hasil');
const let API_KEY = localStorage.getItem('gemini_key');

// === 2. FUNGSI BUKA BOX INPUT KEY ===
function bukaInputKey() {
  // Hapus box lama kalo ada
  let boxLama = document.getElementById('boxKey');
  if(boxLama) boxLama.remove();

  // Bikin box baru
  let div = document.createElement('div');
  div.id = 'boxKey';
  div.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:999; display:flex; align-items:center; justify-content:center;';
  div.innerHTML = `
    <div style="background:#222; padding:20px; border-radius:10px; text-align:center; color:white; width:90%; max-width:400px;">
      <h3>🔑 Masukkan API Key Gemini</h3>
      <p style="font-size:12px; color:#aaa;">aistudio.google.com/app/apikey</p>
      <input id="keyInput" type="password" placeholder="Paste API Key di sini" style="width:100%; padding:10px; margin:10px 0; border-radius:5px; border:none;">
      <button id="btnSimpanKey" style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:5px; cursor:pointer;">Simpan & Mulai</button>
    </div>
  `;
  document.body.appendChild(div);

  // Kasih fungsi ke tombol Simpan
  document.getElementById('btnSimpanKey').onclick = function() {
    let key = document.getElementById('keyInput').value.trim();
    if(key) {
      localStorage.setItem('gemini_key', key);
      div.remove();
      alert('Key tersimpan! Reload halaman');
      location.reload();
    } else {
      alert('Key jangan kosong bang!');
    }
  }
}

// === 3. KALO KEY KOSONG, LANGSUNG MUNCULIN BOX ===
if(!API_KEY) {
  window.onload = bukaInputKey;
}

// === 4. KASIH FUNGSI KE TOMBOL "Ganti/Set API Key" ===
// Tunggu HTML beres dulu
window.onload = function() {
  // Cari tombol berdasarkan text
  let semuaBtn = document.querySelectorAll('button');
  semuaBtn.forEach(btn => {
    if(btn.innerText.includes('Ganti/Set API Key')) {
      btn.onclick = bukaInputKey;
    }
  });
const babList = {
  bab1: "فَعَلَ يَفْعُلُ",
  bab2: "فَعِلَ يَفْعَلُ",
  bab3: "فَعَلَ يَفْعَلُ",
  bab4: "فَعِلَ يَفْعِلُ",
  bab5: "فَعُلَ يَفْعُلُ",
  bab6: "فَعَلَ يَفْعِلُ"
};
Object.keys(babList).forEach(b => {
  selectBab.innerHTML += `<option value="${b}">${b.toUpperCase()} - ${babList[b]}</option>`;
});

let dataGlobal = {}; // simpen data biar gak fetch 2x

// Step 1: Ketik lafadz + pilih bab → Tampilkan hasil
btnTampil.addEventListener('click', async () => {
  let root = inputAkar.value.trim();
  let bab = selectBab.value;
  if(!root || root.length!= 3) return alert('Ketik lafadz 3 huruf bang! Ex: كتب');
  if(!bab) return alert('Pilih Bab dulu!');

  hasilDiv.innerHTML = '<p>🤖 AI lagi analisis fiil: '+root+'...</p>';
  divOpsi.classList.add('hidden');

  // Minta AI kasih tau ini mujarrod/mazid + data dasar
  let prompt = `Analisis fi'il "${root}" Bab ${bab.slice(-1)} kaidah ${babList[bab]}.
  Kembalikan HANYA JSON:
  {
    "jenis": "mujarrod/mazid",
    "madhi": "", "mudhore": "", "amr": "", "nahi": "",
    "masdar": "", "isim_fail": "", "isim_maful": "",
    "isim_zaman_makan": "", "isim_alah": ""
  }`;

  try {
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({contents: [{parts: [{text: prompt}]}], generationConfig: {response_mime_type: "application/json"}})
    });
    dataGlobal = JSON.parse((await res.json()).candidates[0].content.parts[0].text);
    dataGlobal.bab = bab; dataGlobal.root = root;
    
    hasilDiv.innerHTML = `<h3>📖 ${root} - ${babList[bab]}</h3><p>Jenis: <b>${dataGlobal.jenis}</b></p>`;
    divOpsi.classList.remove('hidden'); // munculin pilihan Mujarrod/Mazid

  } catch(e) { hasilDiv.innerHTML = `<p style="color:red">❌ ${e.message}</p>`; }
});

// Step 2: Klik Mujarrod/Mazid → Tasrif Istilahi
btnMujarrod.addEventListener('click', () => tampilTasrifIstilahi('mujarrod'));
btnMazid.addEventListener('click', () => tampilTasrifIstilahi('mazid'));

function tampilTasrifIstilahi(jenis) {
  let html = `<h3>1. تَصْرِيف اصْطِلَاحِي - ${jenis.toUpperCase()}</h3><table>
  <tr><th>الاصطلاح</th><th>الصيغة</th></tr>`;
  let label = {
    madhi:"الماضي", mudhore:"المضارع", amr:"الأمر", nahi:"النهي",
    masdar:"المصدر", isim_fail:"اسم الفاعل", isim_maful:"اسم المفعول",
    isim_zaman_makan:"اسم الزمان/المكان", isim_alah:"اسم الآلة"
  };
  for(let key in label) {
    html += `<tr><td>${label[key]}</td><td class="arab">${dataGlobal[key] || '-'}</td></tr>`;
  }
  html += `</table><button id="btnLughowi">Lanjut → Tasrif Lughowi</button>`;
  hasilDiv.innerHTML = html;
  
  document.getElementById('btnLughowi').onclick = tampilTasrifLughowi;
}

// Step 3: Klik Lanjut → Tasrif Lughowi KOMPLIT
async function tampilTasrifLughowi() {
  hasilDiv.innerHTML += '<p>🤖 AI lagi tasrif lughowi semua shighot + jamak taksir...</p>';
  
  let prompt = `Buat tasrif lughowi KOMPLIT fi'il "${dataGlobal.root}" Bab ${dataGlobal.bab.slice(-1)} jenis ${dataGlobal.jenis}.
  
  Kembalikan HANYA JSON valid dengan format ini:
  {
    "madhi": ["هو", "هي", "انتَ", "انتِ", "انا", "نحن", "هما مذكر", "هما مؤنث", "انتم", "انتن", "هم", "هن", "انتما مذكر", "انتما مؤنث"],
    "mudhore": [...14 dhamir],
    "amr": ["انتَ", "انتِ", "انتما", "انتم", "انتن"],
    "nahi": ["انتَ", "انتِ", "انتما", "انتم", "انتن"],
    "isim_fail": {"mufrad_mudzakkar": "", "mufrad_muannats": "", "jamak_taksir": "", "muntahal_jumuk": ""},
    "isim_maful": {"mufrad_mudzakkar": "", "mufrad_muannats": "", "jamak_taksir": "", "muntahal_jumuk": ""},
    "masdar": ["", "", ""], // sebutkan 3 masdar yg masyhur kalo ada
    "isim_zaman_makan": ["", ""],
    "isim_alah": ["", ""]
  }
  Harakat wajib sesuai kaidah Bab ${dataGlobal.bab.slice(-1)}. Kalo gak ada isi "-"`;

  try {
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({contents: [{parts: [{text: prompt}]}], generationConfig: {response_mime_type: "application/json"}})
    });
    let lughowi = JSON.parse((await res.json()).candidates[0].content.parts[0].text);
    
    let dhamir14 = ["هو","هي","انتَ","انتِ","انا","نحن","هما مذكر","هما مؤنث","انتم","انتن","هم","هن","انتما مذكر","انتما مؤنث"];
    let dhamir5 = ["انتَ","انتِ","انتما","انتم","انتن"];
    
    // Tabel Madhi + Mudhore 14 dhamir
    let html = `<h3>2. تَصْرِيف لُغَوِي كَامِل</h3>`;
    html += `<h4>الماضي + المضارع - 14 ضمير</h4><table><tr><th>الضمير</th><th>الماضي</th><th>المضارع</th></tr>`;
    dhamir14.forEach((d,i) => {
      html += `<tr><td>${d}</td><td class="arab">${lughowi.madhi[i]}</td><td class="arab">${lughowi.mudhore[i]}</td></tr>`;
    });
    html += `</table>`;

    // Tabel Amr + Nahi 5 dhamir mukhatab
    html += `<h4>الأمر + النهي - 5 ضمير مخاطب</h4><table><tr><th>الضمير</th><th>الأمر</th><th>النهي</th></tr>`;
    dhamir5.forEach((d,i) => {
      html += `<tr><td>${d}</td><td class="arab">${lughowi.amr[i]}</td><td class="arab">${lughowi.nahi[i]}</td></tr>`;
    });
    html += `</table>`;

    // Tabel Isim Fail + Isim Maful + Jamak Taksir + Muntahal Jumuk
    html += `<h4>المشتقات + جموع التكسير</h4><table><tr><th>الاصطلاح</th><th>المفرد مذكر</th><th>المفرد مؤنث</th><th>جمع تكسير</th><th>منتهى الجموع</th></tr>`;
    html += `<tr><td>اسم الفاعل</td><td class="arab">${lughowi.isim_fail.mufrad_mudzakkar}</td><td class="arab">${lughowi.isim_fail.mufrad_muannats}</td><td class="arab">${lughowi.isim_fail.jamak_taksir}</td><td class="arab">${lughowi.isim_fail.muntahal_jumuk}</td></tr>`;
    html += `<tr><td>اسم المفعول</td><td class="arab">${lughowi.isim_maful.mufrad_mudzakkar}</td><td class="arab">${lughowi.isim_maful.mufrad_muannats}</td><td class="arab">${lughowi.isim_maful.jamak_taksir}</td><td class="arab">${lughowi.isim_maful.muntahal_jumuk}</td></tr>`;
    html += `</table>`;

    // Tabel Masdar + Isim Zaman/Makan + Isim Alah
    html += `<h4>المصادر واسم الزمان والمكان والآلة</h4><table><tr><th>الاصطلاح</th><th>الصيغ</th></tr>`;
    html += `<tr><td>المصدر</td><td class="arab">${lughowi.masdar.filter(x=>x!='-').join(' , ')}</td></tr>`;
    html += `<tr><td>اسم الزمان/المكان</td><td class="arab">${lughowi.isim_zaman_makan.filter(x=>x!='-').join(' , ')}</td></tr>`;
    html += `<tr><td>اسم الآلة</td><td class="arab">${lughowi.isim_alah.filter(x=>x!='-').join(' , ')}</td></tr>`;
    html += `</table>`;

    hasilDiv.innerHTML = html;

  } catch(e) { 
    hasilDiv.innerHTML += `<p style="color:red">❌ Gagal tasrif lughowi: ${e.message}</p>`;
    console.log(e);
  }
}
