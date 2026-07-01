/**
 * Custom Hook React Native untuk Query & Carian Luring Terintegrasi
 * Letakkan kode ini di folder: /src/expo-sqlite/hooks/useShorofDb.ts
 */
import { useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';

export function useShorofDb() {
  const [db, setDb] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      try {
        // Membuka database luring bawaan aplikasi mobile
        const database = await SQLite.openDatabaseAsync('shorof_kamus_expo.db');
        setDb(database);
        setIsReady(true);
      } catch (err) {
        console.error("Gagal inisialisasi Expo SQLite:", err);
      }
    }
    init();
  }, []);

  const searchRoot = useCallback(async (text: string) => {
    if (!db || !isReady) return;
    try {
      const cleanText = text.trim();
      const query = "SELECT * FROM dictionary WHERE fa LIKE ? OR ain LIKE ? OR lam LIKE ? OR translation LIKE ?";
      const param = `%${cleanText}%`;
      
      const rows = await db.getAllAsync(query, [param, param, param, param]);
      setResults(rows);
    } catch (err) {
      console.error("Query Error:", err);
    }
  }, [db, isReady]);

  return {
    isDbReady: isReady,
    searchResults: results,
    searchRoot
  };
}
