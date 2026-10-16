import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { CATEGORY_OPTION_KEYS, type Category, type CheckStatus, dateKey, type MeetingPeriod, type MeetingStatus, meetingSlotKey, meetingTime } from '../domain/model';
import { t, type TextKey } from '../domain/i18n';
import { useDm } from '../state/DmProvider';
import { Card, PhotoField, PrimaryButton, Row, StatusBadge } from './components';
import { colors } from './theme';

export function CheckForm({ type, category, meetingPeriod = 'morning' }: { type: '4m' | 'meeting'; category?: Category; meetingPeriod?: MeetingPeriod }) {
  const { settings, addRecord, records } = useDm();
  const language = settings.language;
  const [status, setStatus] = useState<CheckStatus | MeetingStatus>(type === 'meeting' ? 'held' : 'normal');
  const [selection, setSelection] = useState<string | undefined>(category ? CATEGORY_OPTION_KEYS[category][0] : undefined);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const slotKey = type === '4m' ? `${dateKey()}-${settings.shift}` : meetingSlotKey(meetingPeriod);
  const latest = records.find(record => record.type === type && record.category === category && record.workshop === settings.workshop && (type === 'meeting' || record.shift === settings.shift) && record.slotKey === slotKey);
  const photoOptional = type === '4m' && category === 'person';
  const isMeeting = type === 'meeting';
  const outcomeOptions: (CheckStatus | MeetingStatus)[] = isMeeting ? ['held', 'missed'] : ['normal', 'abnormal'];
  const meetingLabel = meetingPeriod === 'morning' ? t(language, 'meetingMorning') : t(language, 'meetingAfternoon');
  const timeLabel = meetingTime(settings, meetingPeriod);

  async function save() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (type === '4m' && category && !selection) { setError(t(language, 'fourMRequiredOptions')); return; }
    if (!photoUri && !photoOptional) { setError(t(language, 'photoRequired')); return; }
    if ((status === 'abnormal' || status === 'missed') && !note.trim()) { setError(t(language, status === 'missed' ? 'meetingRequiredNote' : 'abnormalNote')); return; }
    setSaving(true);
    try {
      await addRecord({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: isMeeting ? 'meeting' : '4m', category,
        workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift,
        status, note: note.trim(), photoUri, selection, meetingPeriod: isMeeting ? meetingPeriod : undefined,
        slotKey, createdAt: new Date().toISOString(),
      });
      router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <Card style={formStyles.form}>
    <Row style={formStyles.context}>
      <Text style={formStyles.mini}>{settings.workshop} · {t(language, settings.shift)}{isMeeting ? ` · ${meetingLabel} ${timeLabel}` : ''}</Text>
      {latest ? <StatusBadge label={t(language, 'completed')} tone="teal" /> : null}
    </Row>

    {type === '4m' && category ? <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, 'pointContent')}</Text>
      <View style={formStyles.choiceGrid}>
        {CATEGORY_OPTION_KEYS[category].map(value => <Pressable key={value} onPress={() => setSelection(value)} style={[formStyles.choice, selection === value && formStyles.choiceActive]}>
          <Text style={[formStyles.choiceText, selection === value && formStyles.choiceTextActive]}>{t(language, value as TextKey)}</Text>
        </Pressable>)}
      </View>
    </View> : null}

    <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, isMeeting ? 'meetingResult' : 'result')}</Text>
      <View style={formStyles.segment}>
        {outcomeOptions.map(value => <Pressable key={value} onPress={() => setStatus(value)} style={[formStyles.segmentButton, status === value && (value === 'normal' || value === 'held' ? formStyles.normalActive : formStyles.abnormalActive)]}>
          <Text style={[formStyles.segmentText, status === value && formStyles.segmentTextActive]}>{t(language, value === 'held' ? 'meetingHeld' : value === 'missed' ? 'meetingMissed' : value)}</Text>
        </Pressable>)}
      </View>
    </View>

    <View style={formStyles.field}>
      <Row><Text style={formStyles.label}>{t(language, 'evidence')}</Text><StatusBadge label={photoOptional ? (language === 'zh' ? '可选' : 'ไม่บังคับ') : (language === 'zh' ? '需拍照' : 'ต้องมีรูป')} tone={photoOptional ? 'amber' : 'teal'} /></Row>
      <PhotoField language={language} value={photoUri} onChange={setPhotoUri} hint={photoOptional ? t(language, 'photoOptional') : undefined} />
    </View>

    <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, 'note')}{status === 'missed' || status === 'abnormal' ? ' · *' : ''}</Text>
      <TextInput value={note} onChangeText={setNote} placeholder={t(language, 'notePlaceholder')} multiline textAlignVertical="top" style={formStyles.input} placeholderTextColor="#98A5AA" />
    </View>

    {error ? <Text style={formStyles.error}>{error}</Text> : null}
    <PrimaryButton label={saving ? '…' : t(language, 'save')} onPress={save} disabled={saving} />
  </Card>;
}

const formStyles = StyleSheet.create({
  form: { padding: 16, borderRadius: 18, gap: 16 }, context: { paddingBottom: 3 }, mini: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  field: { gap: 9 }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  segment: { flexDirection: 'row', backgroundColor: '#F0F4F9', padding: 4, borderRadius: 12, gap: 5 }, segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 }, segmentText: { color: colors.muted, fontWeight: '800', fontSize: 13 }, segmentTextActive: { color: '#fff' }, normalActive: { backgroundColor: colors.teal }, abnormalActive: { backgroundColor: colors.red },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, choice: { flexGrow: 1, minWidth: '45%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFE' }, choiceActive: { backgroundColor: colors.blueSoft, borderColor: colors.blue }, choiceText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, choiceTextActive: { color: colors.blue },
  input: { minHeight: 90, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 14, lineHeight: 20, color: colors.ink, backgroundColor: '#FBFCFE' }, error: { color: colors.red, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
