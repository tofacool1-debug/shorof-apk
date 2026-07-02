import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useFloat() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -5, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return {
    style: { 
      transform: [{ translateY: floatAnim }, { scale: floatAnim.interpolate({inputRange: [-5, 0], outputRange: [1.02, 1]}) }],
      shadowColor: '#f59e0b',
      shadowOpacity: 0.35,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
    }
  };
}
