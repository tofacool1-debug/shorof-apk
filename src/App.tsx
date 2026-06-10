/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  Bookmark,
  Plus,
  Save,
  RotateCcw,
  BookMarked,
  Layers,
  Table,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  Github,
  Database
} from "lucide-react";
import { DictionaryEntry, TasrifIstilahi, DataWazan } from "./types";
import { PRESET_DICTIONARY, WAZAN_TEMPLATES } from "./utils/dictionaryData";
import { IilalEngine } from "./utils/iilalEngine";

// Subcomponents
import DictionaryList from "./components/DictionaryList";
import SavedFavoritesList from "./components/SavedFavoritesList";
import TasrifIstilahiView from "./components/TasrifIstilahiView";
import TasrifLughowiView from "./components/TasrifLughowiView";
import MasdarListView from "./components/MasdarListView";
import IilalExplainerView from "./components/IilalExplainerView";
import AiAnalysisView from "./components/AiAnalysisView";
import KamusPenyimpananView from "./components/KamusPenyimpananView";

const STORAGE_FAVORITES_KEY = "sharaf_kamus_favorites";

export default function App() {
  // Configured default state loads "nasara" Preset
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [viewMode, setViewMode] = useState<"tasrif" | "penyimpanan">("tasrif");
  const [activeTab, setActiveTab] = useState<"istilahi" | "lughowi" | "masdar" | "iilal" | "ai">("istilahi");

  // Saved Favorites List Hydration
  const [favorites, setFavorites] = useState<DictionaryEntry[]>([]);
  const [newFavNote, setNewFavNote] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Load from cloud database with localStorage fallback
  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites");
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setFavorites(json.data);
          localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(json.data));
          return;
        }
      } catch (err) {
        console.warn("Gagal memuat favorit dari Cloud DB, menggunakan fallback lokal:", err);
      }

      // Fallback
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          console.error("Gagal memuat favorit dari localStorage:", e);
        }
      } else {
        const defaultFavs: DictionaryEntry[] = [
          {
            id: "fav-nasara",
            root: { fa: "ن", ain: "ص", lam: "ر" },
            translation: "Menolong (Akar Shohih)",
            babNum: 1,
            notes: "Tersimpan otomatis sebagai percontohan.",
            custom: false
          }
        ];
        setFavorites(defaultFavs);
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(defaultFavs));
      }
    }

    loadFavorites();
  }, []);

  // Save to localStorage helper
  const saveFavoritesToStorage = (list: DictionaryEntry[]) => {
    setFavorites(list);
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(list));
  };

  // Select a preset entry
  const handleSelectPreset = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  // Convert active mode parameters into an unified Wazan dataset for calculations
  const activeWazanData = useMemo((): DataWazan => {
    const template = WAZAN_TEMPLATES[selectedEntry.babNum];
    return {
      fa: selectedEntry.root.fa,
      ain: selectedEntry.root.ain,
      lam: selectedEntry.root.lam,
      wazanMadhi: template.wazanMadhi,
      wazanMudhari: template.wazanMudhari,
      masdar: selectedEntry.masdar || template.masdar
    };
  }, [selectedEntry]);

  // Derived current metrics
  const activeBina = useMemo(() => {
    return IilalEngine.detectBina(activeWazanData.fa, activeWazanData.ain, activeWazanData.lam);
  }, [activeWazanData]);

  const activeTranslation = useMemo(() => {
    return selectedEntry.translation;
  }, [selectedEntry]);

  const activeBabNum = useMemo(() => {
    return selectedEntry.babNum;
  }, [selectedEntry]);

  // Apply TS IilalEngine compiler
  const calculatedTasrif = useMemo((): TasrifIstilahi => {
    return IilalEngine.tasrifIstilahiCustom(activeWazanData);
  }, [activeWazanData]);

  // Save current root to favorites list
  const handleSaveToFavorites = async () => {
    const id = `fav-preset-${activeWazanData.fa}-${activeWazanData.ain}-${activeWazanData.lam}-${Date.now()}`;
    
    // Check duplication
    const isDuplicate = favorites.some(
      (f) =>
        f.root.fa === activeWazanData.fa &&
        f.root.ain === activeWazanData.ain &&
        f.root.lam === activeWazanData.lam &&
        f.babNum === activeBabNum
    );

    if (isDuplicate) {
      setSaveSuccessMsg("Akar kata ini sudah ada di daftar favorit!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
      return;
    }

    const newFavorite: DictionaryEntry = {
      id,
      root: {
        fa: activeWazanData.fa,
        ain: activeWazanData.ain,
        lam: activeWazanData.lam
      },
      translation: activeTranslation || "Tanpa terjemah",
      babNum: activeBabNum,
      notes: newFavNote.trim() || `Bina ${activeBina}, disimpan lewat modul Kamus`,
      custom: false
    };

    // Optimistically update UI
    const updated = [newFavorite, ...favorites];
    saveFavoritesToStorage(updated);
    setNewFavNote("");
    setSaveSuccessMsg("Berhasil disimpan ke Kamus Favorit (Cloud & Lokalnya)!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);

    // Persist to Cloud DB API
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFavorite)
      });
    } catch (err) {
      console.error("Gagal sync ke Cloud DB:", err);
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    const filtered = favorites.filter((f) => f.id !== id);
    saveFavoritesToStorage(filtered);

    try {
      await fetch(`/api/favorites/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Gagal menghapus dari Cloud DB:", err);
    }
  };

  const handleSelectFavorite = (fav: DictionaryEntry) => {
    setSelectedEntry(fav);
    setViewMode("tasrif");
  };

  const handleAddManualFavorite = async (entry: {
    fa: string;
    ain: string;
    lam: string;
    babNum: number;
    translation: string;
    notes?: string;
  }) => {
    const id = `fav-custom-${entry.fa}-${entry.ain}-${entry.lam}-${Date.now()}`;
    const newFavorite: DictionaryEntry = {
      id,
      root: { fa: entry.fa, ain: entry.ain, lam: entry.lam },
      translation: entry.translation,
      babNum: entry.babNum,
      notes: entry.notes || "Disimpan manual",
      custom: true
    };

    const updated = [newFavorite, ...favorites];
    saveFavoritesToStorage(updated);

    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFavorite)
      });
    } catch (err) {
      console.error("Gagal sync ke Cloud DB:", err);
    }
  };

  const handleBulkImport = async (entries: any[]) => {
    try {
      const formatted = entries.map((e, index) => ({
        id: `fav-custom-${e.root.fa}-${e.root.ain}-${e.root.lam}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        root: e.root,
        translation: e.translation,
        babNum: e.babNum,
        notes: "Diimpor via berkas",
        custom: true
      }));

      const res = await fetch("/api/favorites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: formatted })
      });

      const json = await res.json();
      if (json && json.success) {
        setFavorites(json.data);
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(json.data));
        return { count: json.count };
      } else {
        return { count: 0, error: json.error || "Gagal menyimpan ke database cloud." };
      }
    } catch (e: any) {
      console.error("Gagal melakukan aksi pengimporan bulk:", e);
      return { count: 0, error: "Kesalahan jaringan ketika menyalin data impor." };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans selection:bg-emerald-500 selection:text-white">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-arabic text-2xl font-bold select-none shadow-md shadow-emerald-600/10">
              ص
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-gray-900 text-lg md:text-xl tracking-tight">
                  Kamus Sharaf Al-I'ilal
                </h1>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Pencarian, Desain Kustom, dan Konjugasi Morfologi Bahasa Arab Tsulatsi Mujarrad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                Mesin Utama
              </span>
              <span className="text-xs text-gray-800 font-medium">
                IilalEngine (TS Port)
              </span>
            </div>
            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-1 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* SUB-HEADER TABS FOR VIEW MODES */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl p-1 flex gap-2 max-w-md border border-gray-150">
          <button
            onClick={() => setViewMode("tasrif")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === "tasrif"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Tasrif & Analisis
          </button>
          <button
            onClick={() => setViewMode("penyimpanan")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === "penyimpanan"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Kamus Penyimpanan ({favorites.length})
          </button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {viewMode === "penyimpanan" ? (
          <KamusPenyimpananView
            favorites={favorites}
            selectedId={selectedEntry.id}
            onSelectFavorite={handleSelectFavorite}
            onDeleteFavorite={handleDeleteFavorite}
            onBulkImport={handleBulkImport}
            onAddManualFavorite={handleAddManualFavorite}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: CONTROLLERS & HISTORY (4/12 width) */}
            <section className="lg:col-span-4 space-y-6">
              
              <DictionaryList
                selectedEntryId={selectedEntry.id}
                onSelectEntry={handleSelectPreset}
              />

              {/* Quick Favorites Save Tool Box (Sederhana di bawah desainer) */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-3 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-emerald-600" />
                  Simpan lafadz ini ke Kamus Penyimpanan
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Keterangan Khusus (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Hafalan UAS sharaf..."
                      value={newFavNote}
                      onChange={(e) => setNewFavNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 bg-gray-50 cursor-text text-gray-700"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToFavorites}
                    className="w-full py-2.5 bg-gray-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Sekarang
                  </button>

                  {saveSuccessMsg && (
                    <p className="text-[10px] font-semibold text-center text-emerald-600 animate-pulse mt-1">
                      {saveSuccessMsg}
                    </p>
                  )}
                </div>
              </div>

            </section>

            {/* RIGHT COLUMN: MAIN TASRIF WORKSPACE (8/12 width) */}
            <section className="lg:col-span-8 space-y-6">
              
              {/* ACTIVE WORKSPACE HEADER BANNER CARD */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Backglow decorative */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                      Bab {activeBabNum}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeBina === "Shohih"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100 border"
                          : "bg-amber-50 text-amber-800 border-amber-100 border"
                      }`}
                    >
                      Bina {activeBina}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      Tsulatsi Mujarrad (3 Huruf)
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-gray-950 flex items-center gap-2 select-text">
                    {activeTranslation}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 select-none">
                    Akar Kata: {activeWazanData.fa} - {activeWazanData.ain} - {activeWazanData.lam}
                  </p>

                  <button
                    onClick={() => setActiveTab("ai")}
                    className="mt-3 text-[11px] font-bold text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-100/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs inline-flex"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
                    Lihat Analisis Lengkap & Tafsir AI kata "{activeTranslation.split(' ')[0]}" →
                  </button>
                </div>

                {/* Massive elegant Arabic central display root */}
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 mb-1 select-none">
                    Akar Penyelidikan
                  </div>
                  <div className="font-arabic text-4xl md:text-5xl font-black text-emerald-900 group select-all py-1 cursor-all-scroll" dir="rtl">
                    {activeWazanData.fa}ـ{activeWazanData.ain}ـ{activeWazanData.lam}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-gray-400 mt-1">
                    [ {activeWazanData.fa} + {activeWazanData.ain} + {activeWazanData.lam} ]
                  </div>
                </div>
              </div>

              {/* TAB SELECTORS BAR */}
              <div className="border-b border-gray-200 flex flex-nowrap items-center overflow-x-auto gap-4 scrollbar-hidden">
                <button
                  onClick={() => setActiveTab("istilahi")}
                  className={`py-3 px-1 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "istilahi"
                      ? "border-emerald-600 text-emerald-950 scale-[1.01]"
                      : "border-transparent text-gray-400 hover:text-gray-800"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Tasrif Istilahi (Pola Shighot)
                </button>

                <button
                  onClick={() => setActiveTab("lughowi")}
                  className={`py-3 px-1 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "lughowi"
                      ? "border-emerald-600 text-emerald-950 scale-[1.01]"
                      : "border-transparent text-gray-400 hover:text-gray-800"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Tasrif Lughowi (Tabel Dhomir)
                </button>

                <button
                  onClick={() => setActiveTab("masdar")}
                  className={`py-3 px-1 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "masdar"
                      ? "border-emerald-600 text-emerald-950 scale-[1.01]"
                      : "border-transparent text-gray-450 hover:text-gray-805"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Daftar 23 Masdar
                </button>

                <button
                  onClick={() => setActiveTab("iilal")}
                  className={`py-3 px-1 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "iilal"
                      ? "border-emerald-600 text-emerald-950 scale-[1.01]"
                      : "border-transparent text-gray-400 hover:text-gray-800"
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  Kaidah I'ilal Sharaf
                </button>

                <button
                  onClick={() => setActiveTab("ai")}
                  className={`py-3 px-1 border-b-2 font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "ai"
                      ? "border-emerald-600 text-emerald-950 scale-[1.01]"
                      : "border-transparent text-gray-400 hover:text-gray-850"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Analisis Tafsir & Semantik AI
                </button>
              </div>

              {/* TAB CONTENT RENDER CONTAINER */}
              <div className="py-2">
                {activeTab === "istilahi" && (
                  <TasrifIstilahiView tasrif={calculatedTasrif} />
                )}
                {activeTab === "lughowi" && (
                  <TasrifLughowiView
                    tasrif={calculatedTasrif}
                    fa={activeWazanData.fa}
                    ain={activeWazanData.ain}
                    lam={activeWazanData.lam}
                    bina={activeBina}
                  />
                )}
                {activeTab === "masdar" && (
                  <MasdarListView masdar23={calculatedTasrif.masdar23} />
                )}
                {activeTab === "iilal" && (
                  <IilalExplainerView
                    bina={activeBina}
                    fa={activeWazanData.fa}
                    ain={activeWazanData.ain}
                    lam={activeWazanData.lam}
                    madhi={calculatedTasrif.madhi}
                    mudhari={calculatedTasrif.mudhari}
                  />
                )}
                {activeTab === "ai" && (
                  <AiAnalysisView
                    fa={activeWazanData.fa}
                    ain={activeWazanData.ain}
                    lam={activeWazanData.lam}
                    babNum={activeBabNum}
                    bina={activeBina}
                    translation={activeTranslation}
                  />
                )}
              </div>

            </section>

          </div>
        )}
      </main>

      {/* FOOTER BAR CREDITS */}
      <footer className="max-w-7xl mx-auto px-4 mt-16 border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <div>
          <p>© 2026 Kamus Sharaf Al-I'ilal. Karya bertenaga IilalEngine Bahasa Indonesia.</p>
          <p className="mt-1">Dibuat khusus untuk pengajaran morfologi kata kerja bahasa Arab Tsulatsi Mujarrod secara modern.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="bg-slate-100 text-slate-500 font-mono px-2 py-1 rounded-md text-[10px]">
            No HMR • Pure Client Storage Offline
          </p>
        </div>
      </footer>
    </div>
  );
}
