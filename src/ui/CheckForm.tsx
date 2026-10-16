import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { t } from '../domain/i18n';
import { Category, CheckStatus, CheckType, dateKey, twoHourSlot } from '../domain/model';
import { useDm } from '../state/DmProvider';
import { Card, PhotoField, PrimaryButton, Row, StatusBadge } from './components';
import { colors } from './theme';

export function CheckForm({ type, category }: { type: CheckType; category?: Category }) {
  const { settings, addRecord, records } = useDm();
  const language = settings.language;
  const [status, setStatus] = useState<CheckStatus>('normal');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const slot = twoHourSlot();
  const slotKey = type === '4m' ? `${dateKey()}-${settings.shift}` : slot.key;
  const latest = records.find(record => record.type === type && record.category === category && record.workshop === settings.workshop && record.shift === settings.shift && record.slotKey === slotKey);

  async function save() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (!photoUri && category !== 'person') { setError(t(language, 'photoRequired')); return; }
    if (status === 'abnormal' && !note.trim()) { setError(t(language, 'abnormalNote')); return; }
    setSaving(true);
    try {
      await addRecord({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, category, workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift, status, note: note.trim(), photoUri, slotKey, createdAt: new Date().toISOString() });
      setPhotoUri(null); setNote(''); setStatus('normal');
      if (type === '4m') router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <>
    {latest ? <Card style={{ backgroundColor: colors.tealSoft }}><Row><Text style={formStyles.lastTitle}>{t(language, 'completed')}</Text><StatusBadge label={t(language, latest.status)} tone={latest.status === 'normal' ? 'teal' : 'red'} /></Row><Text style={formStyles.meta}>{new Date(latest.createdAt).toLocaleString()}</Text></Card> : null}
    <Card><Row><Text style={formStyles.sectionTitle}>{t(language, 'result')}</Text><Text style={formStyles.mini}>{settings.workshop} · {t(language, settings.shift)}</Text></Row>
      <View style={formStyles.segment}>
        {(['normal', 'abnormal'] as CheckStatus[]).map(value => <Pressable key={value} onPress={() => setStatus(value)} style={[formStyles.segmentButton, status === value && { backgroundColor: value === 'normal' ? colors.teal : colors.red }]}><Text style={[formStyles.segmentText, status === value && { color: '#fff' }]}>{t(language, value)}</Text></Pressable>)}
      </View>
    </Card>
    <Card><Row><Text style={formStyles.sectionTitle}>{t(language, 'evidence')}</Text><StatusBadge label={category === 'person' ? (language === 'zh' ? '可选' : 'ไม่บังคับ') : (language === 'zh' ? '必传' : 'ต้องมีรูป')} tone={category === 'person' ? 'amber' : 'teal'} /></Row><PhotoField language={language} value={photoUri} onChange={setPhotoUri} hint={category === 'person' ? t(language, 'photoOptional') : undefined} /></Card>
    <Card><Text style={formStyles.sectionTitle}>{t(language, 'note')}</Text><TextInput value={note} onChangeText={setNote} placeholder={t(language, 'notePlaceholder')} multiline textAlignVertical="top" style={formStyles.input} placeholderTextColor="#98A5AA" /></Card>
    {error ? <Text style={formStyles.error}>{error}</Text> : null}
    <PrimaryButton label={saving ? '…' : t(language, 'save')} onPress={save} disabled={saving} />
  </>;
}

const formStyles = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink }, mini: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  segment: { flexDirection: 'row', backgroundColor: colors.background, padding: 4, borderRadius: 12, gap: 4 },
  segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 }, segmentText: { color: colors.muted, fontWeight: '800' },
  input: { minHeight: 95, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 14, color: colors.ink, backgroundColor: '#FBFDFD' },
  error: { color: colors.red, fontSize: 13, fontWeight: '700' }, lastTitle: { color: colors.teal, fontSize: 15, fontWeight: '800' }, meta: { color: colors.muted, fontSize: 12 },
});
