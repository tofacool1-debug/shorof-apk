    import React from 'react';
    import { SafeAreaView, Text, StyleSheet, StatusBar, View } from 'react-native';

    export default function App() {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#020617" />
          <View style={styles.box}>
            <Text style={styles.title}>Shorof Digital</Text>
            <Text style={styles.subtitle}>Alhamdulillah Jalan ✅</Text>
          </View>
        </SafeAreaView>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        alignItems: 'center',
      },
      box: {
        padding: 20,
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10b981',
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
      },
    });
