import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, SafeAreaView, Image, Modal, TextInput, FlatList
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Settings, User, Info, Bookmark, Trash2, X, RefreshCw, CreditCard, Bell } from "lucide-react-native";

import { DictionaryEntry } from "./types";
import { PRESET_DICTIONARY } from "./utils/dictionaryData";

type TabType = "istilahi" | "lughowi" | "masdar" | "jama" | "iilal" | "favorites";

export default function App() {
  // ===== STATE =====
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry>(PRESET_DICTIONARY[0]);
  const [activeTab, setActiveTab] = useState<TabType>("istilahi");
  const [activeJamakTab, setActiveJamakTab] = useState("fail");
  const [isPremium, setIsPremium] = useState(false);
  const [username, setUsername] = useState("Tamu Mulia");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [favorites, setFavorites] = useState<DictionaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showOTADialog, setShowOTADialog] = useState(false);
  const [otaStatus, setOtaStatus] = useState("idle");

  // Payment states
  const [billingPlan, setBillingPlan] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [activationCode, setActivationCode] = useState("");

  // ===== LOAD DATA =====
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const premium = await AsyncStorage.getItem("sdr_premium_unlocked");
    setIsPremium(premium === "true");

    const savedUser = await AsyncStorage.getItem("sdr_username");
    setUsername(savedUser || `Tamu Mulia ${Math.floor(1000 + Math.random() * 9000)}`);

    const savedPhoto = await AsyncStorage.getItem("sdr_profile_photo");
    setProfilePhoto(savedPhoto || "");

    const savedFav = await AsyncStorage.getItem("sdr_favorites");
    setFavorites(savedFav? JSON.parse(savedFav) : []);
  };

  // ===== FUNCTIONS =====
  const savePremium = async (val: boolean) => {
    await AsyncStorage.setItem("sdr_premium_unlocked", val.toString());
    setIsPremium(val);
  };

  const handleToggleFavorite = async (entry: DictionaryEntry) => {
    const exists = favorites.some(fav => fav.id === entry.id);
    const updated = exists
     ? favorites.filter(fav => fav.id!== entry.id)
      : [...favorites, entry];
    setFavorites(updated);
    await AsyncStorage.setItem("sdr_favorites", JSON.stringify(updated));
  };

  const handleSaveProfile = async (newName: string, newPhoto: string) => {
    setUsername(newName);
    setProfilePhoto(newPhoto);
    await AsyncStorage.setItem("sdr_username", newName);
    await AsyncStorage.setItem("sdr_profile_photo", newPhoto);
    setShowEditProfileModal(false);
  };

  const verifyCode = () => {
    const code = activationCode.trim().toUpperCase();
    if (["BISMILLAH", "PREMIUM", "EXPO"].includes(code)) {
      savePremium(true);
      setShowPremiumModal(false);
      setActivationCode("");
      alert("Lisensi Berhasil Terdaftar!");
    } else {
      alert("Kode salah, gunakan: BISMILLAH / EXPO");
    }
  };

  const renderPhoneProfileImage = (photoVal: string, size: number = 40) => {
    if (photoVal?.startsWith("data:image") || photoVal?.startsWith("http")) {
      return (
        <Image
          source={{ uri: photoVal }}
          style={[styles.avatarImg, { width: size, height: size, borderRadius: size/2 }]}
        />
      );
    }
    return (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size/2 }]}>
        <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = () => {
    switch(activeTab) {
      case "istilahi":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tasrif Istilahi</Text>
            <Text style={styles.lafadz}>{selectedEntry.lafadz}</Text>
            <Text style={styles.root}>Akar: {selectedEntry.root?.fa}-{selectedEntry.root?.ain}-{selectedEntry.root?.lam}</Text>
          </View>
        );

      case "lughowi":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tasrif Lughowi</Text>
            <Text style={styles.cardDesc}>Belum di-convert, lanjut batch 3</Text>
          </View>
        );

      case "favorites":
        return favorites.length === 0? (
          <View style={styles.emptyFav}>
            <Bookmark size={24} color="#475569" />
            <Text style={styles.emptyText}>Belum ada kata tersimpan</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.favCard}>
                <View>
                  <Text style={styles.arabicText}>{item.root.fa}َ{item.root.ain}َ{item.root.lam}َ</Text>
                  <Text style={styles.translation}>{item.translation}</Text>
                </View>
                <View style={styles.favActions}>
                  <TouchableOpacity onPress={() => setSelectedEntry(item)} style={styles.loadBtn}>
                    <Text style={styles.loadText}>Muat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
                    <Trash2 size={16} color="#f43f5e" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        );

      default:
        return (
          <View style={styles.card}>
            <Text style={styles.cardDesc}>Tab {activeTab} - nunggu batch selanjutnya</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <BookOpen size={24} color="#fbbf24" />
        <Text style={styles.headerTitle}>Shorof Pro</Text>
        <TouchableOpacity onPress={() => setShowPremiumModal(true)}>
          <Settings size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <TouchableOpacity style={styles.userBox} onPress={() => setShowEditProfileModal(true)}>
        {renderPhoneProfileImage(profilePhoto, 36)}
        <Text style={styles.username}>{username}</Text>
        {isPremium && <Text style={styles.premiumBadge}>PREMIUM</Text>}
      </TouchableOpacity>

      {/* Tab Menu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {(["istilahi", "lughowi", "masdar", "jama", "iilal", "favorites"] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* Modal Premium */}
      <Modal visible={showPremiumModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.premiumTitle}>Lisensi Premium</Text>
                <TouchableOpacity onPress={() => setShowPremiumModal(false)}>
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>Buka kaidah I'lal lengkap + AI</Text>

              {[
                { name: "Paket Pelajar", price: 49000 },
                { name: "Paket Ulama", price: 99000 },
                { name: "Lifetime", price: 149000 }
              ].map((plan, i) => (
                <TouchableOpacity key={i} style={styles.planBtn} onPress={() => verifyCode()}>
                  <Text style={styles.planText}>{plan.name} - Rp{plan.price.toLocaleString("id-ID")}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.manualBox}>
                <Text style={styles.manualLabel}>Punya Kode Manual?</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    placeholder="BISMILLAH / EXPO"
                    value={activationCode}
                    onChangeText={setActivationCode}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity onPress={verifyCode} style={styles.verifyBtn}>
                    <Text style={styles.verifyText}>Verifikasi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Edit Profile */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perbarui Akun</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <TextInput
              defaultValue={username}
              style={styles.input}
              placeholder="Nama Panggilan"
              onChangeText={setUsername}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={() => handleSaveProfile(username, profilePhoto)}>
              <Text style={styles.modalBtnText}>Simpan Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ===== STYLESHEET SATU KALI =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fbbf24' },

  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8
  },
  username: { color: '#cbd5e1', fontSize: 14, flex: 1 },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    color: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold'
  },

  // Avatar
  avatar: {
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981'
  },
  avatarImg: {
    borderWidth: 1,
    borderColor: '#10b981'
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },

  // Tab
  tabBar: {
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    maxHeight: 50
  },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderColor: '#059669' },
  tabText: { color: '#94a3b8', fontSize: 12 },
  tabTextActive: { color: '#059669', fontWeight: 'bold' },

  // Content
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 20 },
  lafadz: {
    fontSize: 32,
    color: '#fbbf24',
    fontFamily: 'Amiri',
    textAlign: 'center',
    marginVertical: 8
  },
  root: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  arabicText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
    fontFamily: 'Amiri'
  },
  translation: { fontSize: 12, color: '#cbd5e1' },

  // Favorites
  favCard: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  favActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  loadBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8
  },
  loadText: { fontSize: 10, color: '#10b981' },
  emptyFav: {
    paddingVertical: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#334155',
    borderRadius: 16
  },
  emptyText: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginTop: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center'
  },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  modalBox: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#334155',
    paddingBottom: 8
  },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
  premiumTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fbbf24',
    textTransform: 'uppercase'
  },
  modalDesc: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
  modalBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalBtnText: { fontSize: 12, fontWeight: 'bold', color: 'white' },

  // Plan
  planBtn: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  planText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  // Manual Activation
  manualBox: {
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingTop: 12,
    gap: 8
  },
  manualLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  manualRow: { flexDirection: 'row', gap: 6 },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: 'white'
  },
  verifyBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  verifyText: { fontSize: 10, fontWeight: 'bold', color: '#cbd5e1' },
});