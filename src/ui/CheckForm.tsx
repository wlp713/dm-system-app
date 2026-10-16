import { useState } from 'react';
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
  const photoOptional = category === 'person';

  async function save() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (!photoUri && !photoOptional) { setError(t(language, 'photoRequired')); return; }
    if (status === 'abnormal' && !note.trim()) { setError(t(language, 'abnormalNote')); return; }
    setSaving(true);
    try {
      await addRecord({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, category, workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift, status, note: note.trim(), photoUri, slotKey, createdAt: new Date().toISOString() });
      setPhotoUri(null); setNote(''); setStatus('normal');
      if (type === '4m') router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <Card style={formStyles.form}>
    <Row style={formStyles.context}>
      <Text style={formStyles.mini}>{settings.workshop} · {t(language, settings.shift)}{type === 'twoHour' ? ` · ${slot.label}` : ''}</Text>
      {latest ? <StatusBadge label={t(language, 'completed')} tone="teal" /> : null}
    </Row>

    <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, 'result')}</Text>
      <View style={formStyles.segment}>
        {(['normal', 'abnormal'] as CheckStatus[]).map(value => <Pressable key={value} onPress={() => setStatus(value)} style={[formStyles.segmentButton, status === value && (value === 'normal' ? formStyles.normalActive : formStyles.abnormalActive)]}>
          <Text style={[formStyles.segmentText, status === value && formStyles.segmentTextActive]}>{t(language, value)}</Text>
        </Pressable>)}
      </View>
    </View>

    <View style={formStyles.field}>
      <Row><Text style={formStyles.label}>{t(language, 'evidence')}</Text><StatusBadge label={photoOptional ? (language === 'zh' ? '可选' : 'ไม่บังคับ') : (language === 'zh' ? '需拍照' : 'ต้องมีรูป')} tone={photoOptional ? 'amber' : 'teal'} /></Row>
      <PhotoField language={language} value={photoUri} onChange={setPhotoUri} hint={photoOptional ? t(language, 'photoOptional') : undefined} />
    </View>

    <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, 'note')}</Text>
      <TextInput value={note} onChangeText={setNote} placeholder={t(language, 'notePlaceholder')} multiline textAlignVertical="top" style={formStyles.input} placeholderTextColor="#98A5AA" />
    </View>

    {error ? <Text style={formStyles.error}>{error}</Text> : null}
    <PrimaryButton label={saving ? '…' : t(language, 'save')} onPress={save} disabled={saving} />
  </Card>;
}

const formStyles = StyleSheet.create({
  form: { padding: 16, borderRadius: 18, gap: 17 }, context: { paddingBottom: 3 }, mini: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  field: { gap: 9 }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  segment: { flexDirection: 'row', backgroundColor: '#F0F4F9', padding: 4, borderRadius: 12, gap: 5 }, segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 }, segmentText: { color: colors.muted, fontWeight: '800', fontSize: 13 }, segmentTextActive: { color: '#fff' }, normalActive: { backgroundColor: colors.teal }, abnormalActive: { backgroundColor: colors.red },
  input: { minHeight: 90, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 14, lineHeight: 20, color: colors.ink, backgroundColor: '#FBFCFE' }, error: { color: colors.red, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
