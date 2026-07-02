import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Search,
  BookOpen,
  Bookmark,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  BookmarkCheck,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Edit3,
} from "lucide-react-native";

// Prevent auto hiding splash screen on startup
SplashScreen.preventAutoHideAsync().catch(() => {});

// Types Definitions
interface DictionaryEntry {
  id: string;
  root: { fa: string; ain: string; lam: string };
  translation: string;
  babNum: number;
  bina: string;
  explanation: string;
  reference?: string;
  asal?: string;
  masdar?: string;
  sifatMusyabihat?: string;
  shorof: {
    madhi: string;
    mudhari: string;
    masdar: string;
    fail: string;
    maful: string;
    amr: string;
    nahy: string;
    zaman: string;
    makan: string;
    alat: string;
  };
  lughowi: {
    madhi: string[]; // 14 dhomir
    mudhari: string[]; // 14 dhomir
    amr: string[]; // 6 dhomir (Anta to Antunna)
  };
  plurals: {
    fail: { qillah: string; katsroh: string; muntahal: string };
    maful: { qillah: string; katsroh: string; muntahal: string };
    zamanmakan: { qillah: string; katsroh: string; muntahal: string };
    alat: { qillah: string; katsroh: string; muntahal: string };
    sifat: { qillah: string; katsroh: string; muntahal: string; wazan_name?: string };
  };
}

// Full Preset Dictionary Database (Pre-calculated high fidelity conjugation data)
const PRESET_DICTIONARY: DictionaryEntry[] = [
  {
    id: "nasara",
    root: { fa: "ن", ain: "ص", lam: "ر" },
    translation: "Menolong / Membantu",
    babNum: 1,
    bina: "Shohih",
    asal: "نَصَرَ",
    explanation: "Kata kerja dasar Bab 1 yang menunjukkan tindakan menolong secara aktif.",
    reference: "Kamus Lisanul 'Arab",
    masdar: "نَصْرًا",
    sifatMusyabihat: "نَصِيرٌ",
    shorof: {
      madhi: "نَصَرَ",
      mudhari: "يَنْصُرُ",
      masdar: "نَصْرًا",
      fail: "نَاصِرٌ",
      maful: "مَنْصُورٌ",
      amr: "اُنْصُرْ",
      nahy: "لَا تَنْصُرْ",
      zaman: "مَنْصَرٌ",
      makan: "مَنْصَرٌ",
      alat: "مِنْصَرٌ",
    },
    lughowi: {
      madhi: [
        "نَصَرَ", "نَصَرَا", "نَصَرُوا",
        "نَصَرَتْ", "نَصَرَتَا", "نَصَرْنَ",
        "نَصَرْتَ", "نَصَرْتُمَا", "نَصَرْتُمْ",
        "نَصَرْتِ", "نَصَرْتُمَا", "نَصَرْتُنَّ",
        "نَصَرْتُ", "نَصَرْنَا"
      ],
      mudhari: [
        "يَنْصُرُ", "يَنْصُرَانِ", "يَنْصُرُونَ",
        "تَنْصُرُ", "تَنْصُرَانِ", "يَنْصُرْنَ",
        "تَنْصُرُ", "تَنْصُرَانِ", "تَنْصُرُونَ",
        "تَنْصُرِينَ", "تَنْصُرَانِ", "تَنْصُرْنَ",
        "أَنْصُرُ", "نَنْصُرُ"
      ],
      amr: [
        "اُنْصُرْ", "اُنْصُرَا", "اُنْصُرُوا",
        "اُنْصُرِي", "اُنْصُرَا", "اُنْصُرْنَ"
      ]
    },
    plurals: {
      fail: { qillah: "أَنْصَارٌ", katsroh: "نُصَّارٌ / نَصَرَةٌ", muntahal: "نَوَاصِرُ" },
      maful: { qillah: "مَنْصُورُونَ", katsroh: "مَنَاصِيرُ", muntahal: "مَنَاصِيرُ" },
      zamanmakan: { qillah: "—", katsroh: "مَنَاصِرُ", muntahal: "مَنَاصِرُ" },
      alat: { qillah: "—", katsroh: "مَنَاصِرُ", muntahal: "مَنَاصِرُ" },
      sifat: { qillah: "أَنْصَارٌ", katsroh: "نُصَرَاءُ", muntahal: "نَوَاصِرُ", wazan_name: "فَعِيلٌ" }
    }
  },
  {
    id: "daraba",
    root: { fa: "ض", ain: "ر", lam: "ب" },
    translation: "Memukul / Membuat perumpamaan",
    babNum: 2,
    bina: "Shohih",
    asal: "ضَرَبَ",
    explanation: "Morfologi Bab 2 dengan harakat kasrah di fi'il mudhari.",
    reference: "Mu'jam Maqaayiis al-Lughah",
    masdar: "ضَرْبًا",
    sifatMusyabihat: "ضَرِيبٌ",
    shorof: {
      madhi: "ضَرَبَ",
      mudhari: "يَضْرِبُ",
      masdar: "ضَرْبًا",
      fail: "ضَارِبٌ",
      maful: "مَضْرُوبٌ",
      amr: "اِضْرِبْ",
      nahy: "لَا تَضْرِبْ",
      zaman: "مَضْرِبٌ",
      makan: "مَضْرِبٌ",
      alat: "مِضْرَبٌ",
    },
    lughowi: {
      madhi: [
        "ضَرَبَ", "ضَرَبَا", "ضَرَبُوا",
        "ضَرَبَتْ", "ضَرَبَتَا", "ضَرَبْنَ",
        "ضَرَبْتَ", "ضَرَبْتُمَا", "ضَرَبْتُمْ",
        "ضَرَبْتِ", "ضَرَبْتُمَا", "ضَرَبْتُنَّ",
        "ضَرَبْتُ", "ضَرَبْنَا"
      ],
      mudhari: [
        "يَضْرِبُ", "يَضْرِبَانِ", "يَضْرِبُونَ",
        "تَضْرِبُ", "تَضْرِبَانِ", "يَضْرِبْنَ",
        "تَضْرِبُ", "تَضْرِبَانِ", "تَضْرِبُونَ",
        "تَضْرِبِينَ", "تَضْرِبَانِ", "تَضْرِبْنَ",
        "أَضْرِبُ", "نَضْرِبُ"
      ],
      amr: [
        "اِضْرِبْ", "اِضْرِبَا", "اِضْرِبُوا",
        "اِضْرِبِي", "اِضْرِبَا", "اِضْرِبْنَ"
      ]
    },
    plurals: {
      fail: { qillah: "أَضْرَابٌ", katsroh: "ضُرَّابٌ / ضَرَبَةٌ", muntahal: "ضَوَارِبُ" },
      maful: { qillah: "مَضْرُوبُونَ", katsroh: "مَضَارِيبُ", muntahal: "مَضَارِيبُ" },
      zamanmakan: { qillah: "—", katsroh: "مَضَارِبُ", muntahal: "مَضَارِبُ" },
      alat: { qillah: "—", katsroh: "مَضَارِبُ", muntahal: "مَضَارِبُ" },
      sifat: { qillah: "أَضْرَابٌ", katsroh: "ضُرَبَاءُ", muntahal: "ضَوَارِبُ", wazan_name: "فَعِيلٌ" }
    }
  },
  {
    id: "fataha",
    root: { fa: "ف", ain: "ت", lam: "ح" },
    translation: "Membuka / Memenangkan",
    babNum: 3,
    bina: "Shohih (Huruf Halq)",
    asal: "فَتَحَ",
    explanation: "Bab 3 mensyaratkan ain atau lam fi'il berupa huruf tenggorokan (halq).",
    reference: "Al-Qamus Al-Muhith",
    masdar: "فَتْحًا",
    sifatMusyabihat: "فَتِيحٌ",
    shorof: {
      madhi: "فَتَحَ",
      mudhari: "يَفْتَحُ",
      masdar: "فَتْحًا",
      fail: "فَاتِحٌ",
      maful: "مَفْتُوحٌ",
      amr: "اِفْتَحْ",
      nahy: "لَا تَفْتَحْ",
      zaman: "مَفْتَحٌ",
      makan: "مَفْتَحٌ",
      alat: "مِفْتَحٌ",
    },
    lughowi: {
      madhi: [
        "فَتَحَ", "فَتَحَا", "فَتَحُوا",
        "فَتَحَتْ", "فَتَحَتَا", "فَتَحْنَ",
        "فَتَحْتَ", "فَتَحْتُمَا", "فَتَحْتُمْ",
        "فَتَحْتِ", "فَتَحْتُمَا", "فَتَحْتُنَّ",
        "فَتَحْتُ", "فَتَحْنَا"
      ],
      mudhari: [
        "يَفْتَحُ", "يَفْتَحَانِ", "يَفْتَحُونَ",
        "تَفْتَحُ", "تَفْتَحَانِ", "يَفْتَحْنَ",
        "تَفْتَحُ", "تَفْتَحَانِ", "تَفْتَحُونَ",
        "تَفْتَحِينَ", "تَفْتَحَانِ", "تَفْتَحْنَ",
        "أَفْتَحُ", "نَفْتَحُ"
      ],
      amr: [
        "اِفْتَحْ", "اِفْتَحَا", "اِفْتَحُوا",
        "اِفْتَحِي", "اِفْتَحَا", "اِفْتَحْنَ"
      ]
    },
    plurals: {
      fail: { qillah: "أَفْتَاحٌ", katsroh: "فُتَّاحٌ / فَتَحَةٌ", muntahal: "فَوَاتِحُ" },
      maful: { qillah: "مَفْتُوحُونَ", katsroh: "مَفَاتِيحُ", muntahal: "مَفَاتِيحُ" },
      zamanmakan: { qillah: "—", katsroh: "مَفَاتِحُ", muntahal: "مَفَاتِحُ" },
      alat: { qillah: "—", katsroh: "مَفَاتِيحُ", muntahal: "مَفَاتِيحُ" },
      sifat: { qillah: "أَفْتَاحٌ", katsroh: "فُتَحَاءُ", muntahal: "فَوَاتِحُ", wazan_name: "فَعِيلٌ" }
    }
  },
  {
    id: "alima",
    root: { fa: "ع", ain: "ل", lam: "م" },
    translation: "Mengetahui / Memahami",
    babNum: 4,
    bina: "Shohih",
    asal: "عَلِمَ",
    explanation: "Bab 4 dengan pola Kasrul-Fathi (vokal kasrah di madhi, fathah di mudhari).",
    reference: "Kamus Al-Munawwir",
    masdar: "عِلْمًا",
    sifatMusyabihat: "عَلِيمٌ",
    shorof: {
      madhi: "عَلِمَ",
      mudhari: "يَعْلَمُ",
      masdar: "عِلْمًا",
      fail: "عَالِمٌ",
      maful: "مَعْلُومٌ",
      amr: "اِعْلَمْ",
      nahy: "لَا تَعْلَمْ",
      zaman: "مَعْلَمٌ",
      makan: "مَعْلَمٌ",
      alat: "مِعْلَمٌ",
    },
    lughowi: {
      madhi: [
        "عَلِمَ", "عَلِمَا", "عَلِمُوا",
        "عَلِمَتْ", "عَلِمَتَا", "عَلِمْنَ",
        "عَلِمْتَ", "عَلِمْتُمَا", "عَلِمْتُمْ",
        "عَلِمْتِ", "عَلِمْتُمَا", "عَلِمْتُنَّ",
        "عَلِمْتُ", "عَلِمْنَا"
      ],
      mudhari: [
        "يَعْلَمُ", "يَعْلَمَانِ", "يَعْلَمُونَ",
        "تَعْلَمُ", "تَعْلَمَانِ", "يَعْلَمْنَ",
        "تَعْلَمُ", "تَعْلَمَانِ", "تَعْلَمُونَ",
        "تَعْلَمِينَ", "تَعْلَمَانِ", "تَعْلَمْنَ",
        "أَعْلَمُ", "نَعْلَمُ"
      ],
      amr: [
        "اِعْلَمْ", "اِعْلَمَا", "اِعْلَمُوا",
        "اِعْلَمِي", "اِعْلَمَا", "اِعْلَمْنَ"
      ]
    },
    plurals: {
      fail: { qillah: "أَعْلَامٌ", katsroh: "عُلَمَاءُ", muntahal: "عَوَالِمُ" },
      maful: { qillah: "مَعْلُومُونَ", katsroh: "مَعَالِيمُ", muntahal: "مَعَالِيمُ" },
      zamanmakan: { qillah: "—", katsroh: "مَعَالِمُ", muntahal: "مَعَالِمُ" },
      alat: { qillah: "—", katsroh: "مَعَالِمُ", muntahal: "مَعَالِمُ" },
      sifat: { qillah: "أَعْلَامٌ", katsroh: "عُلَمَاءُ", muntahal: "عَوَالِمُ", wazan_name: "فَعِيلٌ" }
    }
  },
  {
    id: "hasuna",
    root: { fa: "ح", ain: "س", lam: "ن" },
    translation: "Menjadi Baik / Elok",
    babNum: 5,
    bina: "Shohih",
    asal: "حَسُنَ",
    explanation: "Bab 5 didominasi kata kerja intransitif (lazim) yang melambangkan tabiat bawaan permanen.",
    reference: "Tajul 'Arus",
    masdar: "حُسْنًا",
    sifatMusyabihat: "حَسَنٌ",
    shorof: {
      madhi: "حَسُنَ",
      mudhari: "يَحْسُنُ",
      masdar: "حُسْنًا",
      fail: "حَاسِنٌ",
      maful: "مَحْسُونٌ",
      amr: "اُحْسُنْ",
      nahy: "لَا تَحْسُنْ",
      zaman: "مَحْسَنٌ",
      makan: "مَحْسَنٌ",
      alat: "مِحْسَنٌ",
    },
    lughowi: {
      madhi: [
        "حَسُنَ", "حَسُنَا", "حَسُنُوا",
        "حَسُنَتْ", "حَسُنَتَا", "حَسُنْنَ",
        "حَسُنْتَ", "حَسُنْتُمَا", "حَسُنْتُمْ",
        "حَسُنْتِ", "حَسُنْتُمَا", "حَسُنْتُنَّ",
        "حَسُنْتُ", "حَسُنْنَا"
      ],
      mudhari: [
        "يَحْسُنُ", "يَحْسُنَانِ", "يَحْسُنُونَ",
        "تَحْسُنُ", "تَحْسُنَانِ", "يَحْسُنْنَ",
        "تَحْسُنُ", "تَحْسُنَانِ", "تَحْسُنُونَ",
        "تَحْسُنِينَ", "تَحْسُنَانِ", "تَحْسُنْنَ",
        "أَحْسُنُ", "نَحْسُنُ"
      ],
      amr: [
        "اُحْسُنْ", "اُحْسُنَا", "اُحْسُنُوا",
        "اُحْسُنِي", "اُحْسُنَا", "اُحْسُنْنَ"
      ]
    },
    plurals: {
      fail: { qillah: "أَحْسَانٌ", katsroh: "حُسَّانٌ", muntahal: "حَوَاسِنُ" },
      maful: { qillah: "مَحْسُونُونَ", katsroh: "مَحَاسِينُ", muntahal: "مَحَاسِينُ" },
      zamanmakan: { qillah: "—", katsroh: "مَحَاسِنُ", muntahal: "مَحَاسِنُ" },
      alat: { qillah: "—", katsroh: "مَحَاسِنُ", muntahal: "مَحَاسِنُ" },
      sifat: { qillah: "أَحْسَانٌ", katsroh: "حِسَانٌ", muntahal: "حَوَاسِنُ", wazan_name: "فَعَلٌ" }
    }
  }
];

const ThemeConfig = {
  dark: {
    bg: "#090d16",
    header: "#111827",
    card: "#1f2937",
    cardInner: "#111827",
    input: "#1f2937",
    text: "#f3f4f6",
    subText: "#9ca3af",
    border: "#374151",
    accent: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.15)",
    amber: "#f59e0b",
    tabActive: "#10b981",
    tabInactive: "#374151",
  },
  light: {
    bg: "#f3f4f6",
    header: "#ffffff",
    card: "#ffffff",
    cardInner: "#f3f4f6",
    input: "#f9fafb",
    text: "#1f2937",
    subText: "#6b7280",
    border: "#e5e7eb",
    accent: "#059669",
    accentBg: "rgba(5, 150, 105, 0.1)",
    amber: "#d97706",
    tabActive: "#059669",
    tabInactive: "#e5e7eb",
  },
  green: {
    bg: "#064e3b",
    header: "#022c22",
    card: "#065f46",
    cardInner: "#022c22",
    input: "#022c22",
    text: "#ecfdf5",
    subText: "#a7f3d0",
    border: "#047857",
    accent: "#fbbf24",
    accentBg: "rgba(251, 191, 36, 0.15)",
    amber: "#fbbf24",
    tabActive: "#fbbf24",
    tabInactive: "#047857",
  }
};

const babExplanations: Record<number, { title: string; ringkas: string; detail: string }> = {
  1: {
    title: "Bab 1: Fath-Dhammi (-َ / -ُ)",
    ringkas: "Vokal fathah di fi'il madhi berubah menjadi dhammah di fi'il mudhari. Populer untuk kata kerja dinamis-aktif.",
    detail: "Bab ini didominasi oleh kata kerja transitif (muta'addi) yang menggambarkan perbuatan fisik aktif langsung."
  },
  2: {
    title: "Bab 2: Fath-Kasri (-َ / -ِ)",
    ringkas: "Vokal fathah di fi'il madhi berubah menjadi kasrah di fi'il mudhari. Cocok untuk gerakan terukur dan arah.",
    detail: "Bab ini memuat kata kerja bermakna gerakan fisik, suara terputus, atau tindakan langsung terarah."
  },
  3: {
    title: "Bab 3: Fathatani (-َ / -َ)",
    ringkas: "Kedua fi'il menggunakan fathah. Syarat: Ain atau Lam fi'il harus berupa Huruf Halq (tenggorokan).",
    detail: "Morfologi mengharuskan terdapat huruf halq (ء, هـ, ع, ح, غ, خ) pada rukun Ain atau Lam kata kerja."
  },
  4: {
    title: "Bab 4: Kasrul-Fathi (-ِ / -َ)",
    ringkas: "Vokal kasrah di madhi berubah menjadi fathah di mudhari. Sering mengekspresikan emosi/sifat sementara.",
    detail: "Sering digunakan untuk kata kerja intransitif (lazim) yang merujuk emosi, warna, cacat fisik sementara."
  },
  5: {
    title: "Bab 5: Dhammud-Dhammi (-ُ / -ُ)",
    ringkas: "Kedua fi'il menggunakan dhammah. Seluruh kata berkarakter lazim (sifat bawaan lahiriah permanen).",
    detail: "Semua kata kerja di Bab 5 bersifat lazim (intransitif) dan mencerminkan karakter moral bawaan yang permanen."
  },
  6: {
    title: "Bab 6: Kasratani (-ِ / -ِ)",
    ringkas: "Kedua fi'il menggunakan kasrah. Bab paling langka dalam khazanah sharaf Arab.",
    detail: "Bab dengan kosakata paling sedikit, merujuk pada pemahaman mental kognisi batiniah."
  }
};

const DhomirList = [
  "هُوَ (Dia Lk)", "هُمَا (Mereka 2 Lk)", "هُمْ (Mereka Lk)",
  "هِيَ (Dia Pr)", "هُمَا (Mereka 2 Pr)", "هُنَّ (Mereka Pr)",
  "أَنْتَ (Kamu Lk)", "أَنْتُمَا (Kamu 2 Lk)", "أَنْتُمْ (Kalian Lk)",
  "أَنْتِ (Kamu Pr)", "أَنْتُمَا (Kamu 2 Pr)", "أَنْتُنَّ (Kalian Pr)",
  "أَنَا (Saya)", "نَحْنُ (Kami/Kita)"
];

const AmrDhomirList = [
  "أَنْتَ (Kamu Lk)", "أَنْتُمَا (Kamu 2 Lk)", "أَنْتُمْ (Kalian Lk)",
  "أَنْتِ (Kamu Pr)", "أَنْتُمَا (Kamu 2 Pr)", "أَنْتُنَّ (Kalian Pr)"
];

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [appTheme, setAppTheme] = useState<"dark" | "light" | "green">("dark");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [presetGroupMode, setPresetGroupMode] = useState<"bab" | "bina">("bab");
  const [activeTab, setActiveTab] = useState<"istilahi" | "lughowi" | "sifat" | "jama" | "favorites">("istilahi");
  const [activeLughowiSubTab, setActiveLughowiSubTab] = useState<"madhi" | "mudhari" | "amr">("madhi");
  const [activeJamakTab, setActiveJamakTab] = useState<"fail" | "maful" | "zamanmakan" | "alat">("fail");
  const [lafadzSize, setLafadzSize] = useState<"medium" | "large" | "xlarge">("large");
  const [favorites, setFavorites] = useState<DictionaryEntry[]>([]);
  const [showBabInfoModal, setShowBabInfoModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [username, setUsername] = useState("Tamu Mulia");

  // Load app data
  useEffect(() => {
    async function prepareApp() {
      try {
        // Load settings & favorites from AsyncStorage
        const savedTheme = await AsyncStorage.getItem("sdr_app_theme");
        if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "green") {
          setAppTheme(savedTheme);
        }
        
        const savedUsername = await AsyncStorage.getItem("sdr_username");
        if (savedUsername) {
          setUsername(savedUsername);
        }

        const savedFavorites = await AsyncStorage.getItem("sdr_local_favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        } else {
          // Initialize with Default Favorite
          setFavorites([PRESET_DICTIONARY[0]]);
        }
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Smooth loading splash transition
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const toggleFavorite = async () => {
    const isFav = favorites.some(f => f.id === selectedEntry.id);
    let updatedFavorites;
    if (isFav) {
      updatedFavorites = favorites.filter(f => f.id !== selectedEntry.id);
    } else {
      updatedFavorites = [selectedEntry, ...favorites];
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("sdr_local_favorites", JSON.stringify(updatedFavorites));
  };

  const isCurrentlyFavorited = useMemo(() => {
    return favorites.some(f => f.id === selectedEntry.id);
  }, [favorites, selectedEntry]);

  const changeTheme = async (theme: "dark" | "light" | "green") => {
    setAppTheme(theme);
    await AsyncStorage.setItem("sdr_app_theme", theme);
  };

  const saveProfile = async (newUsername: string) => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      await AsyncStorage.setItem("sdr_username", newUsername);
    }
    setShowEditProfileModal(false);
  };

  // Filter presets based on search
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_DICTIONARY;
    const query = searchQuery.trim().toLowerCase();
    return PRESET_DICTIONARY.filter((entry) => {
      const translationMatch = entry.translation.toLowerCase().includes(query);
      const arabicRoot = `${entry.root.fa}${entry.root.ain}${entry.root.lam}`;
      const arabicMatch = arabicRoot.includes(query);
      return translationMatch || arabicMatch;
    });
  }, [searchQuery]);

  // Group presets
  const groupedPresetsByBab = useMemo(() => {
    const groups: Record<number, DictionaryEntry[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    filteredPresets.forEach((entry) => {
      const b = entry.babNum;
      if (groups[b]) groups[b].push(entry);
    });
    return groups;
  }, [filteredPresets]);

  const groupedPresetsByBina = useMemo(() => {
    const groups: Record<string, DictionaryEntry[]> = {};
    filteredPresets.forEach((entry) => {
      const b = entry.bina;
      if (!groups[b]) groups[b] = [];
      groups[b].push(entry);
    });
    return groups;
  }, [filteredPresets]);

  if (!appIsReady) {
    return null;
  }

  const tc = ThemeConfig[appTheme];

  // Helper to determine Arabic font sizes based on state
  const getArabicFontSize = () => {
    if (lafadzSize === "medium") return 22;
    if (lafadzSize === "large") return 28;
    return 34;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.bg }]} onLayout={onLayoutRootView}>
      <StatusBar barStyle={appTheme === "light" ? "dark-content" : "light-content"} backgroundColor={tc.header} />
      
      {/* Dynamic Header */}
      <View style={[styles.header, { backgroundColor: tc.header, borderBottomColor: tc.border }]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.logoContainer, { backgroundColor: tc.accent }]}>
            <BookOpen size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.headerTitleText, { color: tc.text }]}>Shorof Digital Pro</Text>
            <Text style={[styles.headerSubtitleText, { color: tc.subText }]}>KAMUS SHARAF & MORFOLOGI EXPO</Text>
          </View>
        </View>

        {/* User Account / Theme Switcher Combo */}
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: tc.card, borderColor: tc.border }]}
            onPress={() => setShowEditProfileModal(true)}
          >
            <User size={13} color={tc.text} />
            <Text style={[styles.profileButtonText, { color: tc.text }]} numberOfLines={1}>
              {username}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Search & Custom Quick Selection Bar */}
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.border }]}>
          <View style={styles.searchRow}>
            <Search size={16} color={tc.subText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: tc.text, backgroundColor: tc.bg }]}
              placeholder="Cari kata dasar atau makna..."
              placeholderTextColor={tc.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Group Filter Selector */}
          <View style={styles.filterTabRow}>
            <TouchableOpacity
              onPress={() => setPresetGroupMode("bab")}
              style={[
                styles.filterTabButton,
                presetGroupMode === "bab" && { backgroundColor: tc.accentBg, borderColor: tc.accent }
              ]}
            >
              <Text style={[styles.filterTabText, { color: presetGroupMode === "bab" ? tc.accent : tc.subText }]}>
                Pengelompokan Bab
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPresetGroupMode("bina")}
              style={[
                styles.filterTabButton,
                presetGroupMode === "bina" && { backgroundColor: tc.accentBg, borderColor: tc.accent }
              ]}
            >
              <Text style={[styles.filterTabText, { color: presetGroupMode === "bina" ? tc.accent : tc.subText }]}>
                Pengelompokan Bina'
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preset Scrollable List */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScrollContainer}>
            {presetGroupMode === "bab" ? (
              Object.keys(groupedPresetsByBab).map((babKey) => {
                const babNum = Number(babKey);
                const items = groupedPresetsByBab[babNum];
                if (items.length === 0) return null;
                return (
                  <View key={`bab-${babNum}`} style={styles.presetGroupBlock}>
                    <Text style={[styles.presetGroupLabel, { color: tc.amber }]}>Bab {babNum}</Text>
                    <View style={styles.presetItemsRow}>
                      {items.map((entry) => (
                        <TouchableOpacity
                          key={entry.id}
                          style={[
                            styles.presetWordItem,
                            { backgroundColor: tc.bg, borderColor: selectedEntry.id === entry.id ? tc.accent : tc.border }
                          ]}
                          onPress={() => setSelectedEntry(entry)}
                        >
                          <Text style={[styles.arabicTextPreset, { color: tc.text }]}>
                            {entry.shorof.madhi}
                          </Text>
                          <Text style={[styles.presetTranslation, { color: tc.subText }]} numberOfLines={1}>
                            {entry.translation.split("/")[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              Object.keys(groupedPresetsByBina).map((binaKey) => {
                const items = groupedPresetsByBina[binaKey];
                return (
                  <View key={`bina-${binaKey}`} style={styles.presetGroupBlock}>
                    <Text style={[styles.presetGroupLabel, { color: tc.amber }]}>{binaKey}</Text>
                    <View style={styles.presetItemsRow}>
                      {items.map((entry) => (
                        <TouchableOpacity
                          key={entry.id}
                          style={[
                            styles.presetWordItem,
                            { backgroundColor: tc.bg, borderColor: selectedEntry.id === entry.id ? tc.accent : tc.border }
                          ]}
                          onPress={() => setSelectedEntry(entry)}
                        >
                          <Text style={[styles.arabicTextPreset, { color: tc.text }]}>
                            {entry.shorof.madhi}
                          </Text>
                          <Text style={[styles.presetTranslation, { color: tc.subText }]} numberOfLines={1}>
                            {entry.translation.split("/")[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Selected Word Active Details Panel */}
        <View style={[styles.activeCard, { backgroundColor: tc.card, borderColor: tc.border }]}>
          <View style={styles.activeCardHeader}>
            <View style={styles.activeRootMeta}>
              <Text style={[styles.metaBabBadge, { backgroundColor: tc.accentBg, color: tc.accent }]}>
                Bab {selectedEntry.babNum} — {selectedEntry.bina}
              </Text>
              <TouchableOpacity onPress={() => setShowBabInfoModal(true)} style={styles.infoIconButton}>
                <Info size={15} color={tc.subText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              {isCurrentlyFavorited ? (
                <BookmarkCheck size={18} color={tc.amber} />
              ) : (
                <Bookmark size={18} color={tc.subText} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.rootDisplayRow}>
            <Text style={[styles.arabicMainRoot, { color: tc.amber }]}>
              {selectedEntry.shorof.madhi} - {selectedEntry.shorof.mudhari}
            </Text>
            <Text style={[styles.rootTranslationText, { color: tc.text }]}>
              "{selectedEntry.translation}"
            </Text>
          </View>

          <View style={[styles.asalPanel, { backgroundColor: tc.bg }]}>
            <View style={styles.asalRow}>
              <Text style={[styles.asalLabel, { color: tc.subText }]}>Bentuk Asal:</Text>
              <Text style={[styles.asalValue, { color: tc.accent }]}>{selectedEntry.asal || "—"}</Text>
            </View>
            <View style={styles.asalRow}>
              <Text style={[styles.asalLabel, { color: tc.subText }]}>Masdar:</Text>
              <Text style={[styles.asalValue, { color: tc.accent }]}>{selectedEntry.masdar || "—"}</Text>
            </View>
            <View style={styles.asalRow}>
              <Text style={[styles.asalLabel, { color: tc.subText }]}>Sifat Musyabihat:</Text>
              <Text style={[styles.asalValue, { color: tc.accent }]}>{selectedEntry.sifatMusyabihat || "—"}</Text>
            </View>
          </View>
          
          <Text style={[styles.activeDescription, { color: tc.subText }]}>
            {selectedEntry.explanation}
          </Text>

          {/* Size Adjuster Buttons */}
          <View style={styles.sizeAdjustRow}>
            <Text style={[styles.sizeLabel, { color: tc.subText }]}>Skala Huruf Arab:</Text>
            <View style={[styles.sizeSelector, { borderColor: tc.border }]}>
              {(["medium", "large", "xlarge"] as const).map((sz) => (
                <TouchableOpacity
                  key={sz}
                  onPress={() => setLafadzSize(sz)}
                  style={[
                    styles.sizeButton,
                    lafadzSize === sz && { backgroundColor: tc.accent }
                  ]}
                >
                  <Text style={[styles.sizeButtonText, { color: lafadzSize === sz ? "#ffffff" : tc.text }]}>
                    {sz === "medium" ? "M" : sz === "large" ? "L" : "XL"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Global Custom View Tabs */}
        <View style={styles.tabBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll}>
            {[
              { id: "istilahi", label: "Tashrif Istilahi" },
              { id: "lughowi", label: "Tashrif Lughowi" },
              { id: "sifat", label: "Sifat Musyabihat" },
              { id: "jama", label: "Jamak Taksir" },
              { id: "favorites", label: "Markah Favorit" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  style={[
                    styles.tabButton,
                    isActive && { backgroundColor: tc.accent, borderBottomWidth: 0 }
                  ]}
                >
                  <Text style={[styles.tabButtonText, { color: isActive ? "#ffffff" : tc.subText }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Dynamic Inner Tab Component Rendering */}
        <View style={[styles.tabContentCard, { backgroundColor: tc.card, borderColor: tc.border }]}>
          {activeTab === "istilahi" && (
            <View style={styles.shorofGrid}>
              <Text style={[styles.tabTitleText, { color: tc.text }]}>10 Shighot Tashrif Istilahi</Text>
              <View style={styles.gridContainer}>
                {[
                  { label: "Fi'il Madhi", ar: selectedEntry.shorof.madhi },
                  { label: "Fi'il Mudhari", ar: selectedEntry.shorof.mudhari },
                  { label: "Masdar Mu'akkad", ar: selectedEntry.shorof.masdar },
                  { label: "Isim Fa'il (Pelaku)", ar: selectedEntry.shorof.fail },
                  { label: "Isim Ma'ful (Objek)", ar: selectedEntry.shorof.maful },
                  { label: "Fi'il Amr (Perintah)", ar: selectedEntry.shorof.amr },
                  { label: "Fi'il Nahy (Larangan)", ar: selectedEntry.shorof.nahy },
                  { label: "Isim Zaman (Waktu)", ar: selectedEntry.shorof.zaman },
                  { label: "Isim Makan (Tempat)", ar: selectedEntry.shorof.makan },
                  { label: "Isim Alat (Peralatan)", ar: selectedEntry.shorof.alat },
                ].map((item, index) => (
                  <View key={index} style={[styles.gridCell, { borderColor: tc.border, backgroundColor: tc.bg }]}>
                    <Text style={[styles.cellLabel, { color: tc.subText }]}>{item.label}</Text>
                    <Text style={[styles.arabicCellText, { color: tc.amber, fontSize: getArabicFontSize() }]}>
                      {item.ar}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === "lughowi" && (
            <View>
              <View style={styles.lughowiControls}>
                <TouchableOpacity
                  onPress={() => setActiveLughowiSubTab("madhi")}
                  style={[styles.lughowiSubTab, activeLughowiSubTab === "madhi" && { borderBottomColor: tc.accent }]}
                >
                  <Text style={[styles.lughowiSubTabText, { color: activeLughowiSubTab === "madhi" ? tc.accent : tc.subText }]}>
                    Konjugasi Madhi
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveLughowiSubTab("mudhari")}
                  style={[styles.lughowiSubTab, activeLughowiSubTab === "mudhari" && { borderBottomColor: tc.accent }]}
                >
                  <Text style={[styles.lughowiSubTabText, { color: activeLughowiSubTab === "mudhari" ? tc.accent : tc.subText }]}>
                    Konjugasi Mudhari
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveLughowiSubTab("amr")}
                  style={[styles.lughowiSubTab, activeLughowiSubTab === "amr" && { borderBottomColor: tc.accent }]}
                >
                  <Text style={[styles.lughowiSubTabText, { color: activeLughowiSubTab === "amr" ? tc.accent : tc.subText }]}>
                    Konjugasi Amr
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.lughowiListContainer}>
                {activeLughowiSubTab === "madhi" &&
                  selectedEntry.lughowi.madhi.map((word, idx) => (
                    <View key={idx} style={[styles.lughowiRow, { borderBottomColor: tc.border }]}>
                      <Text style={[styles.lughowiDhomir, { color: tc.subText }]}>{DhomirList[idx]}</Text>
                      <Text style={[styles.arabicLughowiText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                        {word}
                      </Text>
                    </View>
                  ))}

                {activeLughowiSubTab === "mudhari" &&
                  selectedEntry.lughowi.mudhari.map((word, idx) => (
                    <View key={idx} style={[styles.lughowiRow, { borderBottomColor: tc.border }]}>
                      <Text style={[styles.lughowiDhomir, { color: tc.subText }]}>{DhomirList[idx]}</Text>
                      <Text style={[styles.arabicLughowiText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                        {word}
                      </Text>
                    </View>
                  ))}

                {activeLughowiSubTab === "amr" &&
                  selectedEntry.lughowi.amr.map((word, idx) => (
                    <View key={idx} style={[styles.lughowiRow, { borderBottomColor: tc.border }]}>
                      <Text style={[styles.lughowiDhomir, { color: tc.subText }]}>{AmrDhomirList[idx]}</Text>
                      <Text style={[styles.arabicLughowiText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                        {word}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {activeTab === "sifat" && (
            <View style={styles.tabContentContainer}>
              <View style={[styles.bannerAlert, { backgroundColor: tc.accentBg }]}>
                <Layers size={18} color={tc.accent} style={styles.bannerIcon} />
                <Text style={[styles.bannerText, { color: tc.text }]}>
                  Sifat Musyabihat melambangkan sifat lahiriah/kondisi batin subjek yang bersifat stabil, permanen, atau melekat kuat pada watak subjek.
                </Text>
              </View>

              <View style={[styles.sifatCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                <Text style={[styles.sifatHeader, { color: tc.subText }]}>Wazan Pembentuk Utama:</Text>
                <Text style={[styles.sifatValueBold, { color: tc.amber }]}>
                  {selectedEntry.plurals.sifat.wazan_name || "Sama'i"}
                </Text>
              </View>

              <View style={styles.pluralsSectionGrid}>
                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Singular (Mufrod)</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.sifatMusyabihat || "—"}
                  </Text>
                </View>

                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Jamak Taksir (Plural)</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.plurals.sifat.katsroh || "—"}
                  </Text>
                </View>

                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Muntahal Jumu'</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.plurals.sifat.muntahal || "—"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "jama" && (
            <View>
              <View style={styles.lughowiControls}>
                {[
                  { id: "fail", label: "Isim Fa'il" },
                  { id: "maful", label: "Isim Ma'ful" },
                  { id: "zamanmakan", label: "Zaman Makan" },
                  { id: "alat", label: "Isim Alat" },
                ].map((jt) => (
                  <TouchableOpacity
                    key={jt.id}
                    onPress={() => setActiveJamakTab(jt.id as any)}
                    style={[styles.lughowiSubTab, activeJamakTab === jt.id && { borderBottomColor: tc.accent }]}
                  >
                    <Text style={[styles.lughowiSubTabText, { color: activeJamakTab === jt.id ? tc.accent : tc.subText }]}>
                      {jt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.pluralsSectionGrid}>
                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Taksir Qillah</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.plurals[activeJamakTab].qillah || "—"}
                  </Text>
                </View>

                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Taksir Katsroh</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.plurals[activeJamakTab].katsroh || "—"}
                  </Text>
                </View>

                <View style={[styles.pluralCardCell, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                  <Text style={[styles.pluralCardHeaderLabel, { color: tc.subText }]}>Muntahal Jumu'</Text>
                  <Text style={[styles.arabicPluralText, { color: tc.accent, fontSize: getArabicFontSize() }]}>
                    {selectedEntry.plurals[activeJamakTab].muntahal || "—"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "favorites" && (
            <View>
              <Text style={[styles.tabTitleText, { color: tc.text }]}>Markah & Favorit Saya ({favorites.length})</Text>
              {favorites.length === 0 ? (
                <Text style={[styles.emptyText, { color: tc.subText }]}>Belum ada kosa kata tersimpan.</Text>
              ) : (
                <View style={styles.favoritesGrid}>
                  {favorites.map((fav) => (
                    <TouchableOpacity
                      key={fav.id}
                      style={[styles.favoriteItemCard, { backgroundColor: tc.bg, borderColor: tc.border }]}
                      onPress={() => setSelectedEntry(fav)}
                    >
                      <Text style={[styles.favArabicText, { color: tc.amber }]}>{fav.shorof.madhi}</Text>
                      <Text style={[styles.favTranslateText, { color: tc.text }]}>{fav.translation.split("/")[0]}</Text>
                      <Text style={[styles.favMetaText, { color: tc.subText }]}>Bab {fav.babNum} — {fav.bina}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Global Settings & Themes Selector Applet */}
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.border, marginTop: 12, marginBottom: 35 }]}>
          <View style={styles.settingsHeader}>
            <Settings size={16} color={tc.amber} style={styles.settingsIcon} />
            <Text style={[styles.settingsTitle, { color: tc.text }]}>Pengaturan Tema SDR</Text>
          </View>
          <Text style={[styles.settingsSubtitle, { color: tc.subText }]}>
            Ganti tema warna interface sesuai kenyamanan mata belajar Anda:
          </Text>
          <View style={styles.themeSelectorRow}>
            {(["dark", "light", "green"] as const).map((themeName) => (
              <TouchableOpacity
                key={themeName}
                onPress={() => changeTheme(themeName)}
                style={[
                  styles.themeButton,
                  { backgroundColor: ThemeConfig[themeName].header, borderColor: appTheme === themeName ? tc.accent : ThemeConfig[themeName].border }
                ]}
              >
                <Text style={[styles.themeButtonText, { color: ThemeConfig[themeName].text }]}>
                  {themeName === "dark" ? "Dark Slate" : themeName === "light" ? "Light Warm" : "Green Masjid"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: BAB INFO MODAL */}
      <Modal visible={showBabInfoModal} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: tc.card, borderColor: tc.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tc.text }]}>Logika Pola Bab Tsulasi Mujarrad</Text>
              <TouchableOpacity onPress={() => setShowBabInfoModal(false)}>
                <X size={20} color={tc.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {Object.keys(babExplanations).map((key) => {
                const num = Number(key);
                const info = babExplanations[num];
                return (
                  <View key={key} style={[styles.modalInfoBlock, { borderBottomColor: tc.border }]}>
                    <Text style={[styles.modalBlockTitle, { color: tc.amber }]}>{info.title}</Text>
                    <Text style={[styles.modalBlockSub, { color: tc.text }]}>{info.ringkas}</Text>
                    <Text style={[styles.modalBlockDetail, { color: tc.subText }]}>{info.detail}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowBabInfoModal(false)} style={[styles.modalCloseButton, { backgroundColor: tc.accent }]}>
              <Text style={styles.modalCloseButtonText}>Selesai & Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: EDIT PROFILE MODAL */}
      <Modal visible={showEditProfileModal} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={[styles.profileModalContent, { backgroundColor: tc.card, borderColor: tc.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tc.text }]}>Edit Profil Belajar SDR</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <X size={20} color={tc.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInputBlock}>
              <Text style={[styles.profileInputLabel, { color: tc.subText }]}>Nama Lengkap:</Text>
              <TextInput
                style={[styles.profileTextInput, { color: tc.text, backgroundColor: tc.bg, borderColor: tc.border }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Tulis namamu..."
                placeholderTextColor={tc.subText}
              />
            </View>

            <View style={styles.profileButtonsRow}>
              <TouchableOpacity 
                onPress={() => setShowEditProfileModal(false)} 
                style={[styles.profileCancelBtn, { borderColor: tc.border }]}
              >
                <Text style={[styles.profileCancelBtnText, { color: tc.text }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => saveProfile(username)} 
                style={[styles.profileSaveBtn, { backgroundColor: tc.accent }]}
              >
                <Text style={styles.profileSaveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitleText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 130,
  },
  profileButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 5,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  filterTabRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginHorizontal: 3,
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  presetScrollContainer: {
    marginTop: 4,
  },
  presetGroupBlock: {
    marginRight: 16,
    minWidth: 110,
  },
  presetGroupLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  presetItemsRow: {
    flexDirection: "row",
  },
  presetWordItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    minWidth: 80,
  },
  arabicTextPreset: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  presetTranslation: {
    fontSize: 9,
    textAlign: "center",
  },
  activeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  activeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeRootMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaBabBadge: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  infoIconButton: {
    marginLeft: 6,
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  rootDisplayRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  arabicMainRoot: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  rootTranslationText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  asalPanel: {
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  asalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  asalLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  asalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeDescription: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },
  sizeAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.1)",
  },
  sizeLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sizeSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
  },
  sizeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 1,
  },
  sizeButtonText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  tabBarContainer: {
    marginVertical: 10,
  },
  tabBarScroll: {
    flexDirection: "row",
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  tabContentCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  shorofGrid: {
    width: "100%",
  },
  tabTitleText: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCell: {
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "center",
  },
  arabicCellText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  lughowiControls: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
    marginBottom: 14,
  },
  lughowiSubTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  lughowiSubTabText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  lughowiListContainer: {
    width: "100%",
  },
  lughowiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lughowiDhomir: {
    fontSize: 11,
    fontWeight: "500",
  },
  arabicLughowiText: {
    fontWeight: "bold",
  },
  tabContentContainer: {
    width: "100%",
  },
  bannerAlert: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  bannerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 15,
  },
  sifatCell: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sifatHeader: {
    fontSize: 11,
    fontWeight: "600",
  },
  sifatValueBold: {
    fontSize: 12,
    fontWeight: "bold",
  },
  pluralsSectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pluralCardCell: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pluralCardHeaderLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  arabicPluralText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 20,
  },
  favoritesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  favoriteItemCard: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  favArabicText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  favTranslateText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  favMetaText: {
    fontSize: 9,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingsIcon: {
    marginRight: 6,
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  settingsSubtitle: {
    fontSize: 10.5,
    marginBottom: 12,
  },
  themeSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  themeButtonText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalBody: {
    flex: 1,
    marginBottom: 15,
  },
  modalInfoBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalBlockTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalBlockSub: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalBlockDetail: {
    fontSize: 10,
    lineHeight: 14,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileModalContent: {
    width: "90%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  profileInputBlock: {
    marginVertical: 15,
  },
  profileInputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },
  profileTextInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  profileButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  profileCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  profileCancelBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  profileSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  profileSaveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  }
});
