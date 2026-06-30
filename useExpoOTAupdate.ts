/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * custom hook React Native: useExpoOTAUpdate.ts
 * Mengelola pembaruan luring OTA instan dari server EAS Update
 */
import { useEffect, useState } from "react";
import * as Updates from "expo-updates";

export function useExpoOTAUpdate() {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [statusText, setStatusText] = useState("Siaga");

  const checkAndApplyUpdate = async () => {
    if (__DEV__) {
      setStatusText("Mode Developer: Skip OTA check");
      return;
    }
    
    setIsChecking(true);
    setStatusText("Memeriksa update OTA...");
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        setStatusText("Update ditemukan! Mengunduh bundle baru...");
        
        await Updates.fetchUpdateAsync();
        setStatusText("Update berhasil diunduh. Memasang...");
        
        // Memuat ulang aplikasi secara instan dengan bundle JavaScript baru
        await Updates.reloadAsync();
      } else {
        setStatusText("Aplikasi sudah versi terbaru");
      }
    } catch (error) {
      console.warn("Eror EAS Update:", error);
      setStatusText("Koneksi gagal atau runtime tidak cocok");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Jalankan pemeriksaan saat komponen dipasang
    checkAndApplyUpdate();
  }, []);

  return {
    isChecking,
    updateAvailable,
    statusText,
    checkAndApplyUpdate
  };
}
