/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TasrifIstilahi, TasrifLughowi } from "../types";
import { IilalEngine } from "../utils/iilalEngine";
import { PRONOUNS_14, PRONOUNS_6, PRONOUNS_12, PRONOUNS_ISIM_6 } from "../utils/dictionaryData";
import { Table, Copy } from "lucide-react";

interface TasrifLughowiViewProps {
  tasrif: TasrifIstilahi;
  fa: string;
  ain: string;
  lam: string;
  bina: string;
}

type SubTabType = "madhi" | "mudhari" | "amar_nahi" | "isims";

export default function TasrifLughowiView({
  tasrif,
  fa,
  ain,
  lam,
  bina,
}: TasrifLughowiViewProps) {
  const [subTab, setSubTab] = useState<SubTabType>("madhi");

  // Dynamically calculate the 14/6 forms
  const lughowi: TasrifLughowi = IilalEngine.tasrifLughowi(tasrif, fa, ain, lam, bina);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Short sub-tab navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl max-w-fit">
        <button
          onClick={() => setSubTab("madhi")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "madhi" ? "bg-white text-emerald-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Fi'il Madhi (14 Dhomir)
        </button>
        <button
          onClick={() => setSubTab("mudhari")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "mudhari" ? "bg-white text-emerald-900 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          Fi'il Mudhari (14 Dhomir)
        </button>
        <button
          onClick={() => setSubTab("amar_nahi")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "amar_nahi" ? "bg-white text-emerald-900 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          Amar & Nahi (12 Dhomir)
        </button>
        <button
          onClick={() => setSubTab("isims")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "isims" ? "bg-white text-emerald-900 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          Isim Fail & Maful (6 Bentuk)
        </button>
      </div>

      {/* Subtab Content */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
        {/* TAB 1: FI'IL MADHI TABLE */}
        {subTab === "madhi" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">No</th>
                  <th className="py-3 px-4 w-28">Dhomir (Kata Ganti)</th>
                  <th className="py-3 px-4">Artian Dhomir</th>
                  <th className="py-3 px-4 text-right">Hasil Konjugasi Lughowi</th>
                  <th className="py-3 px-4 w-12 text-center">Salin</th>
                </tr>
              </thead>
              <tbody>
                {PRONOUNS_14.map((pronoun, index) => {
                  const val = lughowi.madhi14[index] || "—";
                  return (
                    <tr
                      key={`madhi14-${index}`}
                      className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors text-xs text-gray-700"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-400">{index + 1}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-arabic text-md font-bold text-slate-800 bg-slate-100/60 px-1.5 py-0.5 rounded-md select-none mt-0.5 inline-block">
                          {pronoun.arabic}
                        </span>
                        <span className="font-mono text-[9px] text-gray-500 block">{pronoun.translit}</span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-500">{pronoun.desc}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-arabic text-xl font-bold text-gray-900 hover:text-emerald-700 transition-colors select-all" dir="rtl">
                          {val}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: FI'IL MUDHARI TABLE */}
        {subTab === "mudhari" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">No</th>
                  <th className="py-3 px-4 w-28">Dhomir</th>
                  <th className="py-3 px-4">Artian Dhomir</th>
                  <th className="py-3 px-4 text-right">Hasil Konjugasi Lughowi</th>
                  <th className="py-3 px-4 w-12 text-center">Salin</th>
                </tr>
              </thead>
              <tbody>
                {PRONOUNS_14.map((pronoun, index) => {
                  const val = lughowi.mudhari14[index] || "—";
                  return (
                    <tr
                      key={`mudhari14-${index}`}
                      className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors text-xs text-gray-700"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-400">{index + 1}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-arabic text-md font-bold text-slate-800 bg-slate-100/60 px-1.5 py-0.5 rounded-md select-none mt-0.5 inline-block">
                          {pronoun.arabic}
                        </span>
                        <span className="font-mono text-[9px] text-gray-500 block">{pronoun.translit}</span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-500">{pronoun.desc}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-arabic text-xl font-bold text-gray-900 hover:text-emerald-700 transition-colors select-all" dir="rtl">
                          {val}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: AMAR & NAHI */}
        {subTab === "amar_nahi" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* AMAR SECTION */}
            <div className="p-4 bg-white">
              <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-4 bg-rose-50 text-rose-800 px-3 py-1 rounded-lg w-max select-none">
                Fi'il Amar (12 Dhomir)
              </h4>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {PRONOUNS_12.map((pronoun, index) => {
                  const val = lughowi.amar12[index] || "—";
                  const isGhaib = index < 6;
                  return (
                    <div
                      key={`amar12-${index}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                        isGhaib
                          ? "border-amber-100/65 hover:bg-amber-50/20 bg-amber-50/5"
                          : "border-gray-50 hover:bg-rose-50/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-arabic text-md">{pronoun.arabic}</span>
                          <span className="text-[10px] text-gray-400">{pronoun.translit}</span>
                          {isGhaib && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded font-sans uppercase">
                              Ghaib
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400">{pronoun.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-arabic text-[18px] font-bold text-rose-950 select-all" dir="rtl">
                          {val}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NAHI SECTION */}
            <div className="p-4 bg-white">
              <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-4 bg-slate-50 text-slate-800 px-3 py-1 rounded-lg w-max select-none">
                Fi'il Nahi (12 Dhomir)
              </h4>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {PRONOUNS_12.map((pronoun, index) => {
                  const val = lughowi.nahi12[index] || "—";
                  const isGhaib = index < 6;
                  return (
                    <div
                      key={`nahi12-${index}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                        isGhaib
                          ? "border-amber-100/65 hover:bg-amber-50/20 bg-amber-50/5"
                          : "border-gray-50 hover:bg-slate-50/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-arabic text-md">{pronoun.arabic}</span>
                          <span className="text-[10px] text-gray-400">{pronoun.translit}</span>
                          {isGhaib && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded font-sans uppercase">
                              Ghaib
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400">{pronoun.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-arabic text-[18px] font-bold text-slate-900 select-all" dir="rtl">
                          {val}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ISIMS (FAIL & MAFUL) CARD */}
        {subTab === "isims" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* ISIM FAIL */}
            <div className="p-4 bg-white">
              <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-4 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-lg w-max select-none">
                Isim Fail (Pelaku)
              </h4>
              <div className="space-y-2">
                {PRONOUNS_ISIM_6.map((pron, idx) => {
                  const val = lughowi.isimFail6[idx] || "—";
                  return (
                    <div
                      key={`fail6-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50 hover:bg-indigo-50/5 text-xs animate-none"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-arabic text-md">{pron.arabic}</span>
                          <span className="text-[10px] text-gray-400">{pron.translit}</span>
                        </div>
                        <span className="text-[9px] text-gray-400">{pron.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-arabic text-[18px] font-bold text-indigo-950 select-all" dir="rtl">
                          {val}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ISIM MAFUL */}
            <div className="p-4 bg-white">
              <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-4 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-lg w-max select-none">
                Isim Maful (Penderita)
              </h4>
              <div className="space-y-2">
                {PRONOUNS_ISIM_6.map((pron, idx) => {
                  const val = lughowi.isimMaful6[idx] || "—";
                  return (
                    <div
                      key={`maful6-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50 hover:bg-indigo-50/5 text-xs animate-none"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-arabic text-md">{pron.arabic}</span>
                          <span className="text-[10px] text-gray-400">{pron.translit}</span>
                        </div>
                        <span className="text-[9px] text-gray-400">{pron.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-arabic text-[18px] font-bold text-indigo-950 select-all" dir="rtl">
                          {val}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val)}
                          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
