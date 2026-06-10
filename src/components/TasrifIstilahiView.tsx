/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TasrifIstilahi, ShighotDetail } from "../types";
import { Info } from "lucide-react";

interface TasrifIstilahiViewProps {
  tasrif: TasrifIstilahi;
}

export default function TasrifIstilahiView({ tasrif }: TasrifIstilahiViewProps) {
  // Helper to render Jamak / Muntahal badges elegantly
  const renderSubForms = (detail: ShighotDetail) => {
    const hasJamak = detail.jamak && detail.jamak.length > 0;
    const hasMuntahal = detail.muntahal && detail.muntahal.length > 0;

    if (!hasJamak && !hasMuntahal) return null;

    return (
      <div className="mt-1 pb-1 pt-1 border-t border-dashed border-gray-100 flex flex-col gap-1 items-end justify-end">
        {hasJamak && (
          <div className="flex flex-wrap items-center gap-1 justify-end">
            <span className="text-[8px] text-gray-400 font-medium">Jamak:</span>
            {detail.jamak.map((j, i) => (
              <span key={`jamak-${i}`} className="text-[9px] font-arabic font-bold bg-slate-50 border border-slate-100 text-slate-750 px-1.5 py-0.2 rounded-sm select-all">
                {j}
              </span>
            ))}
          </div>
        )}
        {hasMuntahal && (
          <div className="flex flex-wrap items-center gap-1 justify-end">
            <span className="text-[8px] text-amber-500 font-medium">M. Jumu':</span>
            {detail.muntahal.map((m, i) => (
              <span key={`muntahal-${i}`} className="text-[9px] font-arabic font-bold bg-amber-50/50 border border-amber-100 text-amber-750 px-1.5 py-0.2 rounded-sm select-all">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const GRID_ITEMS = [
    {
      title: "Fi'il Madhi",
      subtitle: "Kata Kerja Lampau (Past)",
      arabicLabel: "الفِعْلُ المَاضِي",
      arabicWord: tasrif.madhi,
      description: "Menunjukkan pekerjaan yang telah selesai dikerjakan.",
      variant: "emerald",
    },
    {
      title: "Fi'il Mudhari",
      subtitle: "Kata Kerja Sedang/Akan (Present)",
      arabicLabel: "الفِعْلُ المُضَارِعُ",
      arabicWord: tasrif.mudhari,
      description: "Menunjukkan pekerjaan yang sedang atau akan dikerjakan.",
      variant: "emerald",
    },
    {
      title: "Masdar Mu'akkad",
      subtitle: "Kata Benda Dasar (Infinitif)",
      arabicLabel: "المَصْدَرُ",
      arabicWord: tasrif.masdar,
      description: "Nomina abstrak penunjuk makna tindakan tanpa terikat waktu.",
      variant: "slate",
    },
    {
      title: "Isim Fail",
      subtitle: "Subjek / Pelaku Utama (Aktor)",
      arabicLabel: "اِسْمُ الفَاعِلِ",
      arabicWord: tasrif.isimFail.mufrod,
      description: "Nomina penunjuk sifat atau entitas yang melakukan perbuatan.",
      detailObj: tasrif.isimFail,
      variant: "indigo",
    },
    {
      title: "Isim Maful",
      subtitle: "Objek / Penerima Tindakan",
      arabicLabel: "اِسْمُ المَفْعُولِ",
      arabicWord: tasrif.isimMaful.mufrod,
      description: "Nomina penunjuk sasaran atau penderita suatu perbuatan.",
      detailObj: tasrif.isimMaful,
      variant: "indigo",
    },
    {
      title: "Fi'il Amar",
      subtitle: "Kata Kerja Perintah (Imperatif)",
      arabicLabel: "فِعْلُ الأَمْرِ",
      arabicWord: tasrif.amar,
      description: "Kalimat perintah untuk melakukan pekerjaan.",
      variant: "rose",
    },
    {
      title: "Fi'il Nahi",
      subtitle: "Kata Kerja Larangan (Prohibitif)",
      arabicLabel: "فِعْلُ النَّهْيِ",
      arabicWord: tasrif.nahi,
      description: "Kalimat instruksi untuk melarang melakukan suatu hal.",
      variant: "rose",
    },
    {
      title: "Isim Zaman",
      subtitle: "Kata Keterangan Waktu",
      arabicLabel: "اِسْمُ الزَّمَانِ",
      arabicWord: tasrif.isimZaman.mufrod,
      description: "Nomina yang menunjukkan waktu terjadinya pekerjaan.",
      detailObj: tasrif.isimZaman,
      variant: "amber",
    },
    {
      title: "Isim Makan",
      subtitle: "Kata Keterangan Tempat",
      arabicLabel: "اِسْمُ المَكَانِ",
      arabicWord: tasrif.isimMakan.mufrod,
      description: "Nomina yang menunjukkan tempat terjadinya pekerjaan.",
      detailObj: tasrif.isimMakan,
      variant: "amber",
    },
    {
      title: "Isim Alat",
      subtitle: "Kata Benda Alat (Instrumen)",
      arabicLabel: "اِسْمُ الآلَةِ",
      arabicWord: tasrif.isimAlat.mufrod,
      description: "Nomina penunjuk alat bantu fisik untuk berbuat sesuatu.",
      detailObj: tasrif.isimAlat,
      variant: "teal",
    },
  ];

  const SECONDARY_ITEMS = [
    {
      title: "Isim Tafdhil",
      arabicLabel: "اِسْمُ التَّفْضِيلِ",
      desc: "Menyatakan makna 'Lebih' atau 'Paling' (Komparatif/Superlatif).",
      details: [
        { label: "Mudzakar (L)", val: tasrif.tafdhilMuzakkar },
        { label: "Muannats (P)", val: tasrif.tafdhilMuannats },
        { label: "Jamak", val: tasrif.tafdhilJamak },
      ],
    },
    {
      title: "Nomina Frekuensi & Karakter",
      arabicLabel: "اِسْمُ المَرَّةِ وَالنَّوْعِ",
      desc: "Isim Marrah (sekali aksi) & Isim Nau' (cara/gaya melakukan).",
      details: [
        { label: "Isim Marrah (Sekali)", val: tasrif.marrah },
        { label: "Isim Nau' (Gaya)", val: tasrif.nau },
      ],
    },
    {
      title: "Isim Sifat & Mubalaghoh",
      arabicLabel: "الصِّفَةُ المُشَبَّهَةُ وَالمُبَالَغَةُ",
      desc: "Kata sifat penetap atau penguat intensitas tinggi ('Maha'/'Sangat').",
      details: [
        { label: "Isim Musyabihat", val: tasrif.isimMusyabihat.mufrod },
        { label: "Mubalaghoh Fa'al", val: tasrif.mubalaghohFaal.mufrod },
        { label: "Mubalaghoh Fa'il", val: tasrif.mubalaghohFa_il.mufrod },
        { label: "Mubalaghoh Mif'al", val: tasrif.mubalaghohMifal.mufrod },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Short info bar */}
      <div className="bg-emerald-50 border border-emerald-110 rounded-xl p-2.5 flex gap-2 items-start text-[11px] text-emerald-800">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-700" />
        <p>
          <strong className="font-semibold">Tasrif Istilahi</strong> adalah proses pemindahan kata kerja mutlak 
          menjadi bermacam-macam bentuk/shighot sesuai makna yang dituju. Klik kata bahasa Arab untuk menyalin teks instan.
        </p>
      </div>

      {/* Compact Bento-Grid: 5 columns on large screen, 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {GRID_ITEMS.map((item, index) => {
          let themeClass = "";
          let textTheme = "";
          switch (item.variant) {
            case "emerald":
              themeClass = "hover:border-emerald-300 bg-emerald-50/5";
              textTheme = "text-emerald-800 bg-emerald-50";
              break;
            case "indigo":
              themeClass = "hover:border-indigo-300 bg-indigo-50/5";
              textTheme = "text-indigo-800 bg-indigo-50";
              break;
            case "rose":
              themeClass = "hover:border-rose-300 bg-rose-50/5";
              textTheme = "text-rose-800 bg-rose-50";
              break;
            case "amber":
              themeClass = "hover:border-amber-300 bg-amber-50/5";
              textTheme = "text-amber-800 bg-amber-50";
              break;
            case "teal":
              themeClass = "hover:border-teal-300 bg-teal-50/5";
              textTheme = "text-teal-800 bg-teal-50";
              break;
            default:
              themeClass = "hover:border-slate-300 bg-slate-50/20";
              textTheme = "text-slate-800 bg-slate-50";
          }

          return (
            <div
              key={`istilahi-card-${index}`}
              className={`p-2.5 rounded-xl border border-gray-100 bg-white transition-all flex flex-col justify-between group ${themeClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-sm select-none ${textTheme}`}>
                    {item.arabicLabel}
                  </span>
                  <span className="text-[8.5px] text-gray-400 font-semibold">{item.title}</span>
                </div>
                <h4 className="text-[9.5px] text-gray-400 font-medium mb-1 truncate">{item.subtitle}</h4>
              </div>

              {/* Central Arabic Word */}
              <div className="py-1 text-right mt-1">
                <div
                  className="font-arabic text-xl md:text-2xl font-bold text-gray-900 group-hover:scale-[1.03] transition-transform select-all cursor-pointer inline-block"
                  title="Klik untuk menyalin"
                  onClick={() => {
                    navigator.clipboard.writeText(item.arabicWord || "");
                  }}
                  dir="rtl"
                >
                  {item.arabicWord || "—"}
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Sub-structures (Jamak, Muntahal Jumu') */}
              {item.detailObj && renderSubForms(item.detailObj)}
            </div>
          );
        })}
      </div>

      {/* Secondary Isims and Mubalaghoh (More Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-gray-100 pt-3">
        {SECONDARY_ITEMS.map((sec, idx) => (
          <div key={`sec-card-${idx}`} className="p-3 rounded-xl border border-gray-100 bg-slate-50/30">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-gray-800 text-[11px]">{sec.title}</h3>
              <span className="text-[10px] font-arabic font-bold text-slate-500">{sec.arabicLabel}</span>
            </div>
            <p className="text-[9px] text-gray-500 leading-relaxed mb-2">{sec.desc}</p>

            <div className="space-y-1">
              {sec.details.map((detail, dIdx) => (
                <div
                  key={`sec-det-${dIdx}`}
                  className="bg-white p-1.5 rounded-lg border border-gray-100 flex items-center justify-between"
                >
                  <span className="text-[9px] text-gray-500 font-medium">{detail.label}</span>
                  <span
                    className="font-arabic text-[13.5px] font-bold text-gray-900 select-all cursor-pointer hover:text-emerald-600 transition-colors"
                    onClick={() => navigator.clipboard.writeText(detail.val || "")}
                    dir="rtl"
                  >
                    {detail.val || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
