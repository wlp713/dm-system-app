import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectEvidence } from '../data/photo';
import { t } from '../domain/i18n';
import { Language } from '../domain/model';
import { colors } from './theme';

export function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <Text style={styles.eyebrow}>{children}</Text>; }
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
    {value ? <View style={styles.photoPreview}><Image source={{ uri: value }} style={styles.photo} resizeMode="cover" /><Pressable onPress={() => onChange(null)} style={styles.removePhoto}><Text style={styles.removePhotoText}>{t(language, 'removePhoto')}</Text></Pressable></View>
      : <View style={styles.photoEmpty}><Text style={styles.photoGlyph}>＋</Text><Text style={styles.photoEmptyText}>{t(language, 'photoProof')}</Text></View>}
    <View style={styles.photoActions}><View style={styles.photoAction}><PrimaryButton label={t(language, 'takePhoto')} onPress={() => choose('camera')} secondary disabled={working} /></View><View style={styles.photoAction}><PrimaryButton label={t(language, 'choosePhoto')} onPress={() => choose('library')} secondary disabled={working} /></View></View>
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
  photoEmpty: { borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9CBCB', backgroundColor: '#F8FBFA', height: 145, alignItems: 'center', justifyContent: 'center', gap: 3 },
  photoGlyph: { color: colors.teal, fontSize: 36, fontWeight: '300' }, photoEmptyText: { color: colors.muted, fontWeight: '700' },
  photoPreview: { position: 'relative' }, photo: { width: '100%', height: 200, borderRadius: 14 },
  removePhoto: { position: 'absolute', right: 10, top: 10, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#FFFFFFE8', borderRadius: 8 },
  removePhotoText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 10 }, photoAction: { flex: 1 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }, error: { color: colors.red, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
