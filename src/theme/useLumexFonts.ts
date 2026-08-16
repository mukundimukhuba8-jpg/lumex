import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Font hook for LUMEXAI.
 * Native (iOS/Android) uses the system UI font stack via React Native Text.
 * Optional web stylesheet is loaded only when Platform.OS === 'web'.
 */
export function useLumexFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;

    const id = 'lumexai-fonts';
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);
}
