import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function selectEvidence(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('camera-permission');
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 0.55, base64: Platform.OS === 'web' };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (Platform.OS === 'web') return asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri;
  const sourceFile = new File(asset.uri);
  const extension = (asset.fileName?.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
  const target = new File(Paths.document, `dm-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
  await sourceFile.copy(target);
  return target.uri;
}
