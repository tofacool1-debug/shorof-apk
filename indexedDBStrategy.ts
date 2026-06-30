/**
 * PWA & Hybrid Web App Storage Strategy using IndexedDB
 * File: src/utils/indexedDb.ts
 * Memberikan perlindungan penuh terhadap kehilangan data saat cache browser dibersihkan.
 */
import { openDB } from "idb"; // library idb (npm i idb)

export async function getShorofDatabase() {
  return openDB("ShorofKamusDB", 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("dictionary_entries")) {
        db.createObjectStore("dictionary_entries", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("favorites_entries")) {
        db.createObjectStore("favorites_entries", { keyPath: "id" });
      }
    },
  });
}

