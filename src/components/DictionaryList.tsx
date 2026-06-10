/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search, BookOpen, Star, Filter, ChevronRight } from "lucide-react";
import { DictionaryEntry } from "../types";
import { PRESET_DICTIONARY } from "../utils/dictionaryData";
import { IilalEngine } from "../utils/iilalEngine";

interface DictionaryListProps {
  selectedEntryId: string;
  onSelectEntry: (entry: DictionaryEntry) => void;
}

const BAB_DETAILS_MAP: Record<number, { title: string; pattern: string; color: string; bg: string; text: string }> = {
  1: {
    title: "Fathul-Dhammi",
    pattern: "فَعَلَ - يَفْعُلُ",
    color: "emerald",
    bg: "bg-emerald-50 text-emerald-900 border-emerald-100",
    text: "text-emerald-700"
  },
  2: {
    title: "Fathul-Kasri",
    pattern: "فَعَلَ - يَفْعِلُ",
    color: "blue",
    bg: "bg-blue-50 text-blue-900 border-blue-100",
    text: "text-blue-700"
  },
  3: {
    title: "Fathatani",
    pattern: "فَعَلَ - يَفْعَلُ",
    color: "purple",
    bg: "bg-purple-50 text-purple-900 border-purple-100",
    text: "text-purple-700"
  },
  4: {
    title: "Kasrul-Fathi",
    pattern: "فَعِلَ - يَفْعَلُ",
    color: "amber",
    bg: "bg-amber-50 text-amber-900 border-amber-100",
    text: "text-amber-700"
  },
  5: {
    title: "Dhammud-Dhammi",
    pattern: "فَعُلَ - يَفْعُلُ",
    color: "rose",
    bg: "bg-rose-50 text-rose-900 border-rose-100",
    text: "text-rose-700"
  },
  6: {
    title: "Kasratani",
    pattern: "فَعِلَ - يَفْعِلُ",
    color: "indigo",
    bg: "bg-indigo-50 text-indigo-900 border-indigo-100",
    text: "text-indigo-700"
  }
};

export default function DictionaryList({
  selectedEntryId,
  onSelectEntry,
}: DictionaryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBab, setSelectedBab] = useState<number | "all">("all");
  const [expandedLetters, setExpandedLetters] = useState<Record<string, boolean>>({});

  const toggleLetter = (babNum: number, letter: string) => {
    setExpandedLetters((prev) => ({
      ...prev,
      [`${babNum}-${letter}`]: !prev[`${babNum}-${letter}`],
    }));
  };

  const filteredEntries = useMemo(() => {
    let list = PRESET_DICTIONARY;
    
    // Filter by Bab
    if (selectedBab !== "all") {
      list = list.filter((item) => item.babNum === selectedBab);
    }

    // Filter by Search Term
    if (!searchTerm.trim()) return list;
    
    const lower = searchTerm.toLowerCase();
    return list.filter((entry) => {
      const rootStr = `${entry.root.fa}${entry.root.ain}${entry.root.lam}`;
      const rootSpaces = `${entry.root.fa} ${entry.root.ain} ${entry.root.lam}`;
      return (
        entry.translation.toLowerCase().includes(lower) ||
        entry.id.toLowerCase().includes(lower) ||
        rootStr.includes(lower) ||
        rootSpaces.includes(lower)
      );
    });
  }, [searchTerm, selectedBab]);

  // Group filtered entries by Bab, and then by their initial letter (Fa' Fi'il)
  const groupedEntries = useMemo(() => {
    const groups: Record<number, Record<string, DictionaryEntry[]>> = {};
    filteredEntries.forEach((entry) => {
      const bab = entry.babNum;
      const firstLetter = entry.root.fa;
      if (!groups[bab]) {
        groups[bab] = {};
      }
      if (!groups[bab][firstLetter]) {
        groups[bab][firstLetter] = [];
      }
      groups[bab][firstLetter].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  // Sorted Babs present in the search result
  const activeBabs = useMemo(() => {
    return Object.keys(groupedEntries)
      .map(Number)
      .sort((a, b) => a - b);
  }, [groupedEntries]);

  return (
    <div id="dictionary-list-card" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm md:text-base">Kamus Kata Kerja Pilihan</h2>
          <p className="text-xs text-gray-500">Pilih akar kata (tsulatsi mujarrad) default</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari terjemah, latin, atau huruf Arab..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-hidden focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all cursor-text text-gray-800"
        />
      </div>

      {/* Horizontal Scroll Bab Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        <button
          onClick={() => setSelectedBab("all")}
          className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
            selectedBab === "all"
              ? "bg-gray-900 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Semua
        </button>
        {[1, 2, 3, 4, 5, 6].map((num) => {
          const detail = BAB_DETAILS_MAP[num];
          const isSelected = selectedBab === num;
          return (
            <button
              key={`bab-tab-${num}`}
              onClick={() => setSelectedBab(num)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 border border-emerald-100/40"
              }`}
            >
              Bab {num}
            </button>
          );
        })}
      </div>

      {/* Grouped Entries List */}
      <div className="max-h-[350px] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {activeBabs.length > 0 ? (
          activeBabs.map((babNum) => {
            const babInfo = BAB_DETAILS_MAP[babNum];
            const letterGroups = groupedEntries[babNum] || {};
            const initialLetters = Object.keys(letterGroups).sort();

            return (
              <div key={`group-bab-${babNum}`} className="space-y-3">
                {/* Bab Header */}
                <div className={`p-2 rounded-lg border flex items-center justify-between shadow-2xs ${babInfo.bg}`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Bab {babNum}: {babInfo.title}
                    </span>
                  </div>
                  <span className="font-arabic text-xs font-bold bg-white/70 px-2 py-0.5 rounded-md">
                    {babInfo.pattern}
                  </span>
                </div>

                {/* Sub-groups by Initial Letter */}
                <div className="space-y-3 pl-1">
                  {initialLetters.map((letter) => {
                    const letterEntries = letterGroups[letter] || [];
                    const isExpanded = !!expandedLetters[`${babNum}-${letter}`] || searchTerm.trim().length > 0;
                    return (
                      <div key={`bab-${babNum}-letter-${letter}`} className="space-y-1.5 border border-slate-100/60 rounded-xl p-1.5 bg-slate-50/10">
                        {/* Letter Sub-header */}
                        <button
                          type="button"
                          onClick={() => toggleLetter(babNum, letter)}
                          className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-arabic text-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg shadow-3xs select-none">
                              {letter}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {letterEntries.length} Lafadz
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-sans">
                              {isExpanded ? "Tutup ▲" : "Buka ▼"}
                            </span>
                          </div>
                        </button>

                        {/* Words starting with this letter */}
                        {isExpanded && (
                          <div className="space-y-1.5 pl-2 pt-1.5 border-l border-emerald-500/20">
                            {letterEntries.map((entry) => {
                              const isSelected = entry.id === selectedEntryId;
                              const binaType = IilalEngine.detectBina(entry.root.fa, entry.root.ain, entry.root.lam);

                              return (
                                <button
                                  key={entry.id}
                                  id={`preset-btn-${entry.id}`}
                                  onClick={() => onSelectEntry(entry)}
                                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 scale-[0.99] shadow-2xs"
                                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700 bg-white"
                                  }`}
                                >
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-semibold text-xs md:text-sm truncate">
                                      {entry.translation}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                                          binaType === "Shohih"
                                            ? "bg-slate-100 text-slate-700"
                                            : "bg-amber-100/50 text-amber-800"
                                        }`}
                                      >
                                        Bina {binaType}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right pl-2 flex items-center gap-1.5">
                                    <div>
                                      <div className="font-arabic text-md font-bold text-gray-900 group-hover:scale-105 transition-transform dir-rtl select-none">
                                        {entry.root.fa}ـ{entry.root.ain}ـ{entry.root.lam}
                                      </div>
                                      <span className="text-[8px] text-gray-400 font-mono block">
                                        {entry.root.fa}-{entry.root.ain}-{entry.root.lam}
                                      </span>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-emerald-500 translate-x-0.5" : "text-gray-300"}`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs">
            Tidak ada kata kerja yang cocok dengan pencarian.
          </div>
        )}
      </div>
    </div>
  );
}
