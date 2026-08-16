import { Platform } from 'react-native';

export type PickedMedia = {
  uri: string;
  name: string;
  type: string;
  kind: 'image' | 'video';
  file?: File;
};

/** Web-first file picker for EA picture/video uploads. */
export function pickEaMedia(): Promise<PickedMedia | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) {
        resolve(null);
        return;
      }
      const uri = URL.createObjectURL(file);
      resolve({
        uri,
        name: file.name || `ea-media-${Date.now()}`,
        type: file.type || 'application/octet-stream',
        kind: file.type.startsWith('video/') ? 'video' : 'image',
        file,
      });
    };
    document.body.appendChild(input);
    input.click();
  });
}
