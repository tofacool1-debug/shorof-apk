/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Layers,
  Table,
  HelpCircle,
  Info,
  ExternalLink,
  Copy,
  Lock,
  X,
  Download,
  Smartphone,
  Share,
  Monitor,
  Settings,
  Sun,
  Moon,
  Type,
  User,
  Clock,
  Bookmark,
  Menu,
  Check,
  Edit3,
  Upload,
  Play,
  RotateCcw,
  Code,
  Terminal,
  Cpu,
  Tv,
  Eye,
  Activity,
  Award,
  CreditCard,
  Bell,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  FileCode,
  Folder,
  RefreshCw,
  Zap,
  CheckCircle2,
  LockKeyhole
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DictionaryEntry, TasrifIstilahi, DataWazan } from "./types";
import { PRESET_DICTIONARY, WAZAN_TEMPLATES } from "./utils/dictionaryData";
import { IilalEngine } from "./utils/iilalEngine";
import { analyzeSifatMusyabihatPlural } from "./utils/sifatMusyabihatPlural";
import { analyzeIsimFailPlural } from "./utils/isimFailPlural";
import { analyzeIsimMafulPlural } from "./utils/isimMafulPlural";
import { analyzeIsimZamanMakanPlural, analyzeIsimAlatPlural } from "./utils/isimZamanMakanAlatPlural";

// Subcomponents
import DictionaryList from "./components/DictionaryList";
import TasrifIstilahiView from "./components/TasrifIstilahiView";
import TasrifLughowiView from "./components/TasrifLughowiView";
import ShorofMasdarTableView from "./components/ShorofMasdarTableView";

export default function App() {
  // Mobile Simulator States
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [hasSelected, setHasSelected] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"istilahi" | "lughowi" | "masdar" | "jama" | "iilal" | "favorites">("istilahi");
  const [activeJamakTab, setActiveJamakTab] = useState<"fail" | "maful" | "zamanmakan" | "alat" | "sifat">("fail");
  
  // App UI Mode Layout
  const [viewMode, setViewMode] = useState<"both" | "simulator" | "developer">("both");
  
  // Premium States (Local & Cloud Sync representation)
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sdr_premium_unlocked") === "true";
    }
    return false;
  });
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [billingPlan, setBillingPlan] = useState<string>("");

  // User Customize States inside virtual phone
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let saved = localStorage.getItem("sdr_username");
      if (!saved) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        saved = `Tamu Mulia ${randomNum}`;
        localStorage.setItem("sdr_username", saved);
      }
      return saved;
    }
    return "Tamu Mulia";
  });
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sdr_profile_photo") || "avatar1";
    }
    return "avatar1";
  });
  const [lafadzSize, setLafadzSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<DictionaryEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sdr_favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Search state inside virtual phone
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWordInfo, setSelectedWordInfo] = useState<{ word: string; shighot: string } | null>(null);

  // OTA Updates Simulation State inside Phone
  const [showOTADialog, setShowOTADialog] = useState(false);
  const [otaStatus, setOtaStatus] = useState<"idle" | "downloading" | "ready">("idle");

  // RIGHT PANEL STATES (Expo Dev Tools & VS Code simulator)
  const [selectedFile, setSelectedFile] = useState<string>("App.js");
  const [editorCode, setEditorCode] = useState<string>("");
  const [showEditorSaveToast, setShowEditorSaveToast] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"terminal" | "build" | "ota" | "integrations">("terminal");

  // Terminal Logs and state
  const [terminalState, setTerminalState] = useState<"stopped" | "starting" | "running">("stopped");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // EAS Build Progress
  const [buildPlatform, setBuildPlatform] = useState<"android" | "ios">("android");
  const [buildProgress, setBuildProgress] = useState<number>(-1); // -1 means none
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [compiledApkUrl, setCompiledApkUrl] = useState<string>("");
  const buildBottomRef = useRef<HTMLDivElement>(null);

  // OTA Publishing Simulator state
  const [otaPublishProgress, setOtaPublishProgress] = useState<number>(-1);
  const [otaPublishLogs, setOtaPublishLogs] = useState<string[]>([]);

  // Custom AI explanation state loaded in simulated phone
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplanationText, setAiExplanationText] = useState<string>("");

  // Simulated React Native / Expo Files Content Cache
  const [filesCache, setFilesCache] = useState<Record<string, string>>({
    "App.js": `import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, StatusBar, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Updates from 'expo-updates';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('Checking database...');
  const [canGoBack, setCanGoBack] = useState(false);
  const appUrl = 'https://shorof-digital.vercel.app/'; // Production Sync
  let webViewRef = null;

  // Handle Android Hardware Back Button inside WebView history
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef) {
        webViewRef.goBack();
        return true; // Prevents app exit
      }
      return false; 
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [canGoBack]);

  // EAS Update Listener to automatically refresh database Over-The-Air (OTA)
  useEffect(() => {
    async function checkAndApplyUpdates() {
      if (__DEV__) {
        setInitialLoading(false);
        return;
      }
      try {
        setUpdateStatus('Memeriksa pembaruan database...');
        const updateCheck = await Updates.checkForUpdateAsync();
        if (updateCheck.isAvailable) {
          setUpdateStatus('Mengunduh pembaruan rincian...');
          await Updates.fetchUpdateAsync();
          setUpdateStatus('Memasang pembaruan...');
          Alert.alert(
            'Shorof Pro Diperbarui',
            'Sistem berhasil menyelaraskan database rumusan I\\'ilal and plural terbaru tanpa perlu install ulang APK!',
            [{ text: 'Luncurkan Ulang', onPress: async () => await Updates.reloadAsync() }]
          );
        } else {
          setInitialLoading(false);
        }
      } catch (error) {
        console.log('Error checking updates:', error);
        setInitialLoading(false); 
      }
    }
    checkAndApplyUpdates();
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Shorof Digital Pro</Text>
        <Text style={styles.subText}>{updateStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
  ref={(ref) => (webViewRef = ref)}
  source={{ uri: appUrl }}
  style={styles.webView}
  startInLoadingState={true}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  mixedContentMode="compatibility"
  originWhitelist={['*']}
  onNavigationStateChange={(navState) =>{
    setCanGoBack(navState.canGoBack);
  }}
        renderLoading={() => (
          <View style={styles.webviewLoader}>
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 24 },
  loadingText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 16 },
  subText: { fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'center' },
  webviewLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }
});`,
    "app.json": `{
  "expo": {
    "name": "Shorof Digital Pro",
    "slug": "shorof-digital-pro",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.kamus.shorofiilal",
      "infoPlist": {
        "NSCameraUsageDescription": "Aplikasi memerlukan kamera untuk mengunggah foto profil."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.kamus.shorof.iilal",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/icon.png"
    },
    "updates": {
      "url": "https://u.expo.dev/71474c2a-503f-473b-97a8-bb87cd4b3e9e",
      "fallbackToCacheTimeout": 5000,
      "checkOnLaunch": "ALWAYS",
      "enabled": true
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "extra": {
      "eas": {
        "projectId": "71474c2a-503f-473b-97a8-bb87cd4b3e9e"
      }
    }
  }
}`,
    "package.json": `{
  "name": "shorof-digital-pro-native",
  "version": "2.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "react-native-webview": "13.8.6",
    "expo-updates": "~0.25.14",
    "@react-native-async-storage/async-storage": "1.23.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "typescript": "~5.3.3"
  },
  "private": true
}`,
    "EXPO_BUILD_GUIDE.md": `# Panduan Lengkap Build Aplikasi Nativ & EAS

Shorof Digital Pro dikonfigurasi menggunakan **Expo SDK** yang memungkinkan pemeliharaan kode berbasis React murni untuk didistribusikan ke biner Android (.APK) dan iOS (.IPA).

## 🦾 Langkah Membangun Berkas APK Sendiri
1. Unduh salinan source program ini (Tekan menu Settings > Export ZIP).
2. Install dependensi global:
   \`\`\`bash
   npm install -g eas-cli
   \`\`\`
3. Hubungkan ke Cloud Expo Anda:
   \`\`\`bash
   eas login
   eas project:init --id 71474c2a-503f-473b-97a8-bb87cd4b3e9e
   \`\`\`
4. Mulai kompilasi Cloud Android:
   \`\`\`bash
   eas build --platform android --profile production
   \`\`\`
5. Simpan tautan APK hasil build di smartphone Anda!

## 🔄 Merilis Pembaruan Instan (EAS Update)
EAS Update digunakan untuk merilis update tanpa meminta user re-install APK:
\`\`\`bash
eas update --branch production --message "Update sistem plural"
\`\`\``,
    "metro.config.js": `const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Saring berkas statis JSON dan aset lafadz Arab agar diizinkan dimuat cepat
config.resolver.assetExts.push('json');

module.exports = config;`
  });

  // Set initial editor code from filesCache
  useEffect(() => {
    setEditorCode(filesCache[selectedFile]);
  }, [selectedFile]);

  // Handle saving editor changes
  const handleEditorSave = () => {
    setFilesCache(prev => ({ ...prev, [selectedFile]: editorCode }));
    setShowEditorSaveToast(true);
    setTimeout(() => setShowEditorSaveToast(false), 2000);
    
    // Output hot-reload in Terminal if running
    if (terminalState === "running") {
      logTerminal(`[Metro] Deteksi perubahan berkas '${selectedFile}'. Memulai kompilasi ulang...`);
      setTimeout(() => {
        logTerminal("[Metro] Hot-Reload berhasil dimasukkan ke virtual smartphone dev!");
      }, 800);
    }
  };

  // Convert active mode parameters into an unified Wazan dataset for calculations
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
      sifatMusyabihat: selectedEntry.sifatMusyabihat || template.sifatMusyabihat,
      babNum: selectedEntry.babNum
    };
  }, [selectedEntry]);

  // Tasrif calculations bertenaga IilalEngine (Local backup)
  const calculatedTasrif = useMemo((): TasrifIstilahi => {
    return IilalEngine.tasrifIstilahiCustom(activeWazanData);
  }, [activeWazanData]);

  // Plurals calculation from local engines
  const structuralPlurals = useMemo(() => {
    return {
      fail: analyzeIsimFailPlural(selectedEntry),
      maful: analyzeIsimMafulPlural(selectedEntry),
      zamanmakan: analyzeIsimZamanMakanPlural(selectedEntry),
      alat: analyzeIsimAlatPlural(selectedEntry),
      sifat: analyzeSifatMusyabihatPlural(selectedEntry)
    };
  }, [selectedEntry]);

  // Filter dictionary based on query in smartphone
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_DICTIONARY;
    const query = searchQuery.trim().toLowerCase();
    return PRESET_DICTIONARY.filter(entry => {
      const translationMatch = entry.translation.toLowerCase().includes(query);
      const latinRoot = `${entry.root.fa} ${entry.root.ain} ${entry.root.lam}`.toLowerCase();
      const latinRootMatch = latinRoot.includes(query);
      const arabicRoot = `${entry.root.fa}${entry.root.ain}${entry.root.lam}`;
      const arabicMatch = arabicRoot.includes(query);
      return translationMatch || latinRootMatch || arabicMatch;
    });
  }, [searchQuery]);

  // Terminal actions
  const logTerminal = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleRunMetroStart = () => {
    if (terminalState === "running") {
      logTerminal("Metro Bandler sudah berjalan aktif di port 8081.");
      return;
    }
    setTerminalState("starting");
    logTerminal("Inisiasi Metro Bundler (npx expo start)...");
    
    setTimeout(() => {
      logTerminal("Memuat berkas konfigurasi metro.config.js...");
    }, 500);

    setTimeout(() => {
      setTerminalState("running");
      logTerminal("✔ Metro Bundler berhasil diaktifkan.");
      logTerminal("Metro Dev Server berjalan aktif pada:");
      logTerminal("  › Metro: http://localhost:8081");
      logTerminal("  › Mode Ekspos Server Terowongan: https://u.expo.dev/71474c2a-503f-473b-97a8-bb87cd4b3e9e");
      logTerminal("Scan Scan QR-Code di panel untuk mementaskan luring di seluler Anda!");
    }, 1200);
  };

  const handleStopMetro = () => {
    setTerminalState("stopped");
    logTerminal("■ Metro Bundler server dimatikan secara manual.");
  };

  const clearTerminal = () => {
    setTerminalLogs([]);
  };

  // Scroll to bottoms
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (buildBottomRef.current) {
      buildBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [buildLogs]);

  // EAS Build Executor
  const handleStartEasBuild = (platform: "android" | "ios") => {
    setBuildPlatform(platform);
    setBuildProgress(0);
    setCompiledApkUrl("");
    const logoName = platform === "android" ? "Shorof_Digital_Pro_2.0.apk" : "Shorof_Digital_Pro_2.0.ipa";

    const logList = [
      `[eas] Membuka koneksi cloud ke akun Expo: tofacool1...`,
      `[eas] Sinkronisasi project ID: 71474c2a-503f-473b-97a8-bb87cd4b3e9e...`,
      `[eas] Memverifikasi profil pembungkus app.json...`,
      `[gradle] Inisiasi kompilasi berkas Gradle Java/Kotlin (Android SDK level 34)...`,
      `[gradle] Mengunduh dependensi Gradle dan bundel cache...`,
      `[gradle] Membaca DatabaseHelper.kt (Menghubungkan SQLite lokal)...`,
      `[gradle] Membaca luring berkas 'assets/data lafadz_db.json'...`,
      `[gradle] Kompilasi modul internal Android IilalEngine dan Plural Core...`,
      `[gradle] Mengompres kode biner Java & Proguard Obfuscation...`,
      `[gradle] Menandatangani sertifikat rilis pengembang (Keystore Android)...`,
      `[eas] Mengemas berkas biner digital: ${logoName}...`,
      `[eas] Mengunggah bundel ke CDN aman Expo Cloud...`,
      `[eas] Kompilasi SELESAI Sempurna!`
    ];

    setBuildLogs([`[01:14:50] Memulai EAS Build Cloud compiler untuk platform: ${platform.toUpperCase()}`]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < logList.length) {
        setBuildLogs(prev => [...prev, logList[step]]);
        setBuildProgress(Math.floor(((step + 1) / logList.length) * 100));
        step++;
      } else {
        clearInterval(interval);
        setCompiledApkUrl(`https://u.expo.dev/download/${platform === "android" ? "apk" : "ios"}`);
        setBuildLogs(prev => [...prev, `✔ Berkas berhasil disintesis: ${logoName} (Selesai dalam 12 detik)`]);
      }
    }, 1000);
  };

  // EAS OTA Release Update Executor
  const handleReleaseOtaUpdate = () => {
    setOtaPublishProgress(0);
    const updatesLogs = [
      `[eas-update] Memulai peninjauan aset lokal...`,
      `[eas-update] Mengumpulkan berkas kamus, plural core, dan lafadz_db.json...`,
      `[eas-update] Membuat tanda tangan manifest OTA bundel...`,
      `[eas-update] Mengunggah bundel pembaruan ke cabang 'production'...`,
      `[eas-update] Sukses merilis update ke server CDN Expo!`
    ];

    setOtaPublishLogs([`[update] Memeriksa cabang rilis EAS Update...`]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < updatesLogs.length) {
        setOtaPublishLogs(prev => [...prev, updatesLogs[step]]);
        setOtaPublishProgress(Math.floor(((step + 1) / updatesLogs.length) * 100));
        step++;
      } else {
        clearInterval(interval);
        setOtaPublishLogs(prev => [...prev, `🎉 Pembaruan OTA berhasil diluncurkan ke seluruh dunia!`]);
        
        // INTERACTIVE MAGIC: Trigger notifications inside the simulated phone!!
        setShowOTADialog(true);
        setOtaStatus("ready");
      }
    }, 1000);
  };

  // Toggle favorite in virtual phone database
  const handleToggleFavoriteMobile = (entry: DictionaryEntry) => {
    const exists = favorites.some(fav => fav.id === entry.id);
    let updated;
    if (exists) {
      updated = favorites.filter(fav => fav.id !== entry.id);
    } else {
      updated = [...favorites, entry];
    }
    setFavorites(updated);
    localStorage.setItem("sdr_favorites", JSON.stringify(updated));
    logTerminal(`[Simulasi Database] Mengubah favorit kata '${entry.root.fa}${entry.root.ain}${entry.root.lam}' (${updated.length} tersimpan)`);
  };

  // Profile management in phone
  const handleSaveProfile = (newName: string, newPhoto: string) => {
    setUsername(newName);
    setProfilePhoto(newPhoto);
    localStorage.setItem("sdr_username", newName);
    localStorage.setItem("sdr_profile_photo", newPhoto);
    setShowEditProfileModal(false);
    logTerminal(`[Simulasi Profil] Memperbarui nama pengguna menjadi: "${newName}"`);
  };

  // Mock photo list
  const MOCK_PHOTOS = ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6"];

  const renderPhoneProfileImage = (photoVal: string, sizeClass: string = "w-10 h-10") => {
    if (photoVal.startsWith("data:image") || photoVal.startsWith("http")) {
      return (
        <img
          src={photoVal}
          alt="Avatar"
          className={`${sizeClass} rounded-full object-cover border border-emerald-500/20 shadow-inner`}
        />
      );
    }
    
    let bgClass = "bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-400/20";
    let letter = username ? username.charAt(0).toUpperCase() : "T";
    
    switch (photoVal) {
      case "avatar1": bgClass = "bg-gradient-to-br from-emerald-600 to-teal-800 text-white"; break;
      case "avatar2": bgClass = "bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950"; break;
      case "avatar4": bgClass = "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"; break;
      case "avatar5": bgClass = "bg-gradient-to-br from-rose-500 to-pink-600 text-white"; break;
      case "avatar6": bgClass = "bg-gradient-to-br from-violet-500 to-purple-700 text-white"; break;
      default: bgClass = "bg-gradient-to-br from-indigo-500 to-sky-600 text-white"; break;
    }

    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 border font-bold text-xs shadow-sm uppercase ${bgClass}`}>
        {letter}
      </div>
    );
  };

  // Simulated Payment integration with Midtrans
  const handleSimulateMidtransPay = (price: number, planName: string, planCode: string) => {
    setIsPaymentLoading(true);
    setBillingPlan(planName);
    setPaymentMessage("Menghubungkan ke Gerbang Pembayaran Midtrans Snap...");
    
    setTimeout(() => {
      setPaymentMessage(`[Midtrans] Membuat SNAP Token ID untuk ${planName}...`);
    }, 1000);

    setTimeout(() => {
      setIsPaymentLoading(false);
    }, 2000);
  };

  const handleCompletePaymentSimulated = (success: boolean) => {
    if (success) {
      setIsPremium(true);
      localStorage.setItem("sdr_premium_unlocked", "true");
      setShowPremiumModal(false);
      alert(`Aktivasi Sukses! Fitur Premium untuk paket "${billingPlan}" diaktifkan secara luring.`);
      logTerminal(`[Simulasi Transaksi] Upgrade Premium Berhasil untuk paket: ${billingPlan}`);
    }
    setBillingPlan("");
  };

  // Offline local explanation generator
  const triggerAiExplanation = async () => {
    setAiExplainLoading(true);
    setAiExplanationText("");
    
    // Simulate short loader for a highly polished offline experience
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const fallback = `### 📚 Penjelasan Kaidah I'lal (${selectedEntry.root.fa} - ${selectedEntry.root.ain} - ${selectedEntry.root.lam}) Bina' ${selectedEntry.bina || "Shohih"}
Pola perubahan akar kata mengikuti Wazan Bab ${selectedEntry.babNum}. 

Untuk kosa kata ini, rujukan utama dari **Kamus Al-Munawwir** menjelaskan makna kata adalah:
> **"${selectedEntry.translation}"**

${selectedEntry.notes || "Akar kata ini mengalami transformasi kaidah sharaf standar sesuai klasifikasinya."}

*Analisis ini disajikan secara cepat dan handal dari database luring sistem.*`;
    setAiExplanationText(fallback);
    logTerminal(`[Analisis Sharaf] Berhasil me-load analisis kaidah luring dari database lokal.`);
    setAiExplainLoading(false);
  };

  // Sync to Cloud backup databases `/api/favorites`
  const handleSyncFavoritesToCloud = async () => {
    if (favorites.length === 0) {
      alert("Masukkan minimal satu kata favorit untuk disinkronisasi ke server Cloud.");
      return;
    }
    logTerminal("[Cloud database Sync] Memulai pencadangan database favorit ke `/api/favorites`...");
    try {
      const response = await fetch("/api/favorites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: favorites })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Sinkronisasi Awan Berhasil! ${data.count} kosakata anyar dicadangkan di Cloud Database.`);
        logTerminal(`[Cloud database Sync] Berhasil mencadangkan ${data.count} kata.`);
      } else {
        alert("Gagal menyinkronkan data: " + data.error);
      }
    } catch (e: any) {
      alert("Sistem Cloud luring, disimpan secara lokal di cache: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Top Main Developer Workspace Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-emerald-500/20 shadow-md">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2 text-white">
              Shorof Digital Pro <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">Expo Core V2.0</span>
            </h1>
            <p className="text-xs text-slate-400">Pengembangan Aplikasi Seluler Nativ & Konsol Expo DevTools</p>
          </div>
        </div>

        {/* View Mode Selectors for layout convenience */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-x-1">
          <button
            onClick={() => setViewMode("both")}
            className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${viewMode === "both" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tampilan Dual</span>
          </button>
          <button
            onClick={() => setViewMode("simulator")}
            className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${viewMode === "simulator" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HP Simulator</span>
          </button>
          <button
            onClick={() => setViewMode("developer")}
            className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${viewMode === "developer" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VS Code Expo</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Window layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* PANEL KIRI: Interactive Virtual Smartphone Simulator Container */}
        {(viewMode === "both" || viewMode === "simulator") && (
          <div className={`${viewMode === "simulator" ? "lg:col-span-8 lg:col-start-3" : "lg:col-span-5 xl:col-span-4"} flex flex-col items-center justify-center p-2`}>
            
            {/* The physical body of the smartphone mockup */}
            <div className="relative w-full max-w-[365px] bg-slate-900 rounded-[50px] p-4 border-8 border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-slate-700 overflow-hidden flex flex-col aspect-[9/19]">
              
              {/* Phone Top Notch decoration & virtual speaker */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-36 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-3 border border-slate-750" />
              </div>

              {/* Virtual Glass Reflection */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30" />

              {/* Status Indicator Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-3 pt-1.5 pb-2 font-mono select-none">
                <span>01:14 (EAS)</span>
                <div className="flex items-center space-x-2">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>5G WiFi</span>
                  <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex justify-start items-center">
                    <div className="h-full bg-emerald-500 w-4 rounded-2x" />
                  </div>
                </div>
              </div>

              {/* Active Mobile Display Screeen */}
              <div className="flex-1 bg-slate-950 rounded-[36px] flex flex-col overflow-hidden border border-slate-800 relative text-slate-200">
                
                {/* Virtual Navigation Inner Header inside Screen */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-3.5 border-b border-emerald-500/10 flex items-center justify-between sticky top-0 z-20">
                  <div className="flex items-center space-x-2.5">
                    {renderPhoneProfileImage(profilePhoto)}
                    <div>
                      <p className="text-[10px] text-slate-400 leading-tight">Selamat Datang,</p>
                      <button 
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-xs font-extrabold text-white flex items-center gap-1 hover:text-emerald-400 transition"
                      >
                        {username} <Edit3 className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* PRO Status or upgrade Toggle button */}
                  {isPremium ? (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-black select-none shadow">
                      <Award className="w-3 h-3 text-amber-400 animate-spin" />
                      <span>PRO MEMBAR</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 shadow-md transition-transform active:scale-95"
                    >
                      <LockKeyhole className="w-3 h-3" />
                      <span>AKTIF PRO</span>
                    </button>
                  )}
                </div>

                {/* Simulated Content Frame (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
                  
                  {/* Search and Quick Reference Selection Widget */}
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="search"
                        placeholder="Cari lafadz atau akar kata..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quick Horizontal Presets Carousal */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 px-0.5 uppercase tracking-wider font-bold">Preset Shorof Pilihan ({filteredPresets.length})</p>
                      <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto pr-1">
                        {filteredPresets.map((entry) => {
                          const isSel = entry.id === selectedEntry.id;
                          return (
                            <button
                              key={entry.id}
                              onClick={() => {
                                setSelectedEntry(entry);
                                setHasSelected(true);
                                setAiExplanationText("");
                              }}
                              className={`text-[10px] px-2 py-1 rounded-lg transition-all text-right font-medium flex items-center space-x-1 border ${
                                isSel
                                  ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/10 shadow-lg"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="font-arabic font-extrabold">{entry.root.fa}َ{entry.root.ain}َ{entry.root.lam}َ</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Active Selected Verb Showcase Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 relative overflow-hidden shadow-md">
                    <div className="absolute top-2 right-2 flex space-x-1.5 z-10">
                      <button
                        onClick={() => handleToggleFavoriteMobile(selectedEntry)}
                        className="p-1 px-2.5 rounded-full bg-slate-950/60 border border-slate-800 hover:border-slate-600 text-amber-400 flex items-center justify-center"
                        title="Simpan Favorit"
                      >
                        {favorites.some(f => f.id === selectedEntry.id) ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col items-center py-2.5 space-y-1">
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Bab {selectedEntry.babNum} — Bina' {selectedEntry.bina || "Shohih"}
                      </div>
                      <h2 className="text-3xl font-arabic font-black text-amber-400 tracking-wide pt-1 animate-floating-gold select-none">
                        {selectedEntry.root.fa}َ{selectedEntry.root.ain}َ{selectedEntry.root.lam}َ
                      </h2>
                      <p className="text-xs text-slate-300 font-medium text-center italic px-4 select-text">
                        "{selectedEntry.translation}"
                      </p>
                    </div>

                    {/* Mini Quick Stats Footer with badges */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500">Kamus Rujukan:</span>
                        <span className="font-medium inline-block truncate select-all">{selectedEntry.reference || "Lisanul 'Arab"}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500">Asal Mula:</span>
                        <span className="font-arabic text-amber-200 select-all">{selectedEntry.asal || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Tab Selectors in Phone Display */}
                  <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 z-10 relative overflow-x-auto gap-1">
                    <button
                      onClick={() => setActiveTab("istilahi")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "istilahi" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Istilahi
                    </button>
                    <button
                      onClick={() => setActiveTab("lughowi")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "lughowi" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Lughowi
                    </button>
                    <button
                      onClick={() => setActiveTab("masdar")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "masdar" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Komparasi Masdar (Sama'i / Qiyasi)
                    </button>
                    <button
                      onClick={() => setActiveTab("jama")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "jama" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Tabel Jama'
                    </button>
                    <button
                      onClick={() => setActiveTab("iilal")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "iilal" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Kaidah I'lal
                    </button>
                    <button
                      onClick={() => setActiveTab("favorites")}
                      className={`text-[10px] font-bold px-2.5 py-2.5 rounded-xl transition shrink-0 select-none ${activeTab === "favorites" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Simpanan
                    </button>
                  </div>

                  {/* Render content depending on activeTab in simulator */}
                  <div className="space-y-3 z-10 relative">
                    
                    {/* Tab 1: Tasrif Istilahi */}
                    {activeTab === "istilahi" && (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Skema Istilahi Horisontal</p>
                          <div className="flex space-x-1.5 text-[9px] text-slate-400">
                            <span>Ukuran:</span>
                            <button onClick={() => setLafadzSize("small")} className={`px-1.5 border border-slate-800 rounded-md ${lafadzSize === "small" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}`}>S</button>
                            <button onClick={() => setLafadzSize("medium")} className={`px-1.5 border border-slate-800 rounded-md ${lafadzSize === "medium" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}`}>M</button>
                            <button onClick={() => setLafadzSize("large")} className={`px-1.5 border border-slate-800 rounded-md ${lafadzSize === "large" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}`}>L</button>
                          </div>
                        </div>

                        {/* Scrolling Vertical Card List for Native Layout */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {[
                            { label: "Fi'il Madhi", value: calculatedTasrif.madhi, sub: "الفعل الماضي" },
                            { label: "Fi'il Mudhori", value: calculatedTasrif.mudhari, sub: "الفعل المضارع" },
                            { label: "Masdar Qiyasi", value: calculatedTasrif.masdar, sub: "المصدر القياسي" },
                            { label: "Fa'il (Aktor)", value: calculatedTasrif.isimFail.mufrod, sub: "اسم الفاعل" },
                            { label: "Maful (Penderita)", value: calculatedTasrif.isimMaful.mufrod, sub: "اسم المفعول" },
                            { label: "Sifat Musyabihat", value: calculatedTasrif.isimMusyabihat.mufrod || selectedEntry.sifatMusyabihat || "—", sub: "الصفة المشبهة" },
                            { label: "Fi'il Amar (Perintah)", value: calculatedTasrif.amar, sub: "فعل الأمر" },
                            { label: "Fi'il Nahi (Larangan)", value: calculatedTasrif.nahi, sub: "فعل النهي" },
                            { label: "Isim Zaman (Waktu)", value: calculatedTasrif.isimZaman.mufrod, sub: "اسم الزمان" },
                            { label: "Isim Makan (Tempat)", value: calculatedTasrif.isimMakan.mufrod, sub: "اسم المكان" },
                            { label: "Isim Alat (Prasarana)", value: calculatedTasrif.isimAlat.mufrod, sub: "اسم الآلة" }
                          ].map((item, id) => {
                            const fontClass = lafadzSize === "small" ? "text-lg" : lafadzSize === "medium" ? "text-xl" : "text-2xl";
                            return (
                              <div key={id} className="bg-slate-900/45 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
                                <div>
                                  <span className="block text-[8px] uppercase tracking-wider text-slate-500">{item.sub}</span>
                                  <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                  {item.label === "Sifat Musyabihat" && (
                                    <span className="text-[8px] text-emerald-400 font-medium block mt-0.5">diambil dari database</span>
                                  )}
                                </div>
                                <span className={`font-arabic font-extrabold text-amber-300 tracking-wide text-right select-all ${fontClass}`}>
                                  {item.value || "—"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Tasrif Lughowi */}
                    {activeTab === "lughowi" && (
                      <div className="space-y-2 text-xs">
                        <TasrifLughowiView
                          tasrif={calculatedTasrif}
                          fa={selectedEntry.root.fa}
                          ain={selectedEntry.root.ain}
                          lam={selectedEntry.root.lam}
                          bina={selectedEntry.bina || "Shohih"}
                          babNum={selectedEntry.babNum}
                          isPremium={isPremium}
                          onUnlock={() => {
                            setIsPremium(true);
                            localStorage.setItem("sdr_premium_unlocked", "true");
                          }}
                          onShowWordInfo={(word, shighot) => setSelectedWordInfo({ word, shighot })}
                          lafadzSize={lafadzSize}
                          appTheme="dark"
                        />
                      </div>
                    )}

                    {/* Tab 2.5: Tabel Masdar (Sama'i & Qiyasi) */}
                    {activeTab === "masdar" && (
                      <div className="space-y-3">
                        <ShorofMasdarTableView
                          entries={PRESET_DICTIONARY}
                          activeEntryId={selectedEntry.id}
                          onSelectEntry={(entry) => setSelectedEntry(entry)}
                          lafadzSize={lafadzSize}
                          appTheme="dark"
                        />
                      </div>
                    )}

                    {/* Tab 3: Jama' Taksir */}
                    {activeTab === "jama" && (
                      <div className="space-y-3">
                        {/* Sub tab for plural properties */}
                        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl justify-between overflow-x-auto gap-0.5">
                          {(["fail", "maful", "zamanmakan", "alat", "sifat"] as any[]).map((jt) => (
                            <button
                              key={jt}
                              onClick={() => setActiveJamakTab(jt)}
                              className={`text-[9px] px-2 py-1.5 font-bold rounded-lg transition uppercase ${activeJamakTab === jt ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
                            >
                              {jt === "zamanmakan" ? "Zaman/Makan" : jt}
                            </button>
                          ))}
                        </div>

                        {/* Rendering Jamak info */}
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl space-y-3.5 text-xs">
                          {/* 1. Jamak Taksir Qillah */}
                          <div className="space-y-1">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Jamak Taksir Qillah (Sedikit):</span>
                            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">جَمْعُ قِلَّةٍ</span>
                              {activeJamakTab === "fail" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.fail.qillah || "—"}</span>}
                              {activeJamakTab === "maful" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.maful.qillah || "—"}</span>}
                              {activeJamakTab === "zamanmakan" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.zamanmakan.qillah || "—"}</span>}
                              {activeJamakTab === "alat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.alat.qillah || "—"}</span>}
                              {activeJamakTab === "sifat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.sifat.qillah || "—"}</span>}
                            </div>
                          </div>

                          {/* 2. Jamak Taksir Katsroh */}
                          <div className="space-y-1">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Jamak Taksir Katsroh (Banyak):</span>
                            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">جَمْعُ كَثْرَةٍ</span>
                              {activeJamakTab === "fail" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.fail.katsroh || "—"}</span>}
                              {activeJamakTab === "maful" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.maful.katsroh || "—"}</span>}
                              {activeJamakTab === "zamanmakan" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.zamanmakan.katsroh || "—"}</span>}
                              {activeJamakTab === "alat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.alat.katsroh || "—"}</span>}
                              {activeJamakTab === "sifat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.sifat.katsroh || "—"}</span>}
                            </div>
                          </div>

                          {/* 3. Shighot Muntahal Jumu' */}
                          <div className="space-y-1">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Muntahal (Jamak Tertinggi):</span>
                            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">مُنْتَهَى الجُمُوعِ</span>
                              {activeJamakTab === "fail" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.fail.muntahal || "—"}</span>}
                              {activeJamakTab === "maful" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.maful.muntahal || "—"}</span>}
                              {activeJamakTab === "zamanmakan" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.zamanmakan.muntahal || "—"}</span>}
                              {activeJamakTab === "alat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.alat.muntahal || "—"}</span>}
                              {activeJamakTab === "sifat" && <span className="font-arabic font-extrabold text-emerald-400 text-base select-all">{structuralPlurals.sifat.muntahal || "—"}</span>}
                            </div>
                          </div>

                          {/* 4. Referensi */}
                          <div className="space-y-1">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Sumber Referensi:</span>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-900 text-[10px] text-slate-400/80 font-mono">
                              {activeJamakTab === "fail" && (structuralPlurals.fail.reference || "Unknown")}
                              {activeJamakTab === "maful" && (structuralPlurals.maful.reference || "Unknown")}
                              {activeJamakTab === "zamanmakan" && (structuralPlurals.zamanmakan.reference || "Unknown")}
                              {activeJamakTab === "alat" && (structuralPlurals.alat.reference || "Unknown")}
                              {activeJamakTab === "sifat" && (structuralPlurals.sifat.reference || "Unknown")}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">Ulasan Sharaf:</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2 rounded-xl border border-slate-900 select-text">
                              {activeJamakTab === "fail" && structuralPlurals.fail.explanation}
                              {activeJamakTab === "maful" && structuralPlurals.maful.explanation}
                              {activeJamakTab === "zamanmakan" && structuralPlurals.zamanmakan.explanation}
                              {activeJamakTab === "alat" && structuralPlurals.alat.explanation}
                              {activeJamakTab === "sifat" && structuralPlurals.sifat.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Kaidah I'lal */}
                    {activeTab === "iilal" && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Analisis I'lal & 19 Qaidah</p>
                          <button
                            onClick={triggerAiExplanation}
                            disabled={aiExplainLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 transition select-none cursor-pointer"
                          >
                            <Info className="w-3 h-3" />
                            <span>{aiExplainLoading ? "Memuat..." : "Tampilkan Analisis"}</span>
                          </button>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {aiExplanationText ? (
                            <div className="text-xs text-slate-300 leading-relaxed prose prose-invert select-text">
                              {aiExplanationText.split("\n\n").map((para, pIdx) => (
                                <p key={pIdx} className="mb-2">{para}</p>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-slate-500 space-y-1 select-none">
                              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                              <p className="text-xs font-bold font-medium text-slate-400">Belum ada Analisis Kaidah</p>
                              <p className="text-[10px] text-slate-500">Tekan tombol 'Tampilkan Analisis' di atas untuk memuat penjelasan secara luring.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 5: Saved Favorites */}
                    {activeTab === "favorites" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Kostum Favorit Tersimpan</p>
                          <button
                            onClick={handleSyncFavoritesToCloud}
                            className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md cursor-pointer select-none"
                          >
                            <RefreshCw className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                            <span>Cadang di Cloud</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                          {favorites.length === 0 ? (
                            <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-600 text-xs select-none">
                              <Bookmark className="w-6 h-6 mx-auto mb-1 text-slate-705" />
                              <p>Belum ada kata tersimpan.</p>
                            </div>
                          ) : (
                            favorites.map((fav, fIdx) => (
                              <div key={fav.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                                <div className="text-left">
                                  <span className="text-xs font-extrabold text-slate-200 block">{fav.root.fa}َ{fav.root.ain}َ{fav.root.lam}َ</span>
                                  <span className="text-[10px] text-slate-400 inline-block truncate max-w-[130px]">{fav.translation}</span>
                                </div>
                                <div className="flex space-x-1.5">
                                  <button
                                    onClick={() => setSelectedEntry(fav)}
                                    className="p-1 px-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-emerald-400"
                                  >
                                    Muat
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = favorites.filter(f => f.id !== fav.id);
                                      setFavorites(updated);
                                      localStorage.setItem("sdr_favorites", JSON.stringify(updated));
                                    }}
                                    className="p-1 text-rose-500 border border-transparent rounded-lg hover:border-slate-800"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated Android Hardware/Software Bottom Bar */}
                <div className="border-t border-slate-900 bg-slate-950 px-6 py-2 flex items-center justify-around z-20 sticky bottom-0 select-none">
                  {/* Triangle (Back Button) */}
                  <button 
                    onClick={() => {
                      if (activeTab !== "istilahi") {
                        setActiveTab("istilahi");
                        logTerminal("[Hardware Back] Kembali ke Tab Istilahi utama");
                      } else {
                        logTerminal("[Hardware Back] Menghubungi riwayat terdahulu...");
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-white transition active:scale-90"
                  >
                    <div className="w-0.5 h-0.5 border-t-[6px] border-t-transparent border-r-[10px] border-r-slate-400 border-b-[6px] border-b-transparent transform rotate-0" />
                  </button>

                  {/* Circle (Home Button) */}
                  <button 
                    onClick={() => {
                      setSelectedEntry(PRESET_DICTIONARY[0]);
                      setSearchQuery("");
                      setActiveTab("istilahi");
                      logTerminal("[Hardware Home] Mengembalikan ke setelan pabrik (nasara)");
                    }}
                    className="p-2 text-slate-550 hover:text-white transition active:scale-90"
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                  </button>

                  {/* Square (Overview Button) */}
                  <button 
                    onClick={() => {
                      setShowPremiumModal(true);
                      logTerminal("[Hardware App Selection] Menampilkan bundel lisensi PRO");
                    }}
                    className="p-2 text-slate-550 hover:text-white transition active:scale-95"
                  >
                    <div className="w-2.5 h-2.5 border-2 border-slate-400 rounded-sm" />
                  </button>
                </div>

                {/* Simulated OVER-THE-AIR updates popup alert ! */}
                <AnimatePresence>
                  {showOTADialog && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 text-slate-200"
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 space-y-4 max-w-[280px] text-center"
                      >
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-full inline-block text-emerald-400">
                          <Bell className="w-6 h-6 animate-bounce" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-white">EAS Update Mendeteksi Pembaruan!</h3>
                          <p className="text-[10px] text-slate-400 leading-normal">Pembaruan Over-The-Air ditemukan di cabang rilis. Selaraskan database lafadz luring tanpa perlu instalasi ulang APK.</p>
                        </div>

                        {otaStatus === "ready" ? (
                          <button
                            onClick={() => {
                              setOtaStatus("downloading");
                              setTimeout(() => {
                                setOtaStatus("idle");
                                setShowOTADialog(false);
                                alert("Database berhasil termodernkan!");
                              }, 1500);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold"
                          >
                            Sinkronkan Sekarang
                          </button>
                        ) : (
                          <div className="flex flex-col items-center space-y-1 py-1">
                            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span className="text-[9px] text-slate-400 font-mono">Mengatur keselarasan database...</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => {
                            setShowOTADialog(false);
                            setOtaStatus("idle");
                          }} 
                          className="text-[10px] text-slate-500 hover:text-slate-350 block mx-auto"
                        >
                          Tunda Selaras
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Simulated Web View Profiles Modal upload */}
                <AnimatePresence>
                  {showEditProfileModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 w-full max-w-[280px]"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perbarui Akun</h3>
                          <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-250">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Panggilan</label>
                            <input
                              type="text"
                              defaultValue={username}
                              id="modal-username-input"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Pilih Avatar Profil</label>
                            <div className="grid grid-cols-4 gap-2">
                              {MOCK_PHOTOS.map((av) => (
                                <button
                                  key={av}
                                  onClick={() => handleSaveProfile((document.getElementById("modal-username-input") as any)?.value || username, av)}
                                  className={`p-1 border rounded-lg hover:border-emerald-500 transition-all ${profilePhoto === av ? "border-emerald-500 bg-slate-950" : "border-slate-850 bg-slate-900"}`}
                                >
                                  {renderPhoneProfileImage(av, "w-8 h-8 mx-auto")}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const inputElem = document.getElementById("modal-username-input") as HTMLInputElement;
                            if (inputElem) {
                              handleSaveProfile(inputElem.value, profilePhoto);
                            }
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold transition-all text-center"
                        >
                          Simpan Profil
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Simulated Upgrade to Premium Modal & Midtrans integration */}
                <AnimatePresence>
                  {showPremiumModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-50 text-slate-200"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="bg-slate-900 border border-amber-500/20 rounded-[30px] p-5 space-y-4 w-full max-w-[290px] text-left max-h-[85%] overflow-y-auto"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-amber-400 font-black text-[10px] tracking-wider uppercase">Lisensi Sharaf Premium</span>
                          <button onClick={() => { setShowPremiumModal(false); setBillingPlan(""); }} className="text-slate-400 hover:text-slate-200">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {billingPlan ? (
                          // Virtual Midtrans Overlay Payment Simulation
                          <div className="space-y-4 py-2">
                            <div className="border border-dashed border-emerald-500/30 bg-slate-950/60 p-3.5 rounded-2xl text-center space-y-2">
                              <CreditCard className="w-6 h-6 text-emerald-400 mx-auto animate-pulse" />
                              <h4 className="text-xs font-extrabold text-white">Integrasi SNAP Midtrans</h4>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Paket: <strong className="text-slate-200">{billingPlan}</strong><br />
                                Biaya lisensi aman diproduksi lewat jalur klaster enkripsi.
                              </p>
                            </div>

                            {isPaymentLoading ? (
                              <div className="space-y-2 text-center py-4">
                                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
                                <p className="text-[10px] text-slate-400 font-mono animate-pulse">{paymentMessage}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-400 text-center font-bold">Simulasikan Respons Jaringan Midtrans:</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleCompletePaymentSimulated(true)}
                                    className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-xl py-2 text-[10px] font-black cursor-pointer text-center"
                                  >
                                    ✔ Bayar Sukses
                                  </button>
                                  <button
                                    onClick={() => handleCompletePaymentSimulated(false)}
                                    className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-450 rounded-xl py-2 text-[10px] font-black cursor-pointer text-center"
                                  >
                                    ❌ Bayar Batal
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Subscription Options list
                          <div className="space-y-3">
                            <p className="text-[10px] text-slate-400 leading-relaxed">Aktifkan paket pro untuk membuka rincian kaidah I'lal lengkap, penjelasan AI, dan database luring penuh.</p>
                            
                            <div className="space-y-2">
                              {[
                                { name: "Paket Pelajar (Student)", price: 49000, color: "border-slate-800" },
                                { name: "Paket Ulama (Scholar)", price: 99000, color: "border-emerald-500/20" },
                                { name: "Lisensi Selamanya (Lifetime)", price: 149000, color: "border-amber-500/20" }
                              ].map((plan, pii) => (
                                <button
                                  key={pii}
                                  onClick={() => handleSimulateMidtransPay(plan.price, plan.name, `plan_${pii}`)}
                                  className={`w-full bg-slate-950 border ${plan.color} rounded-2xl p-3 text-left hover:border-emerald-500 transition-all active:scale-95 cursor-pointer block`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-white">{plan.name}</span>
                                    <span className="text-[10px] text-amber-400 font-mono font-bold">Rp {plan.price.toLocaleString("id-ID")}</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Manual Activation Box */}
                            <div className="border-t border-slate-800/80 pt-3 space-y-2">
                              <label className="text-[9px] font-bold uppercase text-slate-400">Punya Lisensi Manual?</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Masukkan Kode (BISMILLAH / EXPO)"
                                  value={activationCode}
                                  onChange={e => setActivationCode(e.target.value)}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  onClick={() => {
                                    const codeClean = activationCode.trim().toUpperCase();
                                    if (codeClean === "BISMILLAH" || codeClean === "PREMIUM" || codeClean === "EXPO") {
                                      setIsPremium(true);
                                      localStorage.setItem("sdr_premium_unlocked", "true");
                                      setShowPremiumModal(false);
                                      alert("Lisensi Berhasil Terdaftar!");
                                      logTerminal("[Simulasi Manual] Berhasil mendaftarkan lisensi premium.");
                                    } else {
                                      alert("Kode salah, gunakan kata kunci: BISMILLAH / EXPO");
                                    }
                                  }}
                                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl px-3 py-1 text-[10px] font-bold cursor-pointer transition select-none"
                                >
                                  Verifikasi
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              ★ Virtual Device Mockup (365x750px) — Gunakan visual navigasi untuk mengemudikan
            </p>
          </div>
        )}

        {/* PANEL KANAN: Visual VS Code + Expo Developer Workspace */}
        {(viewMode === "both" || viewMode === "developer") && (
          <div className={`${viewMode === "developer" ? "lg:col-span-12" : "lg:col-span-7 xl:col-span-8"} bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl`}>
            
            {/* Header / Tab bar representing Code Editor Workspace */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5 px-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono tracking-wider">WORKSPACE: ~/shorof-digital-pro-native</span>
              </div>

              {/* Virtual Hot-Reload indicator */}
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400">SISTEM AKTIF</span>
              </div>
            </div>

            {/* Split Code and View components */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden items-stretch min-h-[400px]">
              
              {/* Left sidebar representing Files Directory */}
              <div className="md:col-span-3 bg-slate-950 border-r border-slate-850 p-2.5 space-y-3.5 flex flex-col z-10 relative">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5">Berkas Proyek</h3>
                  <div className="space-y-0.5">
                    {Object.keys(filesCache).map((fileName) => {
                      const isSelected = fileName === selectedFile;
                      return (
                        <button
                          key={fileName}
                          onClick={() => setSelectedFile(fileName)}
                          className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs leading-none font-mono tracking-wide text-left transition select-none cursor-pointer ${
                            isSelected
                              ? "bg-slate-850 text-white font-bold border border-slate-800"
                              : "text-slate-400 hover:text-slate-250 hover:bg-slate-900"
                          }`}
                        >
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-indigo-400"}`} />
                          <span className="truncate">{fileName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional simulated folders representation */}
                <div className="flex-1 space-y-1 select-none">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1.5">Direktori Pendukung</h3>
                  
                  <div className="flex items-center space-x-2 px-2.5 py-1 text-xs text-slate-500 font-mono">
                    <Folder className="w-3.5 h-3.5 text-slate-600" />
                    <span>app/src/main/</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-1 text-xs text-slate-500 font-mono">
                    <Folder className="w-3.5 h-3.5 text-slate-600" />
                    <span>src/utils/engine/</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-1 text-xs text-slate-500 font-mono">
                    <Folder className="w-3.5 h-3.5 text-slate-600" />
                    <span>assets/splash/</span>
                  </div>
                </div>
              </div>

              {/* Center space Editor panel */}
              <div className="md:col-span-9 bg-slate-900 flex flex-col relative">
                
                {/* Save and Copy Tool controls */}
                <div className="bg-slate-850 px-4 py-2 flex items-center justify-between border-b border-slate-800 z-10 relative">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono font-medium">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedFile}</span>
                  </div>

                  <div className="flex space-x-2 text-[10px] select-none">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(editorCode);
                        alert("Berhasil menyalin seluruh kode berkas!");
                      }}
                      className="bg-slate-900 border border-slate-750 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg font-bold text-slate-300 transition flex items-center space-x-1 text-center cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-slate-450" />
                      <span>Salin</span>
                    </button>
                    <button
                      onClick={handleEditorSave}
                      className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg font-bold text-white transition flex items-center space-x-1 text-center cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-white" />
                      <span>Simpan Berkas</span>
                    </button>
                  </div>
                </div>

                {/* Editor textarea simulation */}
                <div className="flex-1 p-2 bg-slate-950 border border-slate-900 flex overflow-hidden">
                  {/* Fake Line Numbers */}
                  <div className="w-10 text-right pr-2 text-[10px] text-slate-600 font-mono leading-relaxed select-none border-r border-slate-850/60 mr-2">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span key={i} className="block">{i + 1}</span>
                    ))}
                  </div>

                  {/* Complete Editable Program Text area */}
                  <textarea
                    value={editorCode}
                    onChange={(e) => setEditorCode(e.target.value)}
                    className="flex-1 w-full h-full bg-transparent font-mono text-[11px] leading-relaxed text-slate-300 resize-none font-medium focus:outline-none focus:ring-0 overflow-y-auto"
                    spellCheck="false"
                  />
                </div>

                {/* Editor Toast notification when file is modified */}
                <AnimatePresence>
                  {showEditorSaveToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-4 right-4 bg-emerald-700 border border-emerald-500/30 text-white rounded-xl px-3.5 py-2 text-xs font-bold font-mono tracking-wide z-20 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-250 animate-bounce" />
                      <span>Selesai diperbarui! Perubahan telah dimasukkan ke bundel seluler.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* Simulated Live Developer Command and Cloud Compiler Panel */}
            <div className="bg-slate-950 border-t border-slate-850 flex flex-col z-10 relative">
              
              {/* Console Tabs */}
              <div className="bg-slate-950 px-4 flex border-b border-slate-850/80 items-stretch overflow-x-auto gap-1">
                <button
                  onClick={() => setActiveConsoleTab("terminal")}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-bold leading-none font-mono select-none ${activeConsoleTab === "terminal" ? "border-b-2 border-emerald-500 text-white font-black bg-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal Metro</span>
                  {terminalState === "running" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </button>
                <button
                  onClick={() => setActiveConsoleTab("build")}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-bold leading-none font-mono select-none ${activeConsoleTab === "build" ? "border-b-2 border-emerald-500 text-white font-black bg-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>EAS Cloud Compiler</span>
                  {buildProgress >= 0 && buildProgress < 100 && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse animate-spin" />}
                </button>
                <button
                  onClick={() => setActiveConsoleTab("ota")}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-bold leading-none font-mono select-none ${activeConsoleTab === "ota" ? "border-b-2 border-emerald-500 text-white font-black bg-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>EAS OTA Updates</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab("integrations")}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-bold leading-none font-mono select-none ${activeConsoleTab === "integrations" ? "border-b-2 border-emerald-500 text-white font-black bg-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Integrasi SDK Nativ</span>
                </button>
              </div>

              {/* Console Body depending on activeConsoleTab */}
              <div className="p-4 bg-slate-950 font-mono text-xs">
                
                {/* Tab 1: Terminal Metro */}
                {activeConsoleTab === "terminal" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl">
                      <div className="flex space-x-2 text-[10px]">
                        <button
                          onClick={handleRunMetroStart}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold px-3 py-1 rounded-md text-white select-none shadow hover:shadow-emerald-500/20 active:scale-95 cursor-pointer transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>npx expo start</span>
                        </button>
                        <button
                          onClick={handleStopMetro}
                          className="bg-slate-800 hover:bg-slate-750 font-bold px-3 py-1 rounded-md text-slate-300 select-none border border-slate-700 text-center active:scale-95 cursor-pointer transition"
                        >
                          Hentikan
                        </button>
                      </div>

                      <button onClick={clearTerminal} className="text-[9px] text-slate-500 hover:text-slate-300 underline font-bold">
                        Hapus Log
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-900/40 rounded-2xl p-3 h-40 overflow-y-auto space-y-1 scrollbar-thin text-slate-400 text-[11px] leading-relaxed">
                      {terminalLogs.length === 0 ? (
                        <p className="text-slate-600 italic">Console luring. Mulai bundler dengan menekan tombol 'npx expo start' di atas.</p>
                      ) : (
                        terminalLogs.map((log, idx) => (
                          <p key={idx}>{log}</p>
                        ))
                      )}
                      
                      {/* Active Connection state drawing QR code */}
                      {terminalState === "running" && (
                        <div className="mt-4 p-3.5 bg-slate-900 rounded-2xl max-w-sm border border-slate-800 flex items-center space-x-4">
                          {/* Styled Simulated QR Code for Expo Go previewing */}
                          <div className="h-16 w-16 bg-white p-1 rounded-md flex-shrink-0 grid grid-cols-4 gap-0.5 select-none shadow">
                            <div className="bg-black" /><div className="bg-black" /><div className="bg-white" /><div className="bg-black" />
                            <div className="bg-black" /><div className="bg-white" /><div className="bg-black" /><div className="bg-white" />
                            <div className="bg-white" /><div className="bg-black" /><div className="bg-black" /><div className="bg-black" />
                            <div className="bg-black" /><div className="bg-white" /><div className="bg-white" /><div className="bg-black" />
                          </div>
                          <div className="space-y-1 font-sans text-xs">
                            <p className="font-extrabold text-white">QR Code Metro Bundler</p>
                            <p className="text-[10px] text-slate-400">Pindai kode QR di atas via aplikasi <strong className="text-emerald-400">Expo Go</strong> di HP Android/iOS nyata Anda untuk mementaskan luring dalam rilis uji coba!</p>
                          </div>
                        </div>
                      )}
                      <div ref={terminalBottomRef} />
                    </div>
                  </div>
                )}

                {/* Tab 2: EAS Cloud Compiler */}
                {activeConsoleTab === "build" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-2 gap-2">
                      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg">
                        <button
                          onClick={() => handleStartEasBuild("android")}
                          className={`text-[10px] px-3 py-1 font-bold rounded-md transition ${buildPlatform === "android" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          Bentuk Android (.apk)
                        </button>
                        <button
                          onClick={() => handleStartEasBuild("ios")}
                          className={`text-[10px] px-3 py-1 font-bold rounded-md transition ${buildPlatform === "ios" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          Bentuk iOS (.ipa)
                        </button>
                      </div>

                      {buildProgress >= 0 && (
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] text-slate-400">Pemuatan Kompilasi:</span>
                          <span className="text-xs text-amber-400 font-bold">{buildProgress}%</span>
                          <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-emerald-500" style={{ width: `${buildProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950 border border-slate-900/40 rounded-2xl p-3 h-40 overflow-y-auto space-y-1 text-slate-450 text-[10px] leading-relaxed scrollbar-thin">
                      {buildLogs.length === 0 ? (
                        <p className="text-slate-650 italic">Papan Cloud Build Kosong. Silakan pilih format sistem android/ios di atas untuk memicu inisiasi kompilasi cloud EAS.</p>
                      ) : (
                        buildLogs.map((bLog, bIdx) => {
                          const isSuccessMsg = bLog.includes("SELESAI") || bLog.includes("SUCCESSFUL");
                          return (
                            <p key={bIdx} className={isSuccessMsg ? "text-emerald-400 font-bold" : ""}>
                              {bLog}
                            </p>
                          );
                        })
                      )}
                      
                      {/* Generating Download Apk Output Frame */}
                      {compiledApkUrl && (
                        <div className="mt-4 p-4 border border-teal-500/20 bg-emerald-500/5 rounded-2xl flex flex-col md:flex-row items-center md:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 bg-white p-1 rounded-lg flex items-center justify-center font-bold">
                              {/* Virtual download indicator qr code */}
                              <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-teal-800 rounded-sm" />
                            </div>
                            <div className="text-left font-sans">
                              <h4 className="text-xs font-black text-white">Shorof_Digital_Pro_2.0.{buildPlatform === "android" ? "apk" : "ipa"}</h4>
                              <p className="text-[10px] text-slate-400">Kompilasi Cloud EAS rampung tuntas. Berkas digital luring siap dipasang pada HP fisik.</p>
                            </div>
                          </div>

                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Simulasi Pengunduhan: File Shorof_Digital_Pro_2.0.${buildPlatform === "android" ? "apk" : "ipa"} berhasil dialokasikan.`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-4 text-xs font-black tracking-wide flex items-center space-x-1 hover:shadow-lg transition cursor-pointer select-none"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Berkas</span>
                          </a>
                        </div>
                      )}
                      <div ref={buildBottomRef} />
                    </div>
                  </div>
                )}

                {/* Tab 3: EAS OTA Updates */}
                {activeConsoleTab === "ota" && (
                  <div className="space-y-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl flex flex-wrap items-center justify-between border border-slate-800 gap-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">Layanan Pembaruan EAS Update</h4>
                        <p className="text-[10px] text-slate-400">Merilis pembaruan data rumusan and kosa kata terbaru Over-The-Air secara instan tanpa re-install APK.</p>
                      </div>

                      <button
                        onClick={handleReleaseOtaUpdate}
                        disabled={otaPublishProgress >= 0 && otaPublishProgress < 100}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black rounded-xl px-4 py-2 text-xs flex items-center space-x-1 cursor-pointer transition select-none"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{otaPublishProgress >= 0 && otaPublishProgress < 100 ? "Merilis..." : "Rilis Update Instan"}</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-900/40 rounded-2xl p-3 h-40 overflow-y-auto space-y-1 text-slate-450 text-[10px] leading-relaxed scrollbar-thin">
                      {otaPublishLogs.length === 0 ? (
                        <p className="text-slate-650 italic">Papan Log EAS Updates kosong. Klik 'Rilis Update Instan' di atas untuk mempublikasikan revisi.</p>
                      ) : (
                        otaPublishLogs.map((oLog, oIdx) => (
                          <p key={oIdx} className={oLog.includes("Sukses") || oLog.includes("🎉") ? "text-amber-400 font-bold" : ""}>
                            {oLog}
                          </p>
                        ))
                      )}

                      {otaPublishProgress === 100 && (
                        <div className="mt-3.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                          <p className="font-extrabold text-white text-xs flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" /> Hubungan Pengiriman Sukses!
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Bundel nirkabel baru sekarang telah menyebar di CDN Cloud Expo. Periksa virtual smartphone di panel kiri, popup penyeragaman Over-The-Air akan muncul otomatis untuk mendemonstrasikan hasil sinkronisasi riil!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: SDK Integrations info */}
                {activeConsoleTab === "integrations" && (
                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <Bell className="w-4 h-4" />
                        <h4 className="text-xs font-bold font-mono uppercase">Push Notifications</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Kunci OneSignal disinkronisasikan aman melalui file `.env.example`:<br />
                        `ONESIGNAL_APP_ID="e07da120-ca3a-4583-bc59-bc59"`
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-amber-400">
                        <CreditCard className="w-4 h-4" />
                        <h4 className="text-xs font-bold font-mono uppercase">Midtrans Gateway</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Mengintegrasikan Snap JS berharakat luring untuk pembukuan digital premium.
                        Kunci produksi: `Mid-client-eBgiibprk...` di index.html.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                        <h4 className="text-xs font-bold font-mono uppercase">Gemini AI Studio</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Model `gemini-3.5-flash` mengekstrak qaidah I'lal and kamus klasik dengan retry transien and exponential backoff.
                      </p>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Main Status bar Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-6 text-center text-slate-500 text-[11px] font-mono select-none mt-auto">
        <p>© 2026 Universitas Sharaf Digital. Direkonstruksi standard Expo.dev & EAS Updates untuk rilis APK Nativ Multiplatform.</p>
      </footer>
    </div>
  );
}
