import 'fake-indexeddb/auto';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { openDB, IDBPDatabase } from 'idb';
import { SafeAreaView } from 'react-native-safe-area-context';

type Bab = {
  id: number;
  judul: string;
  jenis: 'istlahi' | 'lughowi';
  contoh: string;
};

const DATA_AWAL: Bab[] = [
  // 1. ISTLAHI
  { id: 1, judul: 'Madi', jenis: 'istlahi', contoh: 'نَصَرَ' },
  { id: 2, judul: 'Mudhari', jenis: 'istlahi', contoh: 'يَنْصُرُ' },
  { id: 3, judul: 'Amar', jenis: 'istlahi', contoh: 'اُنْصُرْ' },
  
  // 2. LUGHOWI
  { id: 4, judul: 'Madi Ma\'lum', jenis: 'lughowi', contoh: 'كَتَبَ' },
  { id: 5, judul: 'Madi Majhul', jenis: 'lughowi', contoh: 'كُتِبَ' },
  { id: 6, judul: 'Isim Fa\'il', jenis: 'lughowi', contoh: 'كَاتِبٌ' },
];

let dbPromise: Promise<IDBPDatabase>;

const initDB = async () => {
  dbPromise = openDB('ShorofDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasrif')) {
        const store = db.createObjectStore('tasrif', { keyPath: 'id' });
        DATA_AWAL.forEach(item => store.add(item));
      }
    },
  });
  return dbPromise;
};

export default function TasrifScreen() {
  const [bab, setBab] = useState<Bab[]>([]);
  const [filter, setFilter] = useState<'all' | 'istlahi' | 'lughowi'>('all');

  useEffect(() => {
    initDB().then(async (db) => {
      const allData = await db.getAll('tasrif');
      if (allData.length === 0) {
        const tx = db.transaction('tasrif', 'readwrite');
        await Promise.all(DATA_AWAL.map(item => tx.store.add(item)));
        await tx.done;
      }
      setBab(allData);
    });
  }, []);

  const dataTampil = bab.filter(b => filter === 'all' ? true : b.jenis === filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tasrif Istlahi & Lughowi</Text>
      
      <View style={styles.tab}>
        <TouchableOpacity onPress={() => setFilter('all')} style={[styles.tabBtn, filter === 'all' && styles.tabActive]}>
          <Text>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('istlahi')} style={[styles.tabBtn, filter === 'istlahi' && styles.tabActive]}>
          <Text>Istlahi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('lughowi')} style={[styles.tabBtn, filter === 'lughowi' && styles.tabActive]}>
          <Text>Lughowi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {dataTampil.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.judul}>{item.judul}</Text>
            <Text style={styles.jenis}>[{item.jenis}]</Text>
            <Text style={styles.contoh}>{item.contoh}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 16 },
  tab: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 10 },
  tabBtn: { padding: 10, borderRadius: 8, backgroundColor: '#E0E0E0' },
  tabActive: { backgroundColor: '#4CAF50' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, elevation: 2, alignItems: 'center' },
  judul: { fontSize: 18, fontWeight: '600' },
  jenis: { fontSize: 12, color: 'gray', marginVertical: 4 },
  contoh: { fontSize: 28, fontWeight: 'bold', fontFamily: 'Amiri' }, // pakai font arab
});
