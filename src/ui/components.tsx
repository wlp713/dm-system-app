import React from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectEvidence } from '../data/photo';
import { t } from '../domain/i18n';
import { Language } from '../domain/model';
import { colors } from './theme';

export function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function AppIcon({ name, glyph, tintColor, size }: { name: SymbolViewProps['name']; glyph: string; tintColor: ColorValue; size: number }) {
  if (Platform.OS === 'web' && glyph === 'camera') return <View aria-hidden style={{ width: size * 1.2, height: size * 0.82, borderWidth: 2, borderColor: tintColor, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}><View style={{ position: 'absolute', left: size * 0.16, top: -size * 0.16, width: size * 0.38, height: size * 0.18, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: tintColor }} /><View style={{ width: size * 0.43, height: size * 0.43, borderRadius: size, borderWidth: 2, borderColor: tintColor }} /></View>;
  if (Platform.OS === 'web') return <Text aria-hidden style={{ color: tintColor, fontSize: size, lineHeight: size + 2, fontWeight: '800', textAlign: 'center' }}>{glyph}</Text>;
  return <SymbolView name={name} tintColor={tintColor} size={size} />;
}
export function Title({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return <View style={styles.titleWrap}><Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: object }) { return <View style={[styles.card, style]}>{children}</View>; }
export function Row({ children, style }: { children: React.ReactNode; style?: object }) { return <View style={[styles.row, style]}>{children}</View>; }
export function PrimaryButton({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled, pressed && { opacity: 0.82 }]}><Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text></Pressable>;
}
export function StatusBadge({ label, tone = 'teal' }: { label: string; tone?: 'teal' | 'amber' | 'red' }) {
  const backgroundColor = tone === 'teal' ? colors.tealSoft : tone === 'amber' ? colors.amberSoft : colors.redSoft;
  const color = tone === 'teal' ? colors.teal : tone === 'amber' ? colors.amber : colors.red;
  return <View style={[styles.badge, { backgroundColor }]}><Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}

export function PhotoField({ language, value, onChange, hint }: { language: Language; value: string | null; onChange: (uri: string | null) => void; hint?: string }) {
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState('');
  async function choose(source: 'camera' | 'library') {
    setError(''); setWorking(true);
    try { const uri = await selectEvidence(source); if (uri) onChange(uri); }
    catch (reason) { setError(reason instanceof Error && reason.message === 'camera-permission' ? t(language, 'permission') : t(language, 'photoError')); }
    finally { setWorking(false); }
  }
  return <View>
    <View style={styles.evidenceRow}>
      {value ? <View style={styles.photoPreview}><Image source={{ uri: value }} style={styles.photo} resizeMode="cover" /><Pressable onPress={() => onChange(null)} style={styles.removePhoto}><Text style={styles.removePhotoText}>{t(language, 'removePhoto')}</Text></Pressable></View>
        : <View style={styles.photoEmpty}><Text style={styles.photoEmptyText}>{t(language, 'photoProof')}</Text></View>}
      <Pressable onPress={() => choose('camera')} disabled={working} style={({ pressed }) => [styles.photoAddTile, pressed && { opacity: 0.75 }]}>
        <AppIcon name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} glyph="camera" tintColor={colors.teal} size={24} />
        <Text style={styles.photoAddText}>{value ? t(language, 'takePhoto') : t(language, 'takePhoto')}</Text>
      </Pressable>
    </View>
    <Pressable onPress={() => choose('library')} disabled={working} style={styles.libraryLink}><Text style={styles.libraryText}>{t(language, 'choosePhoto')}　›</Text></Pressable>
    {working ? <ActivityIndicator color={colors.teal} style={{ marginTop: 10 }} /> : null}
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>;
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { padding: 20, paddingBottom: 36, gap: 17, width: '100%', maxWidth: 780, alignSelf: 'center' },
  eyebrow: { color: colors.teal, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  titleWrap: { gap: 6 }, title: { color: colors.ink, fontSize: 27, fontWeight: '800', lineHeight: 35 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 19, borderWidth: 1, borderColor: colors.line, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  button: { backgroundColor: colors.teal, borderRadius: 13, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  buttonSecondary: { backgroundColor: colors.tealSoft }, buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 }, buttonTextSecondary: { color: colors.teal },
  badge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { fontSize: 12, fontWeight: '800' },
  evidenceRow: { flexDirection: 'row', alignItems: 'stretch', gap: 9 },
  photoEmpty: { width: 112, height: 108, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#C7D5E7', backgroundColor: '#F7FAFE', alignItems: 'center', justifyContent: 'center', padding: 8 },
  photoEmptyText: { color: colors.muted, fontWeight: '700', fontSize: 11, textAlign: 'center' },
  photoPreview: { width: 112, height: 108, position: 'relative' }, photo: { width: 112, height: 108, borderRadius: 12 },
  photoAddTile: { flex: 1, minWidth: 105, height: 108, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9CBE1', backgroundColor: '#FBFCFE', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoAddText: { color: colors.blue, fontSize: 11, fontWeight: '800' }, libraryLink: { alignSelf: 'flex-start', paddingTop: 10, paddingBottom: 2 }, libraryText: { color: colors.blue, fontSize: 12, fontWeight: '800' },
  removePhoto: { position: 'absolute', right: 10, top: 10, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#FFFFFFE8', borderRadius: 8 },
  removePhotoText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 10 }, photoAction: { flex: 1 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }, error: { color: colors.red, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
