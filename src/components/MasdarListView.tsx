/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Sparkles } from "lucide-react";

interface MasdarListViewProps {
  masdar23: string[];
}

const MASDAR_METADATA = [
  { id: 1, wazan: "فَعْلٌ", desc: "Masdar asli standar (paling umum dan mayoritas)", contoh: "ضَرْبٌ (Pemukulan)" },
  { id: 2, wazan: "فِعْلٌ", desc: "Masdar dangan harakah kasra pada huruf pertama", contoh: "عِلْمٌ (Pengetahuan)" },
  { id: 3, wazan: "فُعْلٌ", desc: "Masdar dengan harakah damma pada huruf pertama", contoh: "شُكْرٌ (Kesyukuran / Terima kasih)" },
  { id: 4, wazan: "فَعَلَانٌ", desc: "Menunjukkan arti bergejolak, mengalir, atau berputar", contoh: "طَيَرَانٌ (Penerbangan / Melayang)" },
  { id: 5, wazan: "فَعَلَانَةٌ", desc: "Nomina gerak bergejolak dengan imbuhan ta marbuthah", contoh: "غَلَيَانَةٌ (Pendidihan)" },
  { id: 6, wazan: "فُعَالٌ", desc: "Nomina penunjuk suara atau penyakit", contoh: "سُعَالٌ (Batuk) / صُرَاخٌ (Jeritan)" },
  { id: 7, wazan: "فِعَالٌ", desc: "Menunjukkan penolakan (aba') atau pelarian", contoh: "فِرَارٌ (Pelarian / Kabur)" },
  { id: 8, wazan: "فَعَلَةٌ", desc: "Masdar dengan tambahan Ta Marbuthah tunggal", contoh: "رَحْمَةٌ (Kasih sayang)" },
  { id: 9, wazan: "فَعَالَةٌ", desc: "Nomina penemu, kompetensi, atau sifat permanen", contoh: "شَجَاعَةٌ (Keberanian)" },
  { id: 10, wazan: "فِعَالَةٌ", desc: "Menunjukkan bidang pekerjaan, keprofesian, atau industri", contoh: "كِتَابَةٌ (Profesi Menulis)" },
  { id: 11, wazan: "فُعُولَةٌ", desc: "Nomina sifat abstrak dasar (umum pada Bab 5)", contoh: "سُهُولَةٌ (Kemudahan)" },
  { id: 12, wazan: "فَعِيلٌ", desc: "Nomina penunjuk suara yang berterusan", contoh: "صَهِيلٌ (Pekikan kuda) / رَحِيلٌ (Perjalanan)" },
  { id: 13, wazan: "فُعُولٌ", desc: "Masdar untuk kata kerja intransitif (tidak butuh objek)", contoh: "دُخُولٌ (Pemasukan) / خُرُوجٌ (Pengeluaran)" },
  { id: 14, wazan: "فَعَلَانٌ", desc: "Variasi gerak aliran air atau partikel halus", contoh: "جَرَيَانٌ (Aliran air)" },
  { id: 15, wazan: "فَعَلَاتٌ", desc: "Bentuk plural jamak atau nominalisasi frekuensi", contoh: "حَسَنَاتٌ (Kebaikan-kebaikan)" },
  { id: 16, wazan: "مَفْعَلَةٌ", desc: "Masdar Mimi (diawali Mim tambahan) dengan ta marbuthah", contoh: "مَنْفَعَةٌ (Kemanfaatan)" },
  { id: 17, wazan: "فَعْلَةٌ", desc: "Isim Marrah (Menunjukkan perbuatan yang terjadi SATU kali)", contoh: "ضَرْبَةٌ (Satu kali pukulan)" },
  { id: 18, wazan: "فِعْلَةٌ", desc: "Isim Nau' (Menunjukkan CARA/GAYA melakukan perbuatan)", contoh: "جِلْسَةٌ (Gaya duduk)" },
  { id: 19, wazan: "تَفْعِلٌ", desc: "Masdar derivatif non-standar / di luar tsulatsi", contoh: "تَفْرِيقٌ (Pembedaan / Pemisahan)" },
  { id: 20, wazan: "تَفْعَالٌ", desc: "Bentuk pengulangan intensif (perbuatan berulang-ulang)", contoh: "تَكْثَارٌ (Melakukan banyak hal)" },
  { id: 21, wazan: "فُعْلَى", desc: "Bentuk kualitas atau elatif feminin", contoh: "بُشْرَى (Kabar gembira)" },
  { id: 22, wazan: "فَعْلِيٌّ", desc: "Masdar relasional (menggunakan nisbah akhiran)", contoh: "فَقْرِيٌّ (Kondisi kefakiran)" },
  { id: 23, wazan: "فُعْلَانٌ", desc: "Masdar penunjuk kualitas agung atau pengampunan", contoh: "غُفْرَانٌ (Pengampunan)" }
];

export default function MasdarListView({ masdar23 }: MasdarListViewProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredMasdars = masdar23
    .map((word, index) => {
      const meta = MASDAR_METADATA[index] || { id: index + 1, wazan: "مَصْدَر", desc: "Variasi Masdar", contoh: "" };
      return { word, ...meta };
    })
    .filter(item => {
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        item.word.includes(q) ||
        item.wazan.includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.contoh.toLowerCase().includes(q)
      );
    });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start text-xs text-amber-900">
        <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <h4 className="font-bold mb-1">23 Pola Masdar Tsulatsi Mujarrad (Sama'i & Qiyasi)</h4>
          <p className="leading-relaxed text-amber-800">
            Berbeda dengan fi'il mudhari, cetakan bentuk Masdar pada kata kerja tri-literal sangat bervariasi (Sama'i / didengar dari lisan Arab asli). 
            Di bawah ini ada <strong className="font-bold">23 jenis pola Masdar asli</strong> yang dihitung otomatis oleh teknologi i'ilal 
            berdasarkan huruf radikal yang Anda pilih.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Saring wazan Masdar atau arti..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 bg-white"
        />
      </div>

      {/* Grid of Masdars */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredMasdars.map((item, idx) => (
          <div
            key={`masdar23-card-${idx}`}
            className="p-3.5 bg-white border border-gray-100 rounded-2xl flex flex-col justify-between hover:border-amber-200 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-sm font-semibold font-mono">
                Pendidikan {item.id} • {item.wazan}
              </span>
              <button
                onClick={() => copyToClipboard(item.word)}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Salin kata"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right py-1">
              <span className="font-arabic text-2xl font-bold text-slate-900 group-hover:scale-102 transition-transform select-all" dir="rtl">
                {item.word}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-dashed border-gray-50 flex flex-col gap-1 text-[10px] text-gray-500">
              <p className="leading-relaxed font-medium text-gray-700">{item.desc}</p>
              {item.contoh && (
                <p className="text-gray-400">
                  <span className="font-semibold text-gray-500">Contoh standar: </span>
                  {item.contoh}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
