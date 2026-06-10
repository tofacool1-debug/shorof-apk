/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Loader2, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Database,
  Trash2,
  BookmarkCheck,
  Eye,
  Plus
} from "lucide-react";
import { DictionaryEntry } from "../types";

const BAB_TITLES_MAP: Record<number, string> = {
  1: "Bab 1 (فَعَلَ - يَفْعُلُ) - Contoh: نَصَرَ - يَنْصُرُ",
  2: "Bab 2 (فَعَلَ - يَفْعِلُ) - Contoh: ضَرَبَ - يَضْرِبُ",
  3: "Bab 3 (فَعَلَ - يَفْعَلُ) - Contoh: فَتَحَ - يَفْتَحُ",
  4: "Bab 4 (فَعِلَ - يَفْعَلُ) - Contoh: عَلِمَ - يَعْلَمُ",
  5: "Bab 5 (فَعُلَ - يَفْعُلُ) - Contoh: حَسُنَ - يَحْسُنُ",
  6: "Bab 6 (فَعِلَ - يَفْعِلُ) - Contoh: حَسِبَ - يَحْسِبُ"
};

interface KamusPenyimpananViewProps {
  favorites: DictionaryEntry[];
  selectedId: string;
  onSelectFavorite: (entry: DictionaryEntry) => void;
  onDeleteFavorite: (id: string) => void;
  onBulkImport: (entries: any[]) => Promise<{ count: number; error?: string }>;
  onAddManualFavorite?: (entry: { fa: string; ain: string; lam: string; babNum: number; translation: string; notes?: string }) => void;
}

export default function KamusPenyimpananView({
  favorites,
  selectedId,
  onSelectFavorite,
  onDeleteFavorite,
  onBulkImport,
  onAddManualFavorite
}: KamusPenyimpananViewProps) {
  // AI Root Search states
  const [aiQuery, setAiQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");
  const [searchedResults, setSearchedResults] = useState<any[]>([]);

  // File Importer states
  const [isImporting, setIsImporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileSuccess, setFileSuccess] = useState("");
  const [showGroups, setShowGroups] = useState(true);
  const [importReport, setImportReport] = useState<{
    count: number;
    grouped: Record<number, any[]>;
  } | null>(null);

  // Manual Input states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manFa, setManFa] = useState("");
  const [manAin, setManAin] = useState("");
  const [manLam, setManLam] = useState("");
  const [manBab, setManBab] = useState(1);
  const [manTranslation, setManTranslation] = useState("");
  const [manNotes, setManNotes] = useState("");

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = aiQuery.trim();
    if (!queryStr) return;
    setIsSearching(true);
    setAiError("");
    setAiSuccess("");
    setSearchedResults([]);

    try {
      const res = await fetch(`/api/gemini/generate-root?query=${encodeURIComponent(queryStr)}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.results)) {
        setSearchedResults(result.results);
        if (result.results.length > 0) {
          setAiSuccess(`Berhasil menganalisis ${result.results.length} kemungkinan akar kata rujukan kamus klasik & modern untuk "${queryStr}".`);
        } else {
          setAiError(`AI tidak menemukan kesamaan akar kata tsulatsi fusha untuk "${queryStr}".`);
        }
      } else {
        setAiError(result.error || "Gagal mengurai akar kata dengan AI.");
      }
    } catch (err) {
      setAiError("Gagal menghubungi server asisten AI.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveResultItem = (item: any) => {
    if (!onAddManualFavorite) return;
    onAddManualFavorite({
      fa: item.fa,
      ain: item.ain,
      lam: item.lam,
      babNum: Number(item.babNum) || 1,
      translation: item.translation,
      notes: item.explanation || `Analisis rujukan kamus untuk ${item.rootWordArabic || ""}`
    });
    setAiSuccess(`Lafadz ${item.fa}ـ${item.ain}ـ${item.lam} (${item.rootWordArabic || ""}) berhasil disimpan ke database offline!`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manFa || !manAin || !manLam || !manTranslation) {
      alert("Semua kolom harus diisi lengkap.");
      return;
    }
    if (onAddManualFavorite) {
      onAddManualFavorite({
        fa: manFa,
        ain: manAin,
        lam: manLam,
        babNum: manBab,
        translation: manTranslation,
        notes: manNotes
      });
      setManFa("");
      setManAin("");
      setManLam("");
      setManTranslation("");
      setManNotes("");
      setShowManualForm(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setFileError("");
    setFileSuccess("");
    setImportReport(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error("Berkas kosong.");
        }

        let entriesToImport: any[] = [];
        const trimmed = text.trim();

        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          try {
            const parsed = JSON.parse(trimmed);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              let f = item.fa;
              let a = item.ain;
              let l = item.lam;
              let b = item.babNum || item.bab || 1;
              let t = item.translation || item.terjemah || item.arti || "Impor";

              if (item.root && typeof item.root === "string") {
                const cleaned = item.root.replace(/[\u064B-\u0652\u0651]/g, "");
                const matches = cleaned.match(/[\u0600-\u06FF]/g);
                if (matches && matches.length >= 3) {
                  f = matches[0];
                  a = matches[1];
                  l = matches[2];
                }
              }

              if (f && a && l) {
                entriesToImport.push({
                  root: { fa: f, ain: a, lam: l },
                  babNum: Number(b) || 1,
                  translation: t
                });
              }
            }
          } catch (err) {
            console.warn("Lanjut parsing baris demi baris...");
          }
        }

        if (entriesToImport.length === 0) {
          const lines = text.split(/\r?\n/);
          for (const line of lines) {
            const lTrim = line.trim();
            if (!lTrim || lTrim.startsWith("#") || lTrim.startsWith("//")) continue;

            const parts = lTrim.split(/[;,\t|]/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 1) {
              let f = "", a = "", l = "", b = 1, t = "";
              const arabicPartIdx = parts.findIndex(p => /[\u0600-\u06FF]/.test(p));
              let radicals: string[] = [];

              if (arabicPartIdx !== -1) {
                const cleaned = parts[arabicPartIdx].replace(/[\u064B-\u0652\u0651]/g, "");
                radicals = cleaned.match(/[\u0600-\u06FF]/g) || [];
              } else {
                const cleaned = lTrim.replace(/[\u064B-\u0652\u0651]/g, "");
                radicals = cleaned.match(/[\u0600-\u06FF]/g) || [];
              }

              if (radicals.length >= 3) {
                f = radicals[0];
                a = radicals[1];
                l = radicals[2];
              }

              const numPart = parts.find(p => /^[1-6]$/.test(p));
              if (numPart) {
                b = parseInt(numPart, 10);
              }

              const transPart = parts.find(p => /[a-zA-Z]/.test(p) && !/[\u0600-\u06FF]/.test(p));
              if (transPart) {
                t = transPart;
              } else {
                const otherPart = parts.find(p => !/[\u0600-\u06FF]/.test(p) && !/^[1-6]$/.test(p));
                if (otherPart) t = otherPart;
              }

              if (f && a && l) {
                entriesToImport.push({
                  root: { fa: f, ain: a, lam: l },
                  babNum: Number(b) || 1,
                  translation: t || "Kosakata Impor"
                });
              }
            }
          }
        }

        if (entriesToImport.length === 0) {
          throw new Error("Akar kata 3 huruf Arab valid tidak terdeteksi.");
        }

        const res = await onBulkImport(entriesToImport);
        if (res.error) {
          setFileError(res.error);
        } else {
          const grouped: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
          entriesToImport.forEach(item => {
            const b = item.babNum;
            if (b >= 1 && b <= 6) grouped[b].push(item);
          });
          setFileSuccess(`✓ Berhasil memproses & merekam ${res.count} kata baru ke database!`);
          setImportReport({ count: res.count, grouped });
        }
      } catch (err: any) {
        setFileError(err.message || "Kesalahan berkas.");
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="kamus-penyimpanan-view" className="space-y-6">
      {/* Dynamic Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-400/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans">Kamus Penyimpanan Offline</h2>
            <p className="text-xs text-slate-400">Pusat data penyimpanan kosa kata hasil pencarian AI dan berkas impor luar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Kosa Kata Manual
          </button>
        </div>
      </div>

      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-xs md:text-sm">Tambah Kata Baru ke Kamus Penyimpanan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Akar Kata Arab</label>
              <div className="flex gap-1" dir="rtl">
                <input
                  type="text"
                  maxLength={1}
                  placeholder="ف"
                  value={manFa}
                  onChange={(e) => setManFa(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-center font-arabic text-lg"
                />
                <input
                  type="text"
                  maxLength={1}
                  placeholder="ع"
                  value={manAin}
                  onChange={(e) => setManAin(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-center font-arabic text-lg"
                />
                <input
                  type="text"
                  maxLength={1}
                  placeholder="ل"
                  value={manLam}
                  onChange={(e) => setManLam(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-center font-arabic text-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Bab Sharaf</label>
              <select
                value={manBab}
                onChange={(e) => setManBab(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>Bab {n} - {BAB_TITLES_MAP[n].split(" (")[1].split(")")[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Terjemah Indonesia</label>
              <input
                type="text"
                placeholder="Contoh: Menulis"
                value={manTranslation}
                onChange={(e) => setManTranslation(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Keterangan Khusus</label>
              <input
                type="text"
                placeholder="Contoh: Hafalan mandiri"
                value={manNotes}
                onChange={(e) => setManNotes(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
            >
              Tambahkan Kata
            </button>
          </div>
        </form>
      )}

      {/* Grid containing Inputs side-by-side with storage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Panels (AI Search & File Import) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. ASISTEN AI PENCARI AKAR (DIPINDAHKAN DAN DIGERAKKAN DI SINI) */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Temukan Akar Kata via AI</h3>
                <p className="text-[10px] text-gray-500">Ketik kata kerja bahasa Indonesia/Inggris</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ketik kata kerja apa saja (contoh: <em>makan, minum, menyapu, run, read</em>). Gemini AI akan otomatis melacak huruf radikal asli serta klasifikasi Bab-nya untuk langsung dimasukkan ke database offline!
            </p>

            <form onSubmit={handleAiSearch} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Contoh: berkumpul"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={isSearching}
                className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 rounded-xl text-xs text-gray-800 font-medium font-sans"
              />
              <button
                type="submit"
                disabled={isSearching || !aiQuery.trim()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                {isSearching ? "..." : "Cari"}
              </button>
            </form>

            {aiError && (
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-1.5 text-[10px] text-rose-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {aiSuccess && (
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{aiSuccess}</span>
              </div>
            )}

            {searchedResults.length > 0 && (
              <div className="space-y-4 pt-1">
                <div className="text-xs font-bold text-gray-700 border-b pb-1 font-sans">
                  Hasil rujukan kamus klasik & modern:
                </div>
                {searchedResults.map((item, index) => (
                  <div key={index} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-indigo-100/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold font-sans">
                          Bab {item.babNum}
                        </span>
                        {item.rootWordArabic && (
                          <span className="font-arabic text-base font-bold text-indigo-950">
                            (Asal: {item.rootWordArabic})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">Rujukan #{index + 1}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold">Akar Kata (Radikal)</span>
                        <strong className="font-arabic text-2xl text-emerald-950 tracking-wide font-bold">
                          {item.fa}ـ{item.ain}ـ{item.lam}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold">Arti (Terjemahan)</span>
                        <strong className="text-xs font-sans font-bold text-slate-800 block leading-tight">{item.translation}</strong>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="p-2.5 bg-white border border-gray-150 rounded-xl text-[11px] text-gray-600 leading-relaxed font-sans max-h-32 overflow-y-auto">
                        <span className="font-bold text-slate-800 block mb-1">Analisis Kamus Klasik & Modern:</span>
                        {item.explanation}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveResultItem(item)}
                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer font-sans"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Simpan ke Kamus
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFavorite({
                            id: `searched-${item.fa}-${item.ain}-${item.lam}-${item.babNum}`,
                            root: { fa: item.fa, ain: item.ain, lam: item.lam },
                            translation: item.translation,
                            babNum: Number(item.babNum) || 1,
                            notes: item.explanation || "Hasil pencarian AI"
                          });
                        }}
                        className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer font-sans"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Muat ke Tasrif
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. MENU INPUT FILE / FILE IMPORTER (TOMBOL INPUT LETAKKAN BERSAMA KAMUS) */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                <Upload className="w-5 h-5 shadow-2xs" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Input Berkas Masal</h3>
                <p className="text-[10px] text-gray-500">Unggah TXT, JSON, atau CSV</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Unggah file kosa kata Anda. Sistem akan memisahkan, menerjemahkan, dan <strong>otomatis memetakan Bab secara offline</strong>!
            </p>

            <div className="relative border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl p-6 bg-slate-50/50 text-center hover:bg-slate-50 transition-all cursor-pointer">
              <input
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                {isImporting ? (
                  <>
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-gray-700">Mengurai berkas...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-950">Pilih Berkas Offline</span>
                    <span className="text-[9px] text-gray-400">Pola: <code className="bg-gray-200 px-1 py-0.2 rounded font-mono text-[9px]">كتب, 1, Menulis</code></span>
                  </>
                )}
              </div>
            </div>

            {fileError && (
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-1.5 text-[10px] text-rose-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {fileSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{fileSuccess}</span>
                </div>
              </div>
            )}

            {importReport && (
              <div className="border border-emerald-100 bg-white rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-[9px] font-bold text-emerald-950 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Laporan Pengelompokan Bab ({importReport.count} Kata)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGroups(!showGroups)}
                    className="p-1 hover:bg-gray-50 rounded-md text-gray-400"
                  >
                    {showGroups ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showGroups && (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 mt-1 text-[9px]">
                    {[1, 2, 3, 4, 5, 6].map(num => {
                      const list = importReport.grouped[num] || [];
                      if (list.length === 0) return null;
                      return (
                        <div key={`imported-bab-${num}`} className="border border-gray-100 rounded-lg p-1.5 bg-slate-50/50 flex justify-between items-center">
                          <span className="text-indigo-950 font-semibold">Bab {num}: {BAB_TITLES_MAP[num].split(" (")[1].split(")")[0]}</span>
                          <span className="bg-emerald-150 text-emerald-900 font-bold px-1.5 rounded">{list.length} kata</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Penyimpanan Database Favorit */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-gray-950 text-base flex items-center gap-2">
                📂 Papan Penyimpanan Kosakata
              </h3>
              <p className="text-xs text-gray-400">Total {favorites.length} kosakata dapat diakses offline sewaktu-waktu</p>
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto pr-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-slate-50 select-none">
                      <th className="py-2.5 px-3">Kata (Indonesia/Inggris)</th>
                      <th className="py-2.5 px-3 text-center">Bab</th>
                      <th className="py-2.5 px-3 text-right">Akar Huruf Arab</th>
                      <th className="py-2.5 px-3">Catatan / Detail</th>
                      <th className="py-2.5 px-3 text-center">Status Offline</th>
                      <th className="py-2.5 px-3 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favorites.map((fav) => {
                      const isSelected = selectedId === fav.id;
                      const hasOfflineAiExpl = !!fav.aiExplanation;
                      return (
                        <tr 
                          key={fav.id}
                          className={`border-b border-gray-100 hover:bg-slate-50/60 leading-relaxed font-sans ${
                            isSelected ? "bg-emerald-50/20 font-semibold" : ""
                          }`}
                        >
                          {/* Word/Translation */}
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-gray-900 select-text block">{fav.translation}</span>
                            <span className="text-[10px] text-gray-400">{fav.id.startsWith("custom-") ? "Kustom" : "Prasetel"}</span>
                          </td>
                          {/* Bab */}
                          <td className="py-3 px-3 text-center font-bold text-slate-800">
                            <span className="bg-indigo-50 border border-indigo-100/40 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">Bab {fav.babNum}</span>
                          </td>
                          {/* Root letters */}
                          <td className="py-3 px-3 text-right">
                            <span className="font-arabic text-xl font-black text-emerald-900 select-text" dir="rtl">
                              {fav.root.fa}ـ{fav.root.ain}ـ{fav.root.lam}
                            </span>
                          </td>
                          {/* Notes */}
                          <td className="py-3 px-3 text-gray-500 font-medium">
                            {fav.notes || "—"}
                          </td>
                          {/* Offline indicator */}
                          <td className="py-3 px-3 text-center">
                            {hasOfflineAiExpl ? (
                              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/50 px-2 py-0.5 rounded-full select-none" title="Analisis lengkap AI tersimpan offline">
                                ✓ Penjelasan AI
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-405 italic underline select-none" title="Belum pernah diexpand dengan AI di sesei ini">
                                Hanya Kamus
                              </span>
                            )}
                          </td>
                          {/* Action controls */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onSelectFavorite(fav)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs ${
                                  isSelected 
                                  ? "bg-slate-900 text-white" 
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100/50"
                                }`}
                                title={`Pilih & Tafsir lafadz "${fav.translation}"`}
                              >
                                <Eye className="w-3 h-3" />
                                <span>Muat</span>
                              </button>
                              <button
                                onClick={() => onDeleteFavorite(fav.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus total dari database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-150 rounded-xl bg-slate-50 text-gray-500 text-xs">
              <Database className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <h4 className="font-bold text-gray-800 text-sm mb-1">Database Penyimpanan Kosong</h4>
              <p className="max-w-md mx-auto leading-relaxed">
                Belum ada lafadz tersimpan di database kosa kata Anda. Mulailah mengetik kata kerja dengan Asisten AI di panel kiri, impor berkas kosa kata masal, atau klik tombol <strong>"Simpan ke Kamus Favorit"</strong> di dasbor utama!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
