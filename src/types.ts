/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DataWazan {
  fa: string;         // Character (Arabic)
  ain: string;        // Character (Arabic)
  lam: string;        // Character (Arabic)
  wazanMadhi: string; // e.g. "فَعَلَ"
  wazanMudhari: string; // e.g. "يَفْعُلُ"
  masdar: string;     // e.g. "فَعْلًا"
}

export interface ShighotDetail {
  mufrod: string;
  jamak: string[];
  muntahal: string[];
}

export interface TasrifIstilahi {
  madhi: string;
  mudhari: string;
  masdar: string;
  masdar23: string[];
  isimFail: ShighotDetail;
  isimMaful: ShighotDetail;
  isimMusyabihat: ShighotDetail;
  mubalaghohFaal: ShighotDetail;
  mubalaghohFa_il: ShighotDetail; // fa'il as fa_il
  mubalaghohMifal: ShighotDetail;
  amar: string;
  nahi: string;
  isimZaman: ShighotDetail;
  isimMakan: ShighotDetail;
  isimAlat: ShighotDetail;
  tafdhilMuzakkar: string;
  tafdhilMuannats: string;
  tafdhilJamak: string;
  marrah: string;
  nau: string;
}

export interface TasrifLughowi {
  madhi14: string[];
  mudhari14: string[];
  amar12: string[];
  nahi12: string[];
  isimFail6: string[];
  isimMaful6: string[];
  isimZaman6: string[];
  isimMakan6: string[];
  isimAlat6: string[];
}

export interface DictionaryEntry {
  id: string;
  root: {
    fa: string;
    ain: string;
    lam: string;
  };
  translation: string;
  babNum: number;   // 1 to 6
  masdar?: string;
  notes?: string;
  custom?: boolean;
  aiExplanation?: string;
}
