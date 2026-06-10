/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BINA_DEFINITIONS } from "../utils/dictionaryData";
import { Info, HelpCircle } from "lucide-react";

interface IilalExplainerViewProps {
  bina: "Mitsal" | "Ajwaf" | "Naqis" | "Mudho'af" | "Shohih";
  fa: string;
  ain: string;
  lam: string;
  madhi: string;
  mudhari: string;
}

export default function IilalExplainerView({
  bina,
  fa,
  ain,
  lam,
  madhi,
  mudhari,
}: IilalExplainerViewProps) {
  const definition = BINA_DEFINITIONS[bina] || {
    title: "Bina Umum",
    desc: "Akar kata tri-literal standar.",
    rule: "Perubahan harakah standard."
  };

  // Detailed step-by-step mathematical morphophonemic flowchart
  const renderFlowchart = () => {
    switch (bina) {
      case "Ajwaf":
        return [
          {
            step: "1. Keadaan Asal (Ashlah)",
            formula: `${fa}${`\u064e`}${ain}${`\u064e`}${lam}${`\u064e`}`,
            desc: `Kata kerja madhi asalnya berbunyi "${fa}${`\u064e`}${ain}${`\u064e`}${lam}${`\u064e`}" (harakah fatha penuh pada ketiga huruf radikal).`
          },
          {
            step: "2. Hukum I'ilal (Kaidah Alif)",
            formula: `${fa}${`\u064e`} + ا + ${lam}${`\u064e`}`,
            desc: `Huruf penyakit tengah ("${ain}") berharakat fatha dan berada setelah huruf berharakat fatha ("${fa}"). Sesuai kaidah I'ilal, huruf lemah tersebut dibalik/diganti menjadi Alif.`
          },
          {
            step: "3. Hasil Akhir Madhi",
            formula: `${madhi}`,
            desc: `Menghasilkan pelafalan yang ringan dan fasih: "${madhi}".`
          },
          {
            step: "4. Pembuangan Pertemuan Dua Sukun (Iltiqa'us Sakinain)",
            formula: `${fa}${`\u064f`} + ${lam}${`\u0652`} + نَ`,
            desc: `Pada dhomir Madhi "Hunna" ke bawah (e.g. ${fa}${`\u064f`}${lam}${`\u0652`}نَ), huruf Lam fi'il harus disukunkan. Hal ini membuat Alif (yang asalnya mati) bertemu dengan Lam sukun. Karena dua sukun tidak boleh bertemu, Alif dibuang.`
          }
        ];
      case "Naqis":
        return [
          {
            step: "1. Keadaan Asal (Ashlah)",
            formula: `${fa}${`\u064e`}${ain}${`\u064e`}${lam}${`\u064e`}`,
            desc: `Bentuk asal Madhi memiliki huruf penyakit di ujung kata, yaitu "${lam}" berharakat fatha.`
          },
          {
            step: "2. Hukum I'ilal (Kaidah Akhir)",
            formula: lam === "و" ? `${fa}${`\u064e`}${ain}${`\u064e`} + ا` : `${fa}${`\u064e`}${ain}${`\u064e`} + ى`,
            desc: `Huruf penyakit akhir berharakat fatha didahului fatha. Diubah menjadi Alif tegak (jika berasal dari Waw) atau Alif layyinah (jika berasal dari Ya').`
          },
          {
            step: "3. Hasil Terbentuk",
            formula: `${madhi}`,
            desc: `Membentuk kata kerja lampau sah: "${madhi}".`
          },
          {
            step: "4. Peleburan di Mudhari Jamak",
            formula: `يَ + ${fa}${`\u0652`}${ain}${`\u064f`} + ونَ`,
            desc: `Di fi'il mudhari dhomir Hum (Mereka L), akhiran Wawu Jamak ditambahkan, memaksa huruf lemah asli dibuang demi kemudahan pelafalan.`
          }
        ];
      case "Mudho'af":
        return [
          {
            step: "1. Keadaan Asal (Ashlah)",
            formula: `${fa}${`\u064e`}${ain}${`\u064e`}${lam}${`\u064e`}`,
            desc: `Huruf kedua ("${ain}") dan ketiga ("${lam}") adalah konsonan yang sama (kembar).`
          },
          {
            step: "2. Peleburan Idgham",
            formula: `${fa}${`\u064e`}${ain}${`\u0651`}${`\u064e`}`,
            desc: `Kedua huruf sejenis dileburkan (Idgham) dengan mensukunkan huruf pertama dan memasukkannya ke huruf kedua, lalu ditandai Syaddah (Tasydid).`
          },
          {
            step: "3. Hasil Madhi Tasydid",
            formula: `${madhi}`,
            desc: `Menghasilkan pelafalan tunggal bertekanan: "${madhi}".`
          },
          {
            step: "4. Penguraian Idgham (Fakkul Idgham)",
            formula: `${fa}${`\u064e`}${ain}${`\u064e`}${lam}${`\u0652`} + تَ`,
            desc: `Dari dhomir Hunna (Mereka P) hingga Nahnu (Kami), karena bertemunya dhomir rafa' mutaharrik (berharakat), hukum Idgham batal. Huruf kembar harus tertulis terpisah kembali.`
          }
        ];
      case "Mitsal":
        return [
          {
            step: "1. Karakteristik Huruf Depan",
            formula: `${fa} + ${`\u064e`}${ain}${`\u064e`}${lam}${`\u064e`}`,
            desc: `Memiliki huruf berpenyakit "${fa}" (Waw atau Ya') di depan kata. Madhi tidak mengalami i'ilal perubahan.`
          },
          {
            step: "2. Mudhari Terhimpit (Kaidah Waw)",
            formula: `يَ + ${fa} + ${`\u0652`}${ain}${`\u0650`}${lam}${`\u064f`}`,
            desc: `Pada bentuk Mudhari Bab 2/6 (harakah 'Ain kasra), huruf Waw terhimpit di antara Ya' mudhara'ah berharakat fatha dan 'Ain fi'il berharakat kasra (e.g. يَوْعِدُ).`
          },
          {
            step: "3. Pembuangan Waw (Hadzf)",
            formula: `يَ${ain}${`\u0650`}${lam}${`\u064f`}`,
            desc: `Karena terhimpit, huruf Waw dibuang demi keringanan ucapan, menghasilkan bentuk fasih "${mudhari}".`
          }
        ];
      default:
        return [
          {
            step: "1. Kondisi Radikal",
            formula: `${fa} - ${ain} - ${lam}`,
            desc: `Semua huruf pembentuk terdiri dari konsonan shahih yang kuat (tidak rentan penyakit/lemah).`
          },
          {
            step: "2. Kelestarian Struktur",
            formula: `${madhi} - ${mudhari}`,
            desc: `Tidak terjadi hukum pembuangan (Hadzf), penukaran (Qalb), atau pemindahan harakah (Naql). Semua berjalan murni sesuai timbangan wazan.`
          }
        ];
    }
  };

  const steps = renderFlowchart();

  return (
    <div className="space-y-6">
      {/* Bina Definition Header */}
      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
        <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block mb-2">
          Analisis Bina Aktif
        </span>
        <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">{definition.title}</h3>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-3">{definition.desc}</p>
        <div className="flex gap-2 items-start text-xs text-gray-500 pt-3 border-t border-gray-200/50">
          <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <span>
            <strong className="font-semibold text-gray-700">Kaidah I'ilal Utama: </strong>
            {definition.rule}
          </span>
        </div>
      </div>

      {/* Step-by-Step Flowchart */}
      <div>
        <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          Detail Transformasi I'ilal & Morfofonemik
        </h4>

        <div className="relative border-l border-emerald-100 pl-5 ml-2.5 space-y-6">
          {steps.map((node, index) => (
            <div key={`step-${index}`} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white group-hover:scale-110 transition-transform shadow-xs" />

              <div className="space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  {node.step}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="font-arabic text-xl font-bold bg-white border border-gray-100 rounded-xl px-2.5 py-1 text-slate-900 select-all shadow-2xs"
                    dir="rtl"
                  >
                    {node.formula}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed pt-1 select-none">
                  {node.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
