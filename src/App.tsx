/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  Animated,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import {
  Search,
  BookOpen,
  Award,
  CreditCard,
  Plus,
  Check,
  X,
  User,
  Edit3,
  Bookmark,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileText,
  BookmarkCheck,
  ChevronLeft,
  Settings,
  Bell,
  Trash2,
  RefreshCw,
  LockKeyhole,
  ChevronDown,
  ChevronUp,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DictionaryEntry, TasrifIstilahi, DataWazan } from "./types";
import {
  PRESET_DICTIONARY,
  WAZAN_TEMPLATES,
  getVocalizedRoot,
} from "./utils/dictionaryData";
import { IilalEngine } from "./utils/iilalEngine";
import { analyzeSifatMusyabihatPlural, getPluralBinaKey, substituteSifatPattern } from "./utils/sifatMusyabihatPlural";
import { analyzeIsimFail as analyzeIsimFailPlural } from "./utils/isimFailPlural";
import { analyzeIsimMafulPlural } from "./utils/isimMafulPlural";
import {
  analyzeIsimZamanMakanPlural,
  analyzeIsimAlatPlural,
} from "./utils/isimZamanMakanAlatPlural";

// Core Arabic Views
import TabTasrifIstilahi from "./components/TasrifIstilahiView";
import TabTasrifLughowi from "./components/TasrifLughowiView";
import TabShorofMasdarTable from "./components/ShorofMasdarTableView";

export function computeAsal(
  fa: string,
  ain: string,
  lam: string,
  babNum: number,
): string {
  const f = (fa || "").replace(/[\u064b-\u065f]/g, "").trim();
  const a = (ain || "").replace(/[\u064b-\u065f]/g, "").trim();
  const l = (lam || "").replace(/[\u064b-\u065f]/g, "").trim();
  if (!f || !a || !l) return "—";

  if (babNum === 4 || babNum === 6) {
    return `${f}َ${a}ِ${l}َ`; // e.g. رَضِوَ, خَوِفَ
  } else if (babNum === 5) {
    return `${f}َ${a}ُ${l}َ`; // e.g. شَرُفَ, سَرُوَ
  } else {
    return `${f}َ${a}َ${l}َ`; // e.g. قَوَلَ, بَيَعَ, دَعَوَ, مَدَدَ
  }
}

// In-Memory synchronous storage fallback synchronized with AsyncStorage
let memoryStorage: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    memoryStorage[key] = value;
    try {
      AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("AsyncStorage.setItem failed:", e);
    }
  },
};

const localStorage = {
  getItem: (key: string): string | null => {
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    memoryStorage[key] = value;
    try {
      AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("AsyncStorage.setItem failed:", e);
    }
  },
};

// Colors palette definition for global theme integration
const ThemeConfig = {
  dark: {
    bg: "#020617",
    textColor: "#cbd5e1",
    header: "#0f172a",
    headerText: "#ffffff",
    subText: "#94a3b8",
    card: "#0f172a",
    cardBorder: "#1e293b",
    inputBg: "#020617",
    inputBorder: "#1e293b",
    inputText: "#ffffff",
    inputPlaceholder: "#64748b",
    border: "#1e293b",
    badgeBg: "rgba(2, 6, 23, 0.6)",
    cardInner: "rgba(2, 6, 23, 0.2)",
    cardInnerBorder: "rgba(30, 41, 59, 0.65)",
    tabList: "#020617",
    tabBtnActive: "#059669",
    tabBtnActiveBorder: "rgba(16, 185, 129, 0.2)",
    tabBtnActiveText: "#ffffff",
    tabBtnInactiveText: "#94a3b8",
    accentText: "#34d399",
    accentBorder: "#10b981",
    presetBtnSelBg: "#020617",
    presetBtnSelBorder: "#10b981",
    presetBtnSelText: "#34d399",
    presetBtnNorBg: "rgba(2, 6, 23, 0.4)",
    presetBtnNorBorder: "#1e293b",
    presetBtnNorText: "#94a3b8",
    groupHeaderBadge: "#020617",
    groupHeaderBadgeText: "#34d399",
    groupHeaderLabel: "#64748b",
    groupHeaderTitle: "#10b981",
    highlightTitle: "#fbbf24",
    panelInnerBg: "rgba(15, 23, 42, 0.4)",
    panelInnerBorder: "rgba(30, 41, 59, 0.6)",
    textLabel: "#64748b",
    profileBg: "rgba(2, 6, 23, 0.6)",
    profileBorder: "#1e293b",
  },
  light: {
    bg: "#f8fafc",
    textColor: "#334155",
    header: "#ffffff",
    headerText: "#0f172a",
    subText: "#64748b",
    card: "#ffffff",
    cardBorder: "#cbd5e1",
    inputBg: "#f8fafc",
    inputBorder: "#cbd5e1",
    inputText: "#0f172a",
    inputPlaceholder: "#94a3b8",
    border: "#e2e8f0",
    badgeBg: "rgba(241, 245, 249, 0.6)",
    cardInner: "#f8fafc",
    cardInnerBorder: "#e2e8f0",
    tabList: "#f1f5f9",
    tabBtnActive: "#059669",
    tabBtnActiveBorder: "rgba(16, 185, 129, 0.2)",
    tabBtnActiveText: "#ffffff",
    tabBtnInactiveText: "#475569",
    accentText: "#047857",
    accentBorder: "#059669",
    presetBtnSelBg: "#f0fdf4",
    presetBtnSelBorder: "#059669",
    presetBtnSelText: "#047857",
    presetBtnNorBg: "#f8fafc",
    presetBtnNorBorder: "#e2e8f0",
    presetBtnNorText: "#475569",
    groupHeaderBadge: "#f1f5f9",
    groupHeaderBadgeText: "#047857",
    groupHeaderLabel: "#94a3b8",
    groupHeaderTitle: "#059669",
    highlightTitle: "#b45309",
    panelInnerBg: "rgba(241, 245, 249, 0.6)",
    panelInnerBorder: "#cbd5e1",
    textLabel: "#94a3b8",
    profileBg: "#f1f5f9",
    profileBorder: "#cbd5e1",
  },
  green: {
    bg: "#022c22",
    textColor: "#d1fae5",
    header: "rgba(6, 78, 59, 0.9)",
    headerText: "#fef3c7",
    subText: "rgba(110, 231, 183, 0.8)",
    card: "rgba(6, 78, 59, 0.4)",
    cardBorder: "rgba(6, 95, 70, 0.8)",
    inputBg: "#022c22",
    inputBorder: "#065f46",
    inputText: "#fef3c7",
    inputPlaceholder: "rgba(5, 150, 105, 0.8)",
    border: "rgba(6, 95, 70, 0.8)",
    badgeBg: "rgba(2, 44, 34, 0.6)",
    cardInner: "rgba(2, 44, 34, 0.4)",
    cardInnerBorder: "rgba(6, 78, 59, 0.6)",
    tabList: "rgba(2, 44, 34, 0.7)",
    tabBtnActive: "#d97706",
    tabBtnActiveBorder: "rgba(245, 158, 11, 0.2)",
    tabBtnActiveText: "#022c22",
    tabBtnInactiveText: "#6ee7b7",
    accentText: "#fbbf24",
    accentBorder: "#f59e0b",
    presetBtnSelBg: "#022c22",
    presetBtnSelBorder: "#f59e0b",
    presetBtnSelText: "#fcd34d",
    presetBtnNorBg: "rgba(2, 44, 34, 0.3)",
    presetBtnNorBorder: "rgba(6, 78, 59, 0.7)",
    presetBtnNorText: "#6ee7b7",
    groupHeaderBadge: "#022c22",
    groupHeaderBadgeText: "#fcd34d",
    groupHeaderLabel: "rgba(52, 211, 153, 0.8)",
    groupHeaderTitle: "#fbbf24",
    highlightTitle: "#fcd34d",
    panelInnerBg: "rgba(2, 44, 34, 0.5)",
    panelInnerBorder: "rgba(6, 78, 59, 0.6)",
    textLabel: "rgba(52, 211, 153, 0.8)",
    profileBg: "rgba(2, 44, 34, 0.6)",
    profileBorder: "rgba(6, 78, 59, 0.7)",
  },
};

interface BabInfo {
  vocal: string;
  ringkas: string;
  karakteristik: string;
  contoh_lain: string;
}

function getBabExplanation(bab: number): BabInfo {
  switch (bab) {
    case 1:
      return {
        vocal: "فَعَلَ - يَفْعُلُ (Fath-Dhammi)",
        ringkas:
          "Vokal fathah di fi'il madhi berubah menjadi dhammah di fi'il mudhari. Cocok untuk tindakan aktif dinamis.",
        karakteristik:
          "Bab 1 didominasi oleh kata kerja transitif (muta'addi) yang menggambarkan perbuatan fisik aktif, perubahan kondisi bertahap, atau tindakan terarah.",
        contoh_lain:
          "نَصَرَ - يَنْصُرُ (Menolong), كَتَبَ - يَكْتُبُ (Menulis).",
      };
    case 2:
      return {
        vocal: "فَعَلَ - يَفْعِلُ (Fath-Kasri)",
        ringkas:
          "Vokal fathah di fi'il madhi berubah menjadi kasrah di fi'il mudhari. Populer untuk gerakan terukur.",
        karakteristik:
          "Bab 2 sering memuat kata kerja bermakna gerakan terukur, suara terputus, tindakan fisik langsung, atau perlakuan terhadap objek.",
        contoh_lain: "ضَرَبَ - يَضْرِبُ (Memukul), جَلَسَ - يَجْلِسُ (Duduk).",
      };
    case 3:
      return {
        vocal: "فَعَلَ - يَفْعَلُ (Fathatani)",
        ringkas:
          "Kedua fi'il menggunakan fathah. Syarat mutlak: Ain atau Lam fi'il harus berupa salah satu huruf halq (tenggorokan).",
        karakteristik:
          "Morfologi mengharuskan terdapat 'Huruf Halq' (ء, هـ, ع, ح, غ, kh/خ, gh/غ) pada rukun Ain atau Lam kata kerja agar artikulasi fathah ganda sepadan dan fasih.",
        contoh_lain: "فَتَحَ - يَفْتَحُ (Membuka), ذَهَبَ - يَذْهَبُ (Pergi).",
      };
    case 4:
      return {
        vocal: "فَعِلَ - يَفْعَلُ (Kasrul-Fathi)",
        ringkas:
          "Vokal kasrah di fi'il madhi berubah menjadi fathah di fi'il mudhari. Ideal untuk emosi dan sifat sementara.",
        karakteristik:
          "Fokus utama Bab 4 adalah mengekspresikan emosi batiniah (sedih, gembira), sifat fisik sementara (kenyang, haus), warna, kecacatan raga, atau kepemilikan penampilan luar.",
        contoh_lain:
          "عَلِمَ - يَعْلَمُ (Mengetahui), فَرِحَ - يَفْرَحُ (Gembira).",
      };
    case 5:
      return {
        vocal: "فَعُلَ - يَفْعُلُ (Dhammud-Dhammi)",
        ringkas:
          "Kedua fi'il menggunakan dhammah. Seluruh kata berkarakter lazim (intransitif), melambangkan sifat bawaan permanen.",
        karakteristik:
          "Secara fungsional, semua fi'il di Bab 5 bersifat lazim (tidak butuh objek) dan mencerminkan sifat bawaan lahiriah, watak permanen, keelokan moral, atau tabiat dasar yang melekat kuat pada subjek.",
        contoh_lain:
          "حَسُنَ - يَحْسُنُ (Menjadi Baik), كَبُرَ - يَكْبُرُ (Menjadi Besar).",
      };
    case 6:
      return {
        vocal: "فَعِلَ - يَفْعِلُ (Kasratani)",
        ringkas:
          "Kedua fi'il menggunakan kasrah. Bab paling langka, sebagian besar berkaitan dengan aktivitas mental dan kepemilikan.",
        karakteristik:
          "Bab paling sedikit dan langka dalam kamus sharaf Arab, sering kali merujuk pada pemahaman mental, kognisi batin, atau pewarisan hukum yang berkelanjutan.",
        contoh_lain: "حَسِبَ - يَحْسِبُ (Mengira), وَرِثَ - يَرِثُ (Mewarisi).",
      };
    default:
      return {
        vocal: "فَعَلَ - يَفْعُلُ",
        ringkas: "Pola penyesuaian harakat standard.",
        karakteristik: "Menyesuaikan dengan karakteristik standar pola mufrad.",
        contoh_lain: "—",
      };
  }
}

export default function App() {
  
  // Main Selection and Tab States
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(
    PRESET_DICTIONARY[0],
  );
  const [activeTab, setActiveTab] = useState<
    "istilahi" | "lughowi" | "masdar" | "sifat" | "jama" | "iilal"
  >("istilahi");
  const [activeJamakTab, setActiveJamakTab] = useState<
    "fail" | "maful" | "zamanmakan" | "alat"
  >("fail");
  const [lafadzSize, setLafadzSize] = useState<
    "small" | "medium" | "large" | "xlarge"
  >("medium");

  // Bab Info Modal State for Beginners
  const [showBabInfoModal, setShowBabInfoModal] = useState<boolean>(false);

  // Premium Activation States
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [billingPlan, setBillingPlan] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Offline-Online Sync Favorites State
  const [favorites, setFavorites] = useState<any[]>([]);

  // User Customize Account States
  const [username, setUsername] = useState<string>("Tamu Mulia");
  const [profilePhoto, setProfilePhoto] = useState<string>("avatar1");
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // App Theme State
  const [appTheme, setAppTheme] = useState<"dark" | "light" | "green">("dark");

  const API_BASE_URL = "https://ais-dev-gacxcqf4yxds5b6vtryqld-859970137966.asia-east1.run.app";

  const fetchFavorites = async () => {
    try {
      const stored = safeStorage.getItem("sdr_local_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        const initial = [
          {
            id: "fav-nasara",
            root: { fa: "ن", ain: "ص", lam: "ر" },
            translation: "Menolong / Membantu",
            babNum: 1,
            notes: "Tersimpan otomatis di penyimpanan lokal.",
            custom: false
          }
        ];
        safeStorage.setItem("sdr_local_favorites", JSON.stringify(initial));
        setFavorites(initial);
      }
    } catch (err) {
      console.warn("Gagal mengambil data favorites:", err);
    }
  };

  // Synchronize persisted preferences on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const keys = [
          "sdr_premium_unlocked",
          "sdr_username",
          "sdr_profile_photo",
          "sdr_app_theme",
          "sdr_local_favorites"
        ];
        const pairs = await AsyncStorage.multiGet(keys);
        pairs.forEach(([key, val]) => {
          if (val !== null) {
            memoryStorage[key] = val;
            if (key === "sdr_premium_unlocked") {
              setIsPremium(val === "true");
            } else if (key === "sdr_username") {
              setUsername(val);
            } else if (key === "sdr_profile_photo") {
              setProfilePhoto(val);
            } else if (key === "sdr_app_theme") {
              setAppTheme(val as any);
            } else if (key === "sdr_local_favorites") {
              try {
                setFavorites(JSON.parse(val));
              } catch (e) {}
            }
          }
        });
      } catch (e) {
        console.warn("loadPersistedData failed:", e);
      }
    };
    loadPersistedData().then(() => {
      fetchFavorites();
    });
  }, []);

  const isCurrentlyFavorited = useMemo(() => {
    return favorites.some(
      (f) =>
        (f.root?.fa === selectedEntry.root.fa &&
          f.root?.ain === selectedEntry.root.ain &&
          f.root?.lam === selectedEntry.root.lam) ||
        (f.fa === selectedEntry.root.fa &&
          f.ain === selectedEntry.root.ain &&
          f.lam === selectedEntry.root.lam)
    );
  }, [favorites, selectedEntry]);

  const toggleFavorite = async () => {
    if (isCurrentlyFavorited) {
      const remaining = favorites.filter(
        (f) =>
          !((f.root?.fa === selectedEntry.root.fa &&
            f.root?.ain === selectedEntry.root.ain &&
            f.root?.lam === selectedEntry.root.lam) ||
          (f.fa === selectedEntry.root.fa &&
            f.ain === selectedEntry.root.ain &&
            f.lam === selectedEntry.root.lam))
      );
      safeStorage.setItem("sdr_local_favorites", JSON.stringify(remaining));
      setFavorites(remaining);
      setToastMsg("Dihapus dari daftar favorit!");
    } else {
      const newFav = {
        id: selectedEntry.id || `fav-local-${Date.now()}`,
        root: selectedEntry.root,
        translation: selectedEntry.translation,
        babNum: selectedEntry.babNum,
        notes: "Tersimpan di Penyimpanan Lokal",
        custom: false
      };
      const updated = [newFav, ...favorites];
      safeStorage.setItem("sdr_local_favorites", JSON.stringify(updated));
      setFavorites(updated);
      setToastMsg("Berhasil disimpan ke daftar favorit lokal!");
    }
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleSetTheme = (theme: "dark" | "light" | "green") => {
    setAppTheme(theme);
    safeStorage.setItem("sdr_app_theme", theme);
  };

  // Collapsed Groups State for Side Navigation (Buka Tutup)
  const [collapsedBabs, setCollapsedBabs] = useState<Record<number, boolean>>({});
  const [collapsedBinas, setCollapsedBinas] = useState<Record<string, boolean>>({});
  const [collapsedHijaiyahs, setCollapsedHijaiyahs] = useState<Record<string, boolean>>({});

  // Search Presets State
  const [searchQuery, setSearchQuery] = useState("");
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(PRESET_DICTIONARY);
  const [presetGroupMode, setPresetGroupMode] = useState<
    "bab" | "bina" | "hijaiyah"
  >("bab");
  const [isHijaiyahPopupOpen, setIsHijaiyahPopupOpen] = useState(false);
  const [directPopupEntry, setDirectPopupEntry] = useState<DictionaryEntry | null>(null);
  const [onlineEntries, setOnlineEntries] = useState<DictionaryEntry[]>([]);

  // Helper to check if entry has sifat musyabihat and more than 1 masdar
  const hasMultipleMasdarsAndSifat = (entry: DictionaryEntry): boolean => {
    if (!entry.sifatMusyabihat) return false;
    const masdarText = (entry.masdarSamai || "") + " " + (entry.masdarQiyasi || "");
    const parts = masdarText.split(/[\/,]/).map(x => x.trim()).filter(x => x.length > 0);
    return parts.length > 1;
  };

  // Helper to check if the Sifat Musyabihat plural does not follow the 11 allowed patterns
  const hasNonStandardSifatPlural = (entry: DictionaryEntry): boolean => {
    if (!entry.sifatMusyabihat) return false;
    
    let pluralData;
    try {
      pluralData = analyzeSifatMusyabihatPlural(entry);
    } catch (e) {
      console.warn("Gagal menganalisis jamak sifat musyabihat:", e);
      return false;
    }
    
    const generatedWords: string[] = [];
    const extractWords = (str: string) => {
      if (!str || str === "—" || str === "-") return;
      str.split(/[\/,]/).forEach(w => {
        const trimmed = w.trim();
        if (trimmed) generatedWords.push(trimmed);
      });
    };
    
    extractWords(pluralData.katsroh);
    extractWords(pluralData.qillah);
    extractWords(pluralData.muntahal);
    
    if (generatedWords.length === 0) return false;
    
    const allowedPatterns = [
      "فُعَلَاءُ", 
      "أَفْعِلَاءُ", 
      "فِعَالٌ", 
      "فُعْلٌ", 
      "أَفْعَالٌ", 
      "فُعُلٌ", 
      "فَعِلُونَ", 
      "مَفَاعِلُ", 
      "فَعَالَى", 
      "فُعُولٌ", 
      "فُعَالَى"
    ];
    
    const binaKey = getPluralBinaKey(entry.bina || "Shohih");
    
    // Substitute roots in allowed patterns
    const allowedWords = allowedPatterns.map(pattern => 
      substituteSifatPattern(pattern, entry.root.fa, entry.root.ain, entry.root.lam, binaKey)
    );
    
    // Normalize to compare
    const normalizedAllowed = allowedWords.map(w => w.replace(/[\u064b-\u065f]/g, "").trim());
    
    for (const word of generatedWords) {
      const normWord = word.replace(/[\u064b-\u065f]/g, "").trim();
      if (!normalizedAllowed.includes(normWord)) {
        return true; // Non-compliant detected!
      }
    }
    
    return false;
  };

  const checkAndSaveWordToDatabase = async (entry: DictionaryEntry) => {
    const cond1 = hasMultipleMasdarsAndSifat(entry);
    const cond2 = hasNonStandardSifatPlural(entry);

    if (cond1 || cond2) {
      console.log(`[Database Sync] Menyimpan otomatis lafadz "${entry.id}" karena memenuhi syarat:`, { cond1, cond2 });
      try {
        const newFav = {
          id: entry.id,
          root: entry.root,
          translation: entry.translation,
          babNum: entry.babNum,
          notes: cond1 
            ? "Tersimpan Otomatis: Memiliki Sifat Musyabihat & Masdar > 1" 
            : "Tersimpan Otomatis: Jamak Sifat Musyabihat Tidak Standard",
          custom: false
        };
        
        const currentStored = safeStorage.getItem("sdr_local_favorites");
        let currentFavs: any[] = currentStored ? JSON.parse(currentStored) : [];
        const exists = currentFavs.some(
          f => (f.root?.fa === entry.root.fa && f.root?.ain === entry.root.ain && f.root?.lam === entry.root.lam) ||
               (f.fa === entry.root.fa && f.ain === entry.root.ain && f.lam === entry.root.lam)
        );
        if (!exists) {
          currentFavs = [newFav, ...currentFavs];
          safeStorage.setItem("sdr_local_favorites", JSON.stringify(currentFavs));
          setFavorites(currentFavs);
        }
      } catch (err) {
        console.warn("Gagal menyimpan otomatis ke local favorites:", err);
      }
    }
  };

  // Run automatic checks on startup for all preset dictionary items
  useEffect(() => {
    const checkAllPresets = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      for (const entry of dictionary) {
        const cond1 = hasMultipleMasdarsAndSifat(entry);
        const cond2 = hasNonStandardSifatPlural(entry);
        if (cond1 || cond2) {
          const exists = favorites.some(
            f => (f.root?.fa === entry.root.fa && f.root?.ain === entry.root.ain && f.root?.lam === entry.root.lam) ||
                 (f.fa === entry.root.fa && f.ain === entry.root.ain && f.lam === entry.root.lam)
          );
          if (!exists) {
            await checkAndSaveWordToDatabase(entry);
          }
        }
      }
    };
    if (favorites.length > 0) {
      checkAllPresets();
    }
  }, [favorites.length, dictionary]);

  // Periodically fetch updated lafadz database online to detect additions/updates
  const fetchOnlineEntries = async () => {
    try {
      const url = `${API_BASE_URL}/api/lafadz-db`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data)) {
          const mapped: DictionaryEntry[] = result.data.map(
            (item: any, idx: number) => {
              const rootStr = `${item.fa}${item.ain}${item.lam}`;
              return {
                id: item.id || `db-${rootStr}-${idx}`,
                root: {
                  fa: item.fa,
                  ain: item.ain,
                  lam: item.lam,
                },
                translation: item.translation,
                babNum: Number(item.babNum) || 1,
                notes: item.explanation || item.notes,
                sifatMusyabihat: item.sifatMusyabihat,
                sifatMusyabihatPlural: item.sifatMusyabihatPlural,
                isimFailPlural: item.isimFailPlural,
                isimMafulPlural: item.isimMafulPlural,
                isimZamanMakanPlural: item.isimZamanMakanPlural,
                isimAlatPlural: item.isimAlatPlural,
                bina: item.bina,
                asal:
                  item.asal ||
                  computeAsal(
                    item.fa,
                    item.ain,
                    item.lam,
                    Number(item.babNum) || 1,
                  ),
                shorof: item.shorof,
              };
            },
          );
          setOnlineEntries(mapped);
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil data lafadz online:", err);
    }
  };

  useEffect(() => {
    fetchOnlineEntries();
    const interval = setInterval(fetchOnlineEntries, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Sync and display newly added online entries or the latest database entries
  useEffect(() => {
    if (onlineEntries.length > 0) {
      const presetMap = new Map(
        PRESET_DICTIONARY.map(
          (e) => [`${e.root.fa}_${e.root.ain}_${e.root.lam}_${e.babNum}`, e],
        ),
      );

      // Update the dictionary state with any updated entries
      setDictionary((prevDict) => {
        return prevDict.map((dictItem) => {
          const key = `${dictItem.root.fa}_${dictItem.root.ain}_${dictItem.root.lam}_${dictItem.babNum}`;
          const matchingUpdate = onlineEntries.find(
            (e) => `${e.root.fa}_${e.root.ain}_${e.root.lam}_${e.babNum}` === key
          );
          if (matchingUpdate) {
            const isUpdated = 
              dictItem.translation !== matchingUpdate.translation ||
              (dictItem.masdarSamai || "") !== (matchingUpdate.masdarSamai || "") ||
              (dictItem.sifatMusyabihat || "") !== (matchingUpdate.sifatMusyabihat || "") ||
              (dictItem.bina || "") !== (matchingUpdate.bina || "");
            if (isUpdated) {
              return {
                ...dictItem,
                ...matchingUpdate,
                id: dictItem.id
              };
            }
          }
          return dictItem;
        });
      });

      // If the selected entry was updated, update it in state too
      setSelectedEntry((prevSelected) => {
        const key = `${prevSelected.root.fa}_${prevSelected.root.ain}_${prevSelected.root.lam}_${prevSelected.babNum}`;
        const matchingUpdate = onlineEntries.find(
          (e) => `${e.root.fa}_${e.root.ain}_${e.root.lam}_${e.babNum}` === key
        );
        if (matchingUpdate) {
          const isUpdated = 
            prevSelected.translation !== matchingUpdate.translation ||
            (prevSelected.masdarSamai || "") !== (matchingUpdate.masdarSamai || "") ||
            (prevSelected.sifatMusyabihat || "") !== (matchingUpdate.sifatMusyabihat || "") ||
            (prevSelected.bina || "") !== (matchingUpdate.bina || "");
          if (isUpdated) {
            return {
              ...prevSelected,
              ...matchingUpdate,
              id: prevSelected.id
            };
          }
        }
        return prevSelected;
      });
    }
  }, [onlineEntries]);

  const handleNavigateToLetter = (letter: string) => {
    setIsHijaiyahPopupOpen(false);
    setPresetGroupMode("hijaiyah");
    setCollapsedHijaiyahs((prev) => ({
      ...prev,
      [letter]: false,
    }));
  };

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return dictionary;
    const query = searchQuery.trim().toLowerCase();
    return dictionary.filter((entry) => {
      const translationMatch = entry.translation.toLowerCase().includes(query);
      const latinRoot =
        `${entry.root.fa} ${entry.root.ain} ${entry.root.lam}`.toLowerCase();
      const latinRootMatch = latinRoot.includes(query);
      const arabicRoot = `${entry.root.fa}${entry.root.ain}${entry.root.lam}`;
      const arabicMatch = arabicRoot.includes(query);
      return translationMatch || latinRootMatch || arabicMatch;
    });
  }, [searchQuery, dictionary]);

  const groupedPresetsByBab = useMemo(() => {
    const groups: Record<number, DictionaryEntry[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    filteredPresets.forEach((entry) => {
      const b = entry.babNum;
      if (groups[b]) groups[b].push(entry);
    });
    return groups;
  }, [filteredPresets]);

  const groupedPresetsByBina = useMemo(() => {
    const groups: Record<string, DictionaryEntry[]> = {};
    filteredPresets.forEach((entry) => {
      const b = entry.bina || "Shohih";
      if (!groups[b]) groups[b] = [];
      groups[b].push(entry);
    });
    return groups;
  }, [filteredPresets]);

  const groupedPresetsByHijaiyah = useMemo(() => {
    const groups: Record<string, DictionaryEntry[]> = {};
    filteredPresets.forEach((entry) => {
      const f = entry.root.fa.trim();
      if (!groups[f]) groups[f] = [];
      groups[f].push(entry);
    });
    return groups;
  }, [filteredPresets]);

  // Global Theme config access
  const tc = ThemeConfig[appTheme];

  const isAllCollapsed = useMemo(() => {
    if (presetGroupMode === "bab") {
      return Object.keys(groupedPresetsByBab).every(
        (k) => collapsedBabs[Number(k)],
      );
    }
    if (presetGroupMode === "bina") {
      return Object.keys(groupedPresetsByBina).every((k) => collapsedBinas[k]);
    }
    if (presetGroupMode === "hijaiyah") {
      return Object.keys(groupedPresetsByHijaiyah).every(
        (k) => collapsedHijaiyahs[k],
      );
    }
    return false;
  }, [
    presetGroupMode,
    collapsedBabs,
    collapsedBinas,
    collapsedHijaiyahs,
    groupedPresetsByBab,
    groupedPresetsByBina,
    groupedPresetsByHijaiyah,
  ]);

  const handleToggleAllGroups = () => {
    if (presetGroupMode === "bab") {
      const nextCollapsed = !isAllCollapsed;
      const update: Record<number, boolean> = {};
      Object.keys(groupedPresetsByBab).forEach((k) => {
        update[Number(k)] = nextCollapsed;
      });
      setCollapsedBabs(update);
    } else if (presetGroupMode === "bina") {
      const nextCollapsed = !isAllCollapsed;
      const update: Record<string, boolean> = {};
      Object.keys(groupedPresetsByBina).forEach((k) => {
        update[k] = nextCollapsed;
      });
      setCollapsedBinas(update);
    } else if (presetGroupMode === "hijaiyah") {
      const nextCollapsed = !isAllCollapsed;
      const update: Record<string, boolean> = {};
      Object.keys(groupedPresetsByHijaiyah).forEach((k) => {
        update[k] = nextCollapsed;
      });
      setCollapsedHijaiyahs(update);
    }
  };

  const activeWazanData = useMemo((): DataWazan => {
    const template = WAZAN_TEMPLATES[selectedEntry.babNum];
    let ainText = selectedEntry.root.ain;
    if (ainText === "ا" && selectedEntry.asal) {
      const cleanAsal = selectedEntry.asal.replace(/[\u064b-\u0652]/g, "");
      if (cleanAsal.length >= 2) {
        ainText = cleanAsal[1];
      }
    }
    return {
      fa: selectedEntry.root.fa,
      ain: ainText,
      lam: selectedEntry.root.lam,
      wazanMadhi: template.wazanMadhi,
      wazanMudhari: template.wazanMudhari,
      masdar: selectedEntry.masdar || template.masdar,
      sifatMusyabihat:
        selectedEntry.sifatMusyabihat || template.sifatMusyabihat,
      babNum: selectedEntry.babNum,
    };
  }, [selectedEntry]);

  const calculatedTasrif = useMemo((): TasrifIstilahi => {
    return IilalEngine.tasrifIstilahiCustom(activeWazanData);
  }, [activeWazanData]);

  const structuralPlurals = useMemo(() => {
    return {
      fail: analyzeIsimFailPlural(selectedEntry),
      maful: analyzeIsimMafulPlural(selectedEntry),
      zamanmakan: analyzeIsimZamanMakanPlural(selectedEntry),
      alat: analyzeIsimAlatPlural(selectedEntry),
      sifat: analyzeSifatMusyabihatPlural(selectedEntry),
    };
  }, [selectedEntry]);

  const renderPluralLafadz = (
    text: string | undefined,
    textColor: string = "#10b981",
  ) => {
    if (!text || text === "—" || text === "-" || text.trim() === "(-)" || text.trim() === "") {
      return <Text style={{ color: "#64748b", fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>(-)</Text>;
    }
    if (text.trim() === "-.") {
      return <Text style={{ color: "#64748b", fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>(-.)</Text>;
    }

    const words = text.split("/");
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
        {words.map((w, idx) => {
          let label = "";
          let cleanWord = w.trim();

          if (cleanWord.endsWith("(samai)")) {
            label = "samā'ī";
            cleanWord = cleanWord.replace("(samai)", "").trim();
          } else if (cleanWord.endsWith("(nadzir)")) {
            label = "nadzir";
            cleanWord = cleanWord.replace("(nadzir)", "").trim();
          }

          return (
            <View key={idx} style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "900", color: textColor, textAlign: "center" }}>
                {cleanWord}
              </Text>
              {label ? (
                <View style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.2)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                  <Text style={{ fontSize: 9, color: "#fbbf24", fontWeight: "bold" }}>
                    {label}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  const handleSaveProfile = (newUsername: string, newPhoto: string) => {
    setUsername(newUsername);
    setProfilePhoto(newPhoto);
    safeStorage.setItem("sdr_username", newUsername);
    safeStorage.setItem("sdr_profile_photo", newPhoto);
    setShowEditProfileModal(false);
  };

  const MOCK_PHOTOS = [
    "avatar1",
    "avatar2",
    "avatar3",
    "avatar4",
    "avatar5",
    "avatar6",
  ];

  const renderProfileImage = (
    photoVal: string,
    size: number = 32,
  ) => {
    let bgColor = "#10b981";
    const letter = username ? username.charAt(0).toUpperCase() : "U";

    switch (photoVal) {
      case "avatar1":
        bgColor = "#10b981";
        break;
      case "avatar2":
        bgColor = "#3b82f6";
        break;
      case "avatar3":
        bgColor = "#f59e0b";
        break;
      case "avatar4":
        bgColor = "#d946ef";
        break;
      case "avatar5":
        bgColor = "#f43f5e";
        break;
      case "avatar6":
        bgColor = "#8b5cf6";
        break;
      default:
        bgColor = "#10b981";
        break;
    }

    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#475569",
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: size * 0.45 }}>
          {letter}
        </Text>
      </View>
    );
  };

  const handleSimulatePayment = (price: number, planName: string) => {
    setIsPaymentLoading(true);
    setBillingPlan(planName);
    setPaymentMessage("Menghubungkan ke Gerbang Pembayaran Midtrans Snap...");

    setTimeout(() => {
      setPaymentMessage(
        `[Midtrans] Membuat SNAP Transaksi Token untuk ${planName}...`,
      );
    }, 1000);

    setTimeout(() => {
      setIsPaymentLoading(false);
    }, 2000);
  };

  const handleCompletePaymentSimulated = (success: boolean) => {
    if (success) {
      setIsPremium(true);
      safeStorage.setItem("sdr_premium_unlocked", "true");
      setShowPremiumModal(false);
      setToastMsg(
        `Aktivasi Sukses! Fitur Premium untuk paket "${billingPlan}" diaktifkan secara luring.`,
      );
    }
    setBillingPlan("");
  };

  const handleManualCodeUnlock = () => {
    if (
      activationCode.trim().toLowerCase() === "premium-shorof" ||
      activationCode.trim() === "123456"
    ) {
      setIsPremium(true);
      safeStorage.setItem("sdr_premium_unlocked", "true");
      setShowPremiumModal(false);
      setActivationCode("");
      setActivationError("");
      setToastMsg("Lisensi Premium berhasil diaktifkan dengan Kode Aktivasi!");
    } else {
      setActivationError("Kode Lisensi tidak valid atau kedaluwarsa.");
    }
  };

  const getArabicFontSize = (size: typeof lafadzSize): number => {
    switch (size) {
      case "small":
        return 18;
      case "medium":
        return 22;
      case "large":
        return 28;
      case "xlarge":
        return 36;
      default:
        return 22;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tc.bg }}>
      <StatusBar barStyle={appTheme === "light" ? "dark-content" : "light-content"} backgroundColor={tc.header} />
      
      {/* Primary Header */}
      <View style={{ backgroundColor: tc.header, borderBottomWidth: 1, borderBottomColor: tc.border, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "between", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: "#059669", padding: 6, borderRadius: 8 }}>
            <BookOpen size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "900", color: tc.headerText }}>
              Shorof Digital Pro
            </Text>
            <Text style={{ fontSize: 8, fontWeight: "600", color: tc.subText, textTransform: "uppercase" }}>
              Kamus Pintar Sharaf & Kaidah I'lal
            </Text>
          </View>
        </View>

        {/* Profile Settings section */}
        <TouchableOpacity
          onPress={() => setShowEditProfileModal(true)}
          style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.profileBg, borderWidth: 1, borderColor: tc.profileBorder, padding: 4, borderRadius: 24, gap: 6 }}
        >
          {renderProfileImage(profilePhoto, 20)}
          <Text style={{ fontSize: 10, fontWeight: "700", color: tc.headerText, marginRight: 4 }}>
            {username}
          </Text>
          <Settings size={10} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Dictionary Panel */}
        <View style={{ padding: 16, gap: 16 }}>
          <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 20, padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: tc.inputBg, borderWidth: 1, borderColor: tc.inputBorder, borderRadius: 12, paddingHorizontal: 12 }}>
              <Search size={14} color="#64748b" />
              <TextInput
                placeholder="Cari lafadz makna atau akar kata..."
                placeholderTextColor={tc.inputPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, fontSize: 12, color: tc.inputText, paddingVertical: 8, paddingHorizontal: 8 }}
              />
            </View>

            {/* Filter Mode Selector */}
            <View style={{ flexDirection: "row", backgroundColor: tc.inputBg, borderWidth: 1, borderColor: tc.inputBorder, borderRadius: 12, padding: 2 }}>
              {(["bab", "bina", "hijaiyah"] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setPresetGroupMode(mode)}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: presetGroupMode === mode ? tc.tabBtnActive : "transparent",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "900", color: presetGroupMode === mode ? "#ffffff" : tc.subText, textTransform: "uppercase" }}>
                    {mode === "bab" ? "Per Bab" : mode === "bina" ? "Per Bina'" : "Hijaiyah"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Collapsed Group Action Link */}
            <TouchableOpacity onPress={handleToggleAllGroups} style={{ alignSelf: "flex-end" }}>
              <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981" }}>
                {isAllCollapsed ? "🔓 Buka Semua Kelompok" : "🔒 Tutup Semua Kelompok"}
              </Text>
            </TouchableOpacity>

            {/* Presets List */}
            <View style={{ gap: 8 }}>
              {presetGroupMode === "bab" && Object.keys(groupedPresetsByBab).map((babKey) => {
                const babNum = Number(babKey);
                const bPresets = groupedPresetsByBab[babNum];
                if (bPresets.length === 0) return null;
                const isCollapsed = !!collapsedBabs[babNum];
                return (
                  <View key={`b-${babNum}`} style={{ borderWidth: 1, borderColor: tc.cardInnerBorder, backgroundColor: tc.cardInner, borderRadius: 16, padding: 8, gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => setCollapsedBabs(p => ({ ...p, [babNum]: !p[babNum] }))}
                      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: "900", color: tc.groupHeaderTitle }}>
                          Bab {babNum} — {
                            babNum === 1 ? "Fathul-Dhammi (-ُ)" :
                            babNum === 2 ? "Fathul-Kasri (-ِ)" :
                            babNum === 3 ? "Fathatani (-َ)" :
                            babNum === 4 ? "Kasrul-Fathi (-َ)" :
                            babNum === 5 ? "Dhammud-Dhammi (-ُ)" : "Kasratani (-ِ)"
                          }
                        </Text>
                        <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }}>
                          {getBabExplanation(babNum).ringkas}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={{ fontSize: 8, color: tc.subText }}>({bPresets.length})</Text>
                        {isCollapsed ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronUp size={12} color="#94a3b8" />}
                      </View>
                    </TouchableOpacity>

                    {!isCollapsed && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(148, 163, 184, 0.1)" }}>
                        {bPresets.map((entry) => {
                          const isSel = entry.id === selectedEntry.id;
                          return (
                            <TouchableOpacity
                              key={entry.id}
                              onPress={() => setSelectedEntry(entry)}
                              style={{
                                width: "31%",
                                backgroundColor: isSel ? tc.presetBtnSelBg : tc.presetBtnNorBg,
                                borderWidth: 1,
                                borderColor: isSel ? tc.presetBtnSelBorder : tc.presetBtnNorBorder,
                                borderRadius: 10,
                                paddingVertical: 6,
                                alignItems: "center"
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: "900", color: isSel ? tc.presetBtnSelText : tc.presetBtnNorText }}>
                                {getVocalizedRoot(entry.root.fa, entry.root.ain, entry.root.lam, entry.babNum)}
                              </Text>
                              <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }} numberOfLines={1}>
                                {entry.translation.split("/")[0]}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}

              {presetGroupMode === "bina" && Object.keys(groupedPresetsByBina).sort().map((binaKey) => {
                const bPresets = groupedPresetsByBina[binaKey];
                if (bPresets.length === 0) return null;
                const isCollapsed = !!collapsedBinas[binaKey];
                return (
                  <View key={`bi-${binaKey}`} style={{ borderWidth: 1, borderColor: tc.cardInnerBorder, backgroundColor: tc.cardInner, borderRadius: 16, padding: 8, gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => setCollapsedBinas(p => ({ ...p, [binaKey]: !p[binaKey] }))}
                      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#f59e0b" }}>Bina' {binaKey}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={{ fontSize: 8, color: tc.subText }}>({bPresets.length})</Text>
                        {isCollapsed ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronUp size={12} color="#94a3b8" />}
                      </View>
                    </TouchableOpacity>

                    {!isCollapsed && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(148, 163, 184, 0.1)" }}>
                        {bPresets.map((entry) => {
                          const isSel = entry.id === selectedEntry.id;
                          return (
                            <TouchableOpacity
                              key={entry.id}
                              onPress={() => setSelectedEntry(entry)}
                              style={{
                                width: "31%",
                                backgroundColor: isSel ? tc.presetBtnSelBg : tc.presetBtnNorBg,
                                borderWidth: 1,
                                borderColor: isSel ? tc.presetBtnSelBorder : tc.presetBtnNorBorder,
                                borderRadius: 10,
                                paddingVertical: 6,
                                alignItems: "center"
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: "900", color: isSel ? tc.presetBtnSelText : tc.presetBtnNorText }}>
                                {getVocalizedRoot(entry.root.fa, entry.root.ain, entry.root.lam, entry.babNum)}
                              </Text>
                              <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }} numberOfLines={1}>
                                {entry.translation.split("/")[0]}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}

              {presetGroupMode === "hijaiyah" && (
                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setIsHijaiyahPopupOpen(true)}
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)", borderRadius: 12, paddingVertical: 10, alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>
                      📖 Navigasi Huruf (Pop-up Grid)
                    </Text>
                  </TouchableOpacity>

                  {Object.keys(groupedPresetsByHijaiyah).sort().map((letter) => {
                    const bPresets = groupedPresetsByHijaiyah[letter];
                    if (bPresets.length === 0) return null;
                    const isCollapsed = !!collapsedHijaiyahs[letter];
                    return (
                      <View key={`h-${letter}`} style={{ borderWidth: 1, borderColor: tc.cardInnerBorder, backgroundColor: tc.cardInner, borderRadius: 16, padding: 8, gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => setCollapsedHijaiyahs(p => ({ ...p, [letter]: !p[letter] }))}
                          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: "rgba(245, 158, 11, 0.1)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.2)", alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24" }}>{letter}</Text>
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24" }}>Huruf {letter}</Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Text style={{ fontSize: 8, color: tc.subText }}>({bPresets.length})</Text>
                            {isCollapsed ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronUp size={12} color="#94a3b8" />}
                          </View>
                        </TouchableOpacity>

                        {!isCollapsed && (
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(148, 163, 184, 0.1)" }}>
                            {bPresets.map((entry) => {
                              const isSel = entry.id === selectedEntry.id;
                              return (
                                <TouchableOpacity
                                  key={entry.id}
                                  onPress={() => setSelectedEntry(entry)}
                                  style={{
                                    width: "31%",
                                    backgroundColor: isSel ? tc.presetBtnSelBg : tc.presetBtnNorBg,
                                    borderWidth: 1,
                                    borderColor: isSel ? tc.presetBtnSelBorder : tc.presetBtnNorBorder,
                                    borderRadius: 10,
                                    paddingVertical: 6,
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={{ fontSize: 14, fontWeight: "900", color: isSel ? tc.presetBtnSelText : tc.presetBtnNorText }}>
                                    {getVocalizedRoot(entry.root.fa, entry.root.ain, entry.root.lam, entry.babNum)}
                                  </Text>
                                  <Text style={{ fontSize: 8, color: tc.subText, marginTop: 2 }} numberOfLines={1}>
                                    {entry.translation.split("/")[0]}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Active Verb Detail Card */}
          <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 24, padding: 16, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981", textTransform: "uppercase" }}>
                    Bab {selectedEntry.babNum} — {selectedEntry.bina || "Shohih"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowBabInfoModal(true)}
                  style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: tc.border, alignItems: "center", justifyContent: "center" }}
                >
                  <Info size={11} color={tc.textColor} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={toggleFavorite}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  borderWidth: 1,
                  borderColor: isCurrentlyFavorited ? "rgba(245, 158, 11, 0.3)" : tc.border,
                  backgroundColor: isCurrentlyFavorited ? "rgba(245, 158, 11, 0.1)" : "transparent",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isCurrentlyFavorited ? <BookmarkCheck size={12} color="#fbbf24" /> : <Bookmark size={12} color="#94a3b8" />}
              </TouchableOpacity>
            </View>

            {/* Main calligraphic text */}
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 32, fontWeight: "900", color: "#fbbf24", textAlign: "center" }}>
                {getVocalizedRoot(selectedEntry.root.fa, selectedEntry.root.ain, selectedEntry.root.lam, selectedEntry.babNum)}
              </Text>
              <Text style={{ fontSize: 13, color: tc.textColor, fontWeight: "500", textAlign: "center", fontStyle: "italic", paddingHorizontal: 12 }}>
                "{selectedEntry.translation}"
              </Text>
            </View>

            {/* Sparkles short tips */}
            <View style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.1)", borderRadius: 16, padding: 10, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Sparkles size={11} color="#10b981" />
                <Text style={{ fontSize: 8, fontWeight: "900", color: "#10b981", textTransform: "uppercase", letterSpacing: 1 }}>
                  Karakteristik Bab {selectedEntry.babNum}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: tc.textColor, textAlign: "center", marginTop: 4 }}>
                {getBabExplanation(selectedEntry.babNum).ringkas}
              </Text>
              <TouchableOpacity
                onPress={() => setShowBabInfoModal(true)}
                style={{ marginTop: 8, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: tc.border, flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text style={{ fontSize: 8, color: "#fbbf24", fontWeight: "900" }}>Pelajari Logika Bab</Text>
                <ChevronRight size={8} color="#fbbf24" />
              </TouchableOpacity>
            </View>

            {/* References metadata */}
            <View style={{ borderTopWidth: 1, borderTopColor: tc.border, paddingTop: 12, gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Kamus Rujukan:</Text>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: tc.textColor }}>{selectedEntry.reference || "Lisanul 'Arab"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Asal Mula:</Text>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#fef3c7" }}>
                    {selectedEntry.asal || computeAsal(selectedEntry.root.fa, selectedEntry.root.ain, selectedEntry.root.lam, selectedEntry.babNum)}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: tc.border }}>
                <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase", marginBottom: 4 }}>Deskripsi & Sanad</Text>
                <Text style={{ fontSize: 10, color: tc.textColor, lineHeight: 14 }}>
                  {selectedEntry.explanation || "Informasi sanad morfologi standar tersedia."}
                </Text>
              </View>
            </View>

            {/* Font scaling control */}
            <View style={{ borderTopWidth: 1, borderTopColor: tc.border, paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, textTransform: "uppercase" }}>Skala Lafadz Arab:</Text>
              <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: tc.border, borderRadius: 8, padding: 2 }}>
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setLafadzSize(sz)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: lafadzSize === sz ? "#059669" : "transparent"
                    }}
                  >
                    <Text style={{ fontSize: 8, fontWeight: "900", color: lafadzSize === sz ? "#ffffff" : tc.subText }}>
                      {sz === "small" ? "S" : sz === "medium" ? "M" : sz === "large" ? "L" : "XL"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Grammar Tabs Selection */}
          <View style={{ backgroundColor: tc.card, borderWidth: 1, borderColor: tc.cardBorder, borderRadius: 24, padding: 4, gap: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 4, gap: 4 }}>
              {[
                { id: "istilahi", label: "Tashrif Istilahi", desc: "12 Shighot" },
                { id: "lughowi", label: "Tashrif Lughowi", desc: "Dhomir Konjugasi" },
                { id: "masdar", label: "Masdar Shorof", desc: "Sima'i & Qiyasi" },
                { id: "sifat", label: "Sifat Musyabihat", desc: "Mufrod & Jamak" },
                { id: "jama", label: "Jamak Taksir", desc: "Pecah Plural" },
                { id: "iilal", label: "Kaidah I'lal", desc: "Mut'al Penyakit" },
              ].map((tab) => {
                const isAct = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as any)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      backgroundColor: isAct ? tc.tabBtnActive : "transparent",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "900", color: isAct ? tc.tabBtnActiveText : tc.tabBtnInactiveText }}>
                      {tab.label}
                    </Text>
                    <Text style={{ fontSize: 8, color: isAct ? "rgba(255,255,255,0.7)" : "rgba(148,163,184,0.6)", marginTop: 1 }}>
                      {tab.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tab Container Display */}
            <View style={{ padding: 12 }}>
              {activeTab === "istilahi" && (
                <TabTasrifIstilahi
                  tasrif={calculatedTasrif}
                  fa={selectedEntry.root.fa}
                  ain={selectedEntry.root.ain}
                  lam={selectedEntry.root.lam}
                  lafadzSize={lafadzSize}
                  appTheme={appTheme}
                />
              )}

              {activeTab === "lughowi" && (
                <TabTasrifLughowi
                  tasrif={calculatedTasrif}
                  fa={selectedEntry.root.fa}
                  ain={selectedEntry.root.ain}
                  lam={selectedEntry.root.lam}
                  bina={selectedEntry.bina || "Shohih"}
                  babNum={selectedEntry.babNum}
                  lafadzSize={lafadzSize}
                  appTheme={appTheme}
                />
              )}

              {activeTab === "masdar" && (
                <TabShorofMasdarTable
                  entries={dictionary}
                  activeEntryId={selectedEntry.id}
                  onSelectEntry={setSelectedEntry}
                  isPremium={isPremium}
                  onUnlock={() => setShowPremiumModal(true)}
                  lafadzSize={lafadzSize}
                  appTheme={appTheme}
                />
              )}

              {activeTab === "sifat" && (
                <View style={{ gap: 12 }}>
                  <View style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.2)", padding: 12, borderRadius: 16, flexDirection: "row", gap: 10 }}>
                    <Layers size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: 10, color: "#a7f3d0", flex: 1, lineHeight: 14 }}>
                      <Text style={{ fontWeight: "900" }}>Sifat Musyabihat</Text> adalah isim sifat yang menyerupai Isim Fa'il dalam menunjukkan makna pelaku, tetapi memiliki karakteristik permanen (tsubut), melekat erat sebagai tabiat bawaan, atau ciri fisik subjek.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderWidth: 1, borderColor: tc.border, borderRadius: 20, padding: 12, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <Text style={{ fontSize: 8, fontWeight: "900", color: "#fbbf24" }}>Wazan Terdeteksi:</Text>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: tc.textColor, marginTop: 2 }}>
                          {(structuralPlurals.sifat as any).wazan_name || "Sama'i"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 8, fontWeight: "900", color: "#10b981" }}>Bina Kosa Kata:</Text>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: tc.textColor, marginTop: 2 }}>
                          {selectedEntry.bina || "Shohih"}
                        </Text>
                      </View>
                    </View>

                    {/* Unified sifat grid */}
                    <View style={{ gap: 8 }}>
                      {[
                        { title: "Mufrod Asli (Singular)", arTitle: "المُفْرَدُ الأَصْلِيّ", text: selectedEntry.sifatMusyabihat },
                        { title: "Mufrod Muannats", arTitle: "المُفْرَدُ المُؤَنَّث", text: (structuralPlurals.sifat as any).mufrod_muannas },
                        { title: "Jamak Taksir", arTitle: "جَمْعُ التَّكْسِير", text: structuralPlurals.sifat.katsroh },
                        { title: "Muntahal Jumu'", arTitle: "مُنْتَهَى الجُمُوعِ", text: structuralPlurals.sifat.muntahal }
                      ].map((item, idx) => (
                        <View key={idx} style={{ backgroundColor: "rgba(2, 6, 23, 0.4)", borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View>
                            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>{item.title}</Text>
                            <Text style={{ fontSize: 8, color: tc.subText, marginTop: 1, fontFamily: "monospace" }}>{item.arTitle}</Text>
                          </View>
                          {renderPluralLafadz(item.text, "#10b981")}
                        </View>
                      ))}
                    </View>

                    <View>
                      <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Sanad & Rujukan:</Text>
                      <View style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: tc.border }}>
                        <Text style={{ fontSize: 9, color: tc.subText, fontFamily: "monospace" }}>
                          {structuralPlurals.sifat.reference || "Lisanul 'Arab"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === "jama" && (
                <View style={{ gap: 12 }}>
                  <View style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.2)", padding: 12, borderRadius: 16, flexDirection: "row", gap: 10 }}>
                    <Layers size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: 10, color: "#a7f3d0", flex: 1, lineHeight: 14 }}>
                      <Text style={{ fontWeight: "900" }}>Jamak Taksir</Text> adalah bentuk jamak pecah bahasa Arab yang memodifikasi struktur tunggal (mufrod). Di system Shorof Digital Pro, analisis plurals dihitung komprehensif bagi 4 jenis Isim sekaligus.
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 2 }}>
                    {(["fail", "maful", "zamanmakan", "alat"] as const).map((jt) => (
                      <TouchableOpacity
                        key={jt}
                        onPress={() => setActiveJamakTab(jt)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: activeJamakTab === jt ? "rgba(16,185,129,0.15)" : "transparent",
                          alignItems: "center"
                        }}
                      >
                        <Text style={{ fontSize: 8, fontWeight: "900", color: activeJamakTab === jt ? "#10b981" : tc.subText }}>
                          {jt === "zamanmakan" ? "Zaman/Makan" : jt === "fail" ? "Isim Fail" : jt === "maful" ? "Isim Maful" : "Isim Alat"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderWidth: 1, borderColor: tc.border, borderRadius: 20, padding: 12, gap: 12 }}>
                    <View style={{ gap: 8 }}>
                      {/* Qillah */}
                      {activeJamakTab !== "zamanmakan" && (
                        <View style={{ backgroundColor: "rgba(2, 6, 23, 0.4)", borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View>
                            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Taksir Qillah (Sedikit):</Text>
                            <Text style={{ fontSize: 8, color: tc.subText, marginTop: 1, fontFamily: "monospace" }}>جَمْعُ قِلَّةٍ</Text>
                          </View>
                          {renderPluralLafadz(structuralPlurals[activeJamakTab].qillah)}
                        </View>
                      )}

                      {/* Katsroh */}
                      <View style={{ backgroundColor: "rgba(2, 6, 23, 0.4)", borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Taksir Katsroh (Banyak):</Text>
                          <Text style={{ fontSize: 8, color: tc.subText, marginTop: 1, fontFamily: "monospace" }}>جَمْعُ كَثْرَةٍ</Text>
                        </View>
                        {renderPluralLafadz(structuralPlurals[activeJamakTab].katsroh)}
                      </View>

                      {/* Muntahal */}
                      <View style={{ backgroundColor: "rgba(2, 6, 23, 0.4)", borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Muntahal (Jamak Puncak):</Text>
                          <Text style={{ fontSize: 8, color: tc.subText, marginTop: 1, fontFamily: "monospace" }}>مُنْتَهَى الجُمُوعِ</Text>
                        </View>
                        {renderPluralLafadz(structuralPlurals[activeJamakTab].muntahal)}
                      </View>
                    </View>

                    <View>
                      <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Sanad & Rujukan:</Text>
                      <View style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: tc.border }}>
                        <Text style={{ fontSize: 9, color: tc.subText, fontFamily: "monospace" }}>
                          {structuralPlurals[activeJamakTab].reference || "Lisanul 'Arab"}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 2 }}>Syarah & Pembahasan:</Text>
                      <View style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: tc.border }}>
                        <Text style={{ fontSize: 10, color: tc.textColor, lineHeight: 14 }}>
                          {structuralPlurals[activeJamakTab].explanation || "Sifat jamak taksir terbentuk secara baku mengikuti kualifikasi wazan bina kosa kata."}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === "iilal" && (
                <View style={{ gap: 12 }}>
                  <View style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.2)", padding: 12, borderRadius: 16, flexDirection: "row", gap: 10 }}>
                    <Sparkles size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>Analisis Kaidah I'lal Luring</Text>
                      <Text style={{ fontSize: 10, color: "#a7f3d0", marginTop: 2, lineHeight: 14 }}>
                        Secara otomatis mendeteksi huruf penyakit (illat) berupa <Text style={{ fontWeight: "900" }}>Waw (و)</Text>, <Text style={{ fontWeight: "900" }}>Ya (ي)</Text>, atau <Text style={{ fontWeight: "900" }}>Alif (ا)</Text> dan menjabarkan proses i'lal.
                      </Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderWidth: 1, borderColor: tc.border, borderRadius: 20, padding: 12, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: tc.border, paddingBottom: 8 }}>
                      <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Operasional I'lal Engine</Text>
                      <View style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.2)", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontSize: 8, color: "#fbbf24", fontWeight: "900" }}>BINA: {selectedEntry.bina || "Shohih"}</Text>
                      </View>
                    </View>

                    {selectedEntry.bina === "Shohih" ? (
                      <View style={{ paddingVertical: 24, alignItems: "center", gap: 6 }}>
                        <Check size={24} color="#10b981" />
                        <Text style={{ fontSize: 12, fontWeight: "900", color: tc.textColor }}>Aman! Bina Shohih</Text>
                        <Text style={{ fontSize: 10, color: tc.subText, textAlign: "center" }}>
                          Bina Shohih tersusun dari huruf murni tanpa cacat/penyakit, sehingga tidak membutuhkan i'lal.
                        </Text>
                      </View>
                    ) : (
                      <View style={{ gap: 12 }}>
                        <View style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: tc.border }}>
                          <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText, marginBottom: 4 }}>Log Transformasi Morfologi:</Text>
                          <Text style={{ fontSize: 10, color: tc.textColor, lineHeight: 14 }}>
                            {selectedEntry.explanation}
                          </Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: tc.border }}>
                          <View>
                            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Asal Kata Mula-mula</Text>
                            <Text style={{ fontSize: 14, fontWeight: "900", color: "#fef3c7", marginTop: 4 }}>
                              {selectedEntry.asal || computeAsal(selectedEntry.root.fa, selectedEntry.root.ain, selectedEntry.root.lam, selectedEntry.babNum)}
                            </Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={{ fontSize: 8, fontWeight: "900", color: tc.subText }}>Hasil Akhir Ter-i'lal</Text>
                            <Text style={{ fontSize: 14, fontWeight: "900", color: "#10b981", marginTop: 4 }}>
                              {getVocalizedRoot(selectedEntry.root.fa, selectedEntry.root.ain, selectedEntry.root.lam, selectedEntry.babNum)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Premium Trigger Button */}
      <View style={{ padding: 16, backgroundColor: tc.header, borderTopWidth: 1, borderTopColor: tc.border, alignItems: "center" }}>
        {isPremium ? (
          <TouchableOpacity
            onPress={() => setShowPremiumModal(true)}
            style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Award size={14} color="#fbbf24" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>
              premium terverifikasi dan aktif
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowPremiumModal(true)}
            style={{ backgroundColor: "#fbbf24", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Sparkles size={14} color="#020617" />
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#020617", textTransform: "uppercase" }}>
              aktifkan premium
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* POPUP MODAL 1: UPDATE ACCOUNT PROFILE DATA */}
      <Modal visible={showEditProfileModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, padding: 20, gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: "900", color: "#ffffff", textTransform: "uppercase" }}>Sesuaikan Akun</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: "950", color: "#94a3b8", textTransform: "uppercase" }}>Nama Panggilan</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={{ backgroundColor: "#020617", borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, padding: 10, fontSize: 11, color: "#ffffff" }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: "950", color: "#94a3b8", textTransform: "uppercase" }}>Pilih Avatar Warna</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {MOCK_PHOTOS.map((av) => (
                    <TouchableOpacity
                      key={av}
                      onPress={() => handleSaveProfile(username, av)}
                      style={{
                        padding: 2,
                        borderWidth: 1,
                        borderColor: profilePhoto === av ? "#10b981" : "#1e293b",
                        backgroundColor: profilePhoto === av ? "#020617" : "transparent",
                        borderRadius: 12
                      }}
                    >
                      {renderProfileImage(av, 24)}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: "rgba(148, 163, 184, 0.1)", paddingTop: 12 }}>
                <Text style={{ fontSize: 9, fontWeight: "950", color: "#94a3b8", textTransform: "uppercase" }}>Tema Aplikasi</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {(["dark", "light", "green"] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => handleSetTheme(t)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: appTheme === t ? "#10b981" : "#1e293b",
                        backgroundColor: appTheme === t ? "#020617" : "transparent",
                        borderRadius: 12,
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: "900", color: appTheme === t ? "#10b981" : "#94a3b8" }}>
                        {t === "dark" ? "Slate Dark" : t === "light" ? "Clean Light" : "Emerald Green"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleSaveProfile(username, profilePhoto)}
              style={{ backgroundColor: "#059669", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>Simpan Profilku</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL 2: UPGRADE TO PREMIUM LISENSI */}
      <Modal visible={showPremiumModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", borderRadius: 24, padding: 20, gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>Lisensi Sharaf Premium</Text>
              <TouchableOpacity onPress={() => { setShowPremiumModal(false); setBillingPlan(""); }}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {billingPlan ? (
              <View style={{ gap: 12 }}>
                <View style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", backgroundColor: "rgba(2,6,23,0.6)", padding: 14, borderRadius: 16, alignItems: "center", gap: 6 }}>
                  <CreditCard size={24} color="#10b981" />
                  <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>SNAP Enkripsi Midtrans</Text>
                  <Text style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", lineHeight: 14 }}>
                    Paket premium aktif untuk: <Text style={{ color: "#ffffff", fontWeight: "700" }}>{billingPlan}</Text>{"\n"}
                    Gerbang pembayaran Midtrans mensimulasikan lisensi sukses.
                  </Text>
                </View>

                {isPaymentLoading ? (
                  <View style={{ paddingVertical: 12, alignItems: "center", gap: 6 }}>
                    <RefreshCw size={16} color="#10b981" />
                    <Text style={{ fontSize: 9, color: "#94a3b8" }}>{paymentMessage}</Text>
                  </View>
                ) : (
                  <View style={{ gap: 8, alignItems: "center" }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#94a3b8" }}>Simulasikan Pemicu Midtrans:</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleCompletePaymentSimulated(true)}
                        style={{ flex: 1, backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", paddingVertical: 10, borderRadius: 12, alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981" }}>✔ Simulasikan Lunas</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleCompletePaymentSimulated(false)}
                        style={{ flex: 1, backgroundColor: "rgba(244,63,94,0.1)", borderWidth: 1, borderColor: "rgba(244,63,94,0.2)", paddingVertical: 10, borderRadius: 12, alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: "900", color: "#f43f5e" }}>✘ Simulasikan Batal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <View style={{ backgroundColor: "#020617", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#1e293b", gap: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "900", color: "#ffffff" }}>Benefit Shorof Pro Premium:</Text>
                  <Text style={{ fontSize: 9, color: "#94a3b8", lineHeight: 14 }}>
                    • Akses full 6-wazan Sifat Musyabihat Luring{"\n"}
                    • Kaidah I'lal andal tanpa batas kosa kata{"\n"}
                    • Penyimpanan database favorit tak terhingga{"\n"}
                    • Sertifikasi luring bebas iklan pengganggu
                  </Text>
                </View>

                <View style={{ gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => handleSimulatePayment(15000, "Monthly Shorof Digital (Rp15k)")}
                    style={{ backgroundColor: "#020617", borderWidth: 1, borderColor: "#1e293b", padding: 12, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <View>
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#ffffff" }}>Paket Bulanan</Text>
                      <Text style={{ fontSize: 8, color: "#64748b" }}>Unlocks all pro features</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: "900", color: "#10b981" }}>Rp15.000,-</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSimulatePayment(99000, "Lifetime Shorof Digital (Rp99k)")}
                    style={{ backgroundColor: "rgba(245,158,11,0.05)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", padding: 12, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <View>
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24" }}>Selamanya Pro (Lifetime)</Text>
                      <Text style={{ fontSize: 8, color: "#64748b" }}>Pay once, active permanently</Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24" }}>Rp99.000,-</Text>
                  </TouchableOpacity>
                </View>

                {/* Activation code section */}
                <View style={{ borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 12, gap: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#64748b" }}>Punya Kode Aktivasi? Masukkan luring:</Text>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TextInput
                      placeholder="Kode luring (misal: premium-shorof)"
                      placeholderTextColor="#475569"
                      value={activationCode}
                      onChangeText={setActivationCode}
                      style={{ flex: 1, backgroundColor: "#020617", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, fontSize: 10, color: "#ffffff" }}
                    />
                    <TouchableOpacity
                      onPress={handleManualCodeUnlock}
                      style={{ backgroundColor: "#1e293b", paddingHorizontal: 12, borderRadius: 10, justifyContent: "center" }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#ffffff" }}>Gunakan</Text>
                    </TouchableOpacity>
                  </View>
                  {activationError ? (
                    <Text style={{ fontSize: 8, color: "#f43f5e", fontWeight: "700" }}>{activationError}</Text>
                  ) : null}
                  <Text style={{ fontSize: 8, color: "#475569", lineHeight: 12, fontStyle: "italic" }}>
                    *Tip pengujian: Anda dapat menggunakan kode lisensi gratis premium-shorof atau 123456 untuk langsung membuka status Pro gratis di preview.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL 3: PENJELASAN BAB SHOROF UNTUK PEMULA */}
      <Modal visible={showBabInfoModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#090d16", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", borderRadius: 24, padding: 20, gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Info size={16} color="#10b981" />
                <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff", textTransform: "uppercase" }}>Karakteristik Bab {selectedEntry.babNum} Sharaf</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBabInfoModal(false)}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ backgroundColor: "#020617", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#1e293b", alignItems: "center" }}>
                <Text style={{ fontSize: 8, fontWeight: "900", color: "#64748b" }}>Wazan Vokal Baku:</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#fbbf24", marginTop: 4 }}>
                  {getBabExplanation(selectedEntry.babNum).vocal}
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#64748b" }}>Definisi Ringkas:</Text>
                  <Text style={{ fontSize: 10, color: tc.textColor, marginTop: 2, lineHeight: 14 }}>
                    {getBabExplanation(selectedEntry.babNum).ringkas}
                  </Text>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)", paddingTop: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#64748b" }}>Karakteristik & Makna:</Text>
                  <Text style={{ fontSize: 10, color: tc.textColor, marginTop: 2, lineHeight: 14 }}>
                    {getBabExplanation(selectedEntry.babNum).karakteristik}
                  </Text>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)", paddingTop: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#64748b" }}>Contoh Konsep Lain:</Text>
                  <Text style={{ fontSize: 10, color: "#fef3c7", fontWeight: "700", marginTop: 2, fontStyle: "italic" }}>
                    {getBabExplanation(selectedEntry.babNum).contoh_lain}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.15)", padding: 10, borderRadius: 12 }}>
                <Text style={{ fontSize: 10, color: "#a7f3d0", lineHeight: 14 }}>
                  <Text style={{ fontWeight: "900", color: "#10b981" }}>💡 Tips Pemula:</Text> Pembagian Bab dalam Tsulatsi Mujarrad (1 s.d. 6) ditentukan oleh harakat Ain fi'il di kala Madhi dan Mudhari. Karakternya membantu menjelaskan makna kontekstual suatu kata kerja baru.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowBabInfoModal(false)}
              style={{ backgroundColor: "#059669", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>Mengerti, Tutup Penjelasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL: DETAILED HIJAIYAH ENTRY DISPLAY */}
      <Modal visible={!!directPopupEntry} animationType="slide" transparent>
        {directPopupEntry && (
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 20 }}>
            <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, padding: 20, gap: 14 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>Analisis Lafadz & Sifat Musyabihat</Text>
                <TouchableOpacity onPress={() => setDirectPopupEntry(null)}>
                  <X size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: "rgba(2, 6, 23, 0.4)", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, padding: 14, alignItems: "center", gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", padding: 6, borderRadius: 8 }}><Text style={{ fontSize: 14, fontWeight: "900", color: "#fbbf24" }}>{directPopupEntry.root.fa}</Text></View>
                  <Text style={{ color: "#475569" }}>-</Text>
                  <View style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: 6, borderRadius: 8 }}><Text style={{ fontSize: 14, fontWeight: "900", color: "#10b981" }}>{directPopupEntry.root.ain}</Text></View>
                  <Text style={{ color: "#475569" }}>-</Text>
                  <View style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", padding: 6, borderRadius: 8 }}><Text style={{ fontSize: 14, fontWeight: "900", color: "#3b82f6" }}>{directPopupEntry.root.lam}</Text></View>
                </View>

                <Text style={{ fontSize: 24, fontWeight: "900", color: "#fde68a" }}>
                  {getVocalizedRoot(directPopupEntry.root.fa, directPopupEntry.root.ain, directPopupEntry.root.lam, directPopupEntry.babNum)}
                </Text>

                <View style={{ backgroundColor: "#1e293b", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#94a3b8" }}>Bab {directPopupEntry.babNum} • Bina' {directPopupEntry.bina}</Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: "950", color: "#94a3b8", textTransform: "uppercase" }}>Makna & Rujukan Kamus</Text>
                <View style={{ backgroundColor: "#020617", borderWidth: 1, borderColor: "#1e293b", padding: 12, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, color: "#e2e8f0" }}>{directPopupEntry.translation}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setDirectPopupEntry(null)}
                style={{ backgroundColor: "#fbbf24", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ fontSize: 11, fontWeight: "900", color: "#020617" }}>Tutup Analisis Pop-up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* POPUP MODAL: NAVIGASI HIJAIYAH GRID */}
      <Modal visible={isHijaiyahPopupOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, padding: 20, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>Navigasi Huruf Hijaiyah</Text>
              <TouchableOpacity onPress={() => setIsHijaiyahPopupOpen(false)}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 10, color: "#94a3b8", lineHeight: 14 }}>
              Klik salah satu huruf hijaiyah di bawah ini untuk berpindah langsung ke kelompok lafadz yang bersangkutan. Hanya menampilkan huruf yang memiliki entri data.
            </Text>

            <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 10 }}>
              {Object.keys(groupedPresetsByHijaiyah).sort().map((letter) => {
                const count = groupedPresetsByHijaiyah[letter].length;
                return (
                  <TouchableOpacity
                    key={`pop-let-${letter}`}
                    onPress={() => handleNavigateToLetter(letter)}
                    style={{
                      width: "22%",
                      backgroundColor: "rgba(2, 6, 23, 0.4)",
                      borderWidth: 1,
                      borderColor: "#1e293b",
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#fbbf24" }}>{letter}</Text>
                    <Text style={{ fontSize: 7, color: "#64748b" }}>{count} Lafadz</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsHijaiyahPopupOpen(false)}
              style={{ backgroundColor: "#059669", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>Tutup Navigasi Pop-up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMsg ? (
        <View style={{ position: "absolute", bottom: 80, left: 16, right: 16, backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#10b981", borderRadius: 16, padding: 12, flexDirection: "row", gap: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 }}>
          <View style={{ backgroundColor: "rgba(16,185,129,0.1)", padding: 6, borderRadius: 8 }}>
            <BookmarkCheck size={14} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, fontWeight: "900", color: "#10b981", textTransform: "uppercase" }}>Shorof Pro</Text>
            <Text style={{ fontSize: 10, color: "#ffffff", marginTop: 2 }}>{toastMsg}</Text>
          </View>
          <TouchableOpacity onPress={() => setToastMsg(null)}>
            <Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "900" }}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Simple elegant credit information footer */}
      <View style={{ backgroundColor: "#020617", py: 12, px: 16, borderTopWidth: 1, borderTopColor: "#0f172a", alignItems: "center" }}>
        <Text style={{ fontSize: 8, color: "#475569", textAlign: "center" }}>
          © 2026 Shorof Digital Pro. Seluruh hak cipta dilindungi undang-undang.
        </Text>
        <Text style={{ fontSize: 7, color: "#475569", textAlign: "center", marginTop: 2 }}>
          Merek dagang terdaftar milik Al-Munawwir, Tajul 'Arus & Lisanul 'Arab klasik.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
