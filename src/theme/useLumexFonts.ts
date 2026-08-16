import { useEffect } from 'react';
import { Platform } from 'react-native';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Geist:wght@500;600;700&display=swap';

/** Modern SaaS fonts — Inter body, Geist for display accents (web). */
export function useLumexFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'lumexai-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'lumexai-font-style';
    style.textContent = `
      html, body, #root, * {
        font-family: Inter, Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      }
      input, textarea, button {
        font-family: Inter, Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
}
