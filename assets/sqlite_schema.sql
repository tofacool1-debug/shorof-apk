-- =========================================================
-- SKEMA STRUKTUR DATABASE UNTUK EXPO SQLITE / SQLITE MOBILE
-- =========================================================

-- Tabel Utama Kamus Shorof (Penyimpanan kosakata luring)
CREATE TABLE IF NOT EXISTS dictionary (
  id TEXT PRIMARY KEY NOT NULL,
  fa TEXT NOT NULL,
  ain TEXT NOT NULL,
  lam TEXT NOT NULL,
  translation TEXT,
  bab_num INTEGER,
  explanation TEXT,
  sifat_musyabihat TEXT,
  bina TEXT NOT NULL,
  asal TEXT
);

-- Tabel Riwayat Favorit (Mendukung Catatan Belajar & Penanda Buku)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY NOT NULL,
  fa TEXT NOT NULL,
  ain TEXT NOT NULL,
  lam TEXT NOT NULL,
  translation TEXT,
  bab_num INTEGER,
  notes TEXT,
  custom INTEGER DEFAULT 0,
  ai_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indeks Pencarian Super Cepat untuk Performa Luring Mobile
CREATE INDEX IF NOT EXISTS idx_dict_root ON dictionary(fa, ain, lam);
CREATE INDEX IF NOT EXISTS idx_dict_bina ON dictionary(bina);
CREATE INDEX IF NOT EXISTS idx_dict_bab ON dictionary(bab_num);
