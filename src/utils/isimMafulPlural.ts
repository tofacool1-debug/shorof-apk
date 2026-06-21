/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DictionaryEntry, PluralIsimMaful } from "../types";

/**
 * Highly polished engine for Isim Maful Plurals with dynamic, accurate Arabic-compliant morphing.
 * Implements I'lal rules correctly for Naqis/Lafif, ensuring that the weak lam (waw/ya) at the end 
 * of the katsroh/muntahal plural properly mutates into a ya (يَ) instead of producing incorrect 
 * unmutated forms like مَدَاعِيوَ.
 */
export function analyzeIsimMafulPlural(entry: DictionaryEntry): PluralIsimMaful {
  const { fa, ain, lam } = entry.root;
  const bina = entry.bina || "Shohih";

  const SUKUN = "ْ";
  const FATHA = "َ";
  const DAMMA = "ُ";
  const KASRA = "ِ";

  let singular = "";
  let qillah = "";
  let katsroh = "";
  let muntahal = "";
  let explanation = "";

  if (bina === "Mudho'af") {
    singular = `مَ${fa}${SUKUN}${ain}ُ${lam}ٌ`; // مَمْدُودٌ
    qillah = `مَ${fa}${SUKUN}${ain}ُ${lam}ُونَ`; // مَمْدُودُونَ
    katsroh = `مَ${fa}َا${ain}ِي${lam}ُ`; // مَمَادِيدُ (wazan مَفَاعِيلُ)
    muntahal = `مَ${fa}َا${ain}ِي${lam}ُ`; // مَمَادِيدُ
    explanation = `Isim Ma'ful Mudho'af '${singular}' memiliki Jamak Salim Mudzakkar '${qillah}' (Qillah). Jamak Taksir Katsroh dan Shighot Muntahal Jumu'-nya mengikuti wazan مَفَاعِيلُ menjadi '${muntahal}' dengan penguraian huruf ganda.`;
  } else if (bina === "Ajwaf") {
    if (ain === "و") {
      singular = `مَ${fa}ُ${lam}ٌ`; // مَقُولٌ (asalnya مَقْوُولٌ)
      qillah = `مَ${fa}ُ${lam}ُونَ`; // مَقُولُونَ
      katsroh = `مَ${fa}َاوِي${lam}ُ`; // مَقَاوِيلُ (wazan مَفَاعِيلُ)
      muntahal = `مَ${fa}َاوِي${lam}ُ`; // مَقَاوِيلُ
      explanation = `Isim Ma'ful Ajwaf Wawi '${singular}' (asalnya مَقْوُولٌ) memiliki Jamak Salim '${qillah}'. Jamak Katsroh & Muntahal Jumu'-nya dirujuk ke wazan asli مَفَاعِيلُ menjadi '${muntahal}' sesuai herarki I'lal.`;
    } else {
      singular = `مَ${fa}ِي${lam}ٌ`; // مَبِيعٌ (asalnya مَبْيُوعٌ)
      qillah = `مَ${fa}ِي${lam}ُونَ`; // مَبِيعُونَ
      katsroh = `مَ${fa}َايِي${lam}ُ`; // مَبَايِيعُ (wazan مَفَاعِيلُ)
      muntahal = `مَ${fa}َايِي${lam}ُ`; // مَبَايِيعُ
      explanation = `Isim Ma'ful Ajwaf Ya'i '${singular}' (asalnya مَبْيُوعٌ) memiliki Jamak Salim '${qillah}'. Jamak Katsroh & Muntahal Jumu'-nya mengikuti wazan مَفَاعِيلُ menjadi '${muntahal}' untuk mengembalikan huruf Ya' asal.`;
    }
  } else if (bina === "Naqis" || bina === "Lafif Maqrun" || bina === "Lafif Mafruq") {
    // Both Naqis Wawi and Ya'i resolve to مَفَاعِيلُ with ya-mutation (مَدَاعِيَ / مَرَامِيَ)
    if (lam === "و") {
      singular = `مَ${fa}${SUKUN}${ain}ُ${lam}ٌّ`; // مَدْعُوٌّ
      qillah = `مَ${fa}${SUKUN}${ain}ُ${lam}ُّونَ`; // مَدْعُوُّونَ
      katsroh = `مَ${fa}َا${ain}ِيَ`; // مَدَاعِيَ (wazan مَفَاعِيلُ but mutated - asalnya مَدَاعِيوَ)
      muntahal = `مَ${fa}َا${ain}ِيَ`; 
      explanation = `Isim Ma'ful Naqis Wawi '${singular}' memiliki Jamak Salim '${qillah}'. Jamak Broken (Taksir) dan Shighot Jamak Tertinggi (Muntahal Jumu') adalah '${muntahal}' setelah mengalami I'lal (merubah wawu sukun menjadi ya' karena harokat kasroh sebelumnya).`;
    } else {
      singular = `مَ${fa}${SUKUN}${ain}ِ${lam}ٌّ`; // مَرْمِيٌّ
      qillah = `مَ${fa}${SUKUN}${ain}ِ${lam}ُّونَ`; // مَرْمِيُّونَ
      katsroh = `مَ${fa}َا${ain}ِيَ`; // مَرامِيَ (wazan مَفَاعِيلُ but mutated)
      muntahal = `مَ${fa}َا${ain}ِيَ`; 
      explanation = `Isim Ma'ful Naqis Ya'i '${singular}' memiliki Jamak Salim '${qillah}'. Shighot Muntahal Jumu' dan Jamak Katsroh-nya melebur menjadi '${muntahal}' di bawah qaidah I'lal Naqis.`;
    }
  } else {
    // Shohih, Mitsal, etc.
    singular = `مَ${fa}${SUKUN}${ain}ُ${lam}ٌ`; // مَنْصُورٌ
    qillah = `مَ${fa}${SUKUN}${ain}ُ${lam}ُونَ`; // مَنْصُورُونَ
    katsroh = `مَ${fa}َا${ain}ِي${lam}ُ`; // مَنَاصِيرُ (wazan مَفَاعِيلُ)
    muntahal = `مَ${fa}َا${ain}ِي${lam}ُ`; // مَنَاصِيرُ
    explanation = `Isim Ma'ful Shahih '${singular}' dijamakkan secara sedikit (Qillah) ke Jamak Salim '${qillah}'. Untuk kuantitas banyak (Katsroh) dan Shighot Muntahal Jumu' dirujuk ke wazan مَفَاعِيلُ menjadi '${muntahal}'.`;
  }

  return {
    katsroh,
    qillah,
    muntahal,
    reference: "Lisanul 'Arab, Tajul 'Arus, Al-Kitab",
    explanation
  };
}
