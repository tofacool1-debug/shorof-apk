import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    Amiri_400Regular: require('../assets/fonts/Amiri-Regular.ttf'),
    ArefRuqaa_400Regular: require('../assets/fonts/ArefRuqaa-Regular.ttf'),
    FiraCode_400Regular: require('../assets/fonts/FiraCode-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <Slot /> // atau <Stack />
}
