import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, StatusBar, Alert, BackHandler, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Updates from 'expo-updates';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('Menyiapkan data...');
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  // Tombol back Android buat navigasi di dalam WebView
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  // Cek EAS Updates pas startup
  useEffect(() => {
    async function checkUpdates() {
      if (__DEV__) {
        setInitialLoading(false);
        return;
      }
      try {
        const updateCheck = await Updates.checkForUpdateAsync();
        if (updateCheck.isAvailable) {
          setUpdateStatus('Mengunduh pembaruan tabel...');
          await Updates.fetchUpdateAsync();
          Alert.alert('Pembaruan Siap', 'Data lafadz versi terbaru sudah diunduh', [
            { text: 'Reload', onPress: async () => await Updates.reloadAsync() }
          ]);
        } else {
          setInitialLoading(false);
        }
      } catch (e) {
        setInitialLoading(false);
      }
    }
    checkUpdates();
  }, []);

  // HTML OFFLINE - Edit bagian ini buat nambah tabel bab
  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>Shorof Digital Offline</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #f5f7fa;
          padding: 16px;
          direction: ltr;
        }
       .header {
          background: #059669;
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
       .header h1 { font-size: 24px; margin-bottom: 4px; }
       .header p { font-size: 12px; opacity: 0.9; }
       .card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
       .bab-title {
          font-size: 18px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 8px;
        }
       .arab {
          font-size: 36px;
          color: #059669;
          font-weight: bold;
          margin: 8px 0;
          text-align: center;
          direction: rtl;
          font-family: 'Amiri', 'Scheherazade', serif;
        }
       .label {
          font-size: 13px;
          color: #64748b;
          text-align: center;
        }
       .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
       .cell {
          background: #f0fdf4;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Shorof Digital Pro</h1>
        <p>Mode Offline - Fi'il Ajwaf Wawi</p>
      </div>

      <div class="card">
        <div class="bab-title">Bab 1: Fi'il Madhi</div>
        <div class="arab">قَالَ - يَقُولُ - قُلْ</div>
        <div class="label">Dia berkata - Dia berkata - Katakanlah!</div>

        <div class="grid">
          <div class="cell"><div class="arab">هُوَ</div><div class="label">قَالَ</div></div>
          <div class="cell"><div class="arab">هِيَ</div><div class="label">قَالَتْ</div></div>
          <div class="cell"><div class="arab">أَنْتَ</div><div class="label">قُلْتَ</div></div>
          <div class="cell"><div class="arab">أَنَا</div><div class="label">قُلْتُ</div></div>
        </div>
      </div>

      <div class="card">
        <div class="bab-title">Bab 2: Fi'il Mudhari'</div>
        <div class="arab">يَقُولُ - تَقُولُ</div>
        <div class="label">Dia sedang berkata</div>
      </div>

      <div style="text-align:center; margin-top:30px; color:#94a3b8; font-size:11px;">
        Data offline - Update via EAS Updates
      </div>
    </body>
    </html>
  `;

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Shorof Digital Pro</Text>
        <Text style={styles.subText}>{updateStatus}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ html }} // INI KUNCINYA: pake html bukan uri
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        mixedContentMode="always"
        startInLoadingState={true}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        renderLoading={() => (
          <View style={styles.webviewLoader}>
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webView: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#ffffff', padding: 24,
  },
  loadingText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 16 },
  subText: { fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'center' },
  webviewLoader: {
   ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff',
  },
});
