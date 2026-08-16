import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type PickedMedia = {
  uri: string;
  name: string;
  type: string;
  kind: 'image' | 'video';
  file?: File;
};

/** Pick picture or video for EA uploads — native ImagePicker, web file input. */
export async function pickEaMedia(): Promise<PickedMedia | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
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

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const mime =
    asset.mimeType ||
    (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
  const ext = mime.includes('png')
    ? 'png'
    : mime.includes('webm')
      ? 'webm'
      : mime.includes('video')
        ? 'mp4'
        : 'jpg';

  return {
    uri: asset.uri,
    name: asset.fileName || `ea-media-${Date.now()}.${ext}`,
    type: mime,
    kind: asset.type === 'video' || mime.startsWith('video/') ? 'video' : 'image',
  };
}
