/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertCircle, BookOpen, Quote, HelpCircle } from "lucide-react";

interface AiAnalysisViewProps {
  fa: string;
  ain: string;
  lam: string;
  babNum: number;
  bina: string;
  translation: string;
}

export default function AiAnalysisView({
  fa,
  ain,
  lam,
  babNum,
  bina,
  translation,
}: AiAnalysisViewProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const cachedKey = `${fa}-${ain}-${lam}-${babNum}-${bina}`;

  const fetchAnalysis = async (force = false) => {
    setLoading(true);
    setError("");
    if (!force) {
      // Check simple session cache to prevent excessive re-fetching on tab toggling
      const cached = sessionStorage.getItem(`ai-explain-${cachedKey}`);
      if (cached) {
        setExplanation(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const url = `/api/gemini/explain?fa=${encodeURIComponent(fa)}&ain=${encodeURIComponent(ain)}&lam=${encodeURIComponent(lam)}&babNum=${babNum}&bina=${encodeURIComponent(bina)}&translation=${encodeURIComponent(translation)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.success && json.explanation) {
        setExplanation(json.explanation);
        sessionStorage.setItem(`ai-explain-${cachedKey}`, json.explanation);
      } else {
        setError(json.explanation || "Gagal memperoleh penjelasan lengkap dari asisten AI.");
      }
    } catch (err) {
      setError("Kesalahan jaringan sewaktu memanggil Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [cachedKey]);

  // A high-performance, beautiful handcrafted Markdown and Arabic text parser
  const renderParsedContent = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Headers (e.g. ### Header or ## Header)
      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
        const headerText = trimmed.replace(/^#+\s*/, "");
        return (
          <h4
            key={idx}
            className="text-emerald-950 font-black text-sm md:text-base border-b border-emerald-100/55 pb-1 mt-6 mb-3 flex items-center gap-2 select-text"
          >
            <span className="w-1.5 h-4 bg-emerald-600 rounded-xs" />
            {parseInlineStyles(headerText)}
          </h4>
        );
      }

      // Check for bullet points (e.g. - list or * list)
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const bulletText = trimmed.replace(/^[-*]\s*/, "");
        return (
          <div key={idx} className="flex gap-2.5 items-start pl-2 py-1 select-text">
            <span className="text-emerald-600 font-bold shrink-0 text-xs mt-0.5">•</span>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed flex-1">
              {parseInlineStyles(bulletText)}
            </p>
          </div>
        );
      }

      // Check for blockquote or Quran/Hadith lines starting with >
      if (trimmed.startsWith(">")) {
        const quoteText = trimmed.replace(/^>\s*/, "");
        return (
          <div
            key={idx}
            className="my-3 pl-4 pr-3 py-3 bg-emerald-50/30 border-l-4 border-emerald-500 rounded-r-xl font-medium text-xs md:text-sm text-emerald-900 leading-relaxed italic flex gap-2.5 items-start select-text"
          >
            <Quote className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">{parseInlineStyles(quoteText)}</div>
          </div>
        );
      }

      // Regular paragraph or standard lines
      return (
        <p key={idx} className="text-xs md:text-sm text-gray-600 leading-relaxed py-1 select-text">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });
  };

  // Safe inline formatter for bold text and Arabic scripts inside lines
  const parseInlineStyles = (rawText: string) => {
    // Regex to extract "**bold**" sections
    const parts = rawText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-gray-950">
            {checkForArabic(boldText)}
          </strong>
        );
      }
      return <React.Fragment key={index}>{checkForArabic(part)}</React.Fragment>;
    });
  };

  // Scan and highlight Arabic letters so they use the correct font and RTL direction
  const checkForArabic = (text: string) => {
    // Check if the string contains Arabic characters
    const arabicRegex = /([\u0600-\u06FF\u0750-\u077F]+)/g;
    const segments = text.split(arabicRegex);

    if (segments.length === 1) return text;

    return segments.map((seg, sIdx) => {
      if (/[\u0600-\u06FF\u0750-\u077F]/.test(seg)) {
        return (
          <span
            key={`ara-${sIdx}`}
            className="font-arabic text-lg font-bold text-emerald-900 border-b border-emerald-100/40 px-0.5 mx-1 select-all"
            dir="rtl"
          >
            {seg}
          </span>
        );
      }
      return seg;
    });
  };

  return (
    <div id="ai-analysis-panel" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm md:text-base leading-snug">
              Analisis Tafsir & Semantik AI
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400">
              Laporan Linguistik, Sastra, & Transformasi I'ilal Sharaf bertenaga Gemini 3.5
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAnalysis(true)}
          disabled={loading}
          className="p-1 px-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-lg text-[10px] text-gray-500 hover:text-emerald-800 transition-all font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Segarkan Analisis"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-100 rounded-full w-2/5 animate-pulse" />
              <div className="h-2 bg-slate-100 rounded-full w-3/5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-2.5 bg-slate-100 rounded-full w-full animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded-full w-11/12 animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded-full w-10/12 animate-pulse" />
          </div>
          <div className="p-4 bg-emerald-50/20 border border-emerald-50/50 rounded-xl space-y-2">
            <div className="h-3 bg-emerald-100/50 rounded-full w-1/4 animate-pulse" />
            <div className="h-2 bg-emerald-100/50 rounded-full w-full animate-pulse" />
            <div className="h-2 bg-emerald-100/50 rounded-full w-5/6 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-900 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs md:text-sm">Gagal Mengunduh Analisis</p>
            <p className="text-[11px] text-rose-700/90">{error}</p>
            <button
              onClick={() => fetchAnalysis(true)}
              className="mt-2 text-[10px] font-bold text-rose-900 underline hover:text-rose-950 block"
            >
              Coba Hubungkan Kembali
            </button>
          </div>
        </div>
      )}

      {/* Main content display */}
      {!loading && !error && explanation && (
        <div className="prose max-w-none text-xs md:text-sm text-gray-700 py-2 space-y-3 font-sans select-text">
          {renderParsedContent(explanation)}
        </div>
      )}

      {/* Footnote information card */}
      {!loading && !error && (
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-gray-400 select-none">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-normal">
            Catatan: Analisis dihasilkan secara adaptif berdasarkan kaidah Sharaf, Balaghah, dan Nahwu klasik. Anda dapat menyalin teks bahasa Arab secara akurat dengan mengeklik / menyeleksi kata kerja yang bergaris bawah.
          </p>
        </div>
      )}
    </div>
  );
}
