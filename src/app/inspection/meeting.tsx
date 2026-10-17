import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../../domain/i18n';
import { dateKey, meetingSlotKey, meetingTime, type CheckRecord, type Issue, type MeetingPeriod, type MeetingStatus, type MeetingTime } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PhotoField, PrimaryButton, Row, Screen, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export default function MeetingScreen() {
  const { settings, updateSettings, records, issues, addSubmission } = useDm();
  const [period, setPeriod] = useState<MeetingPeriod>('morning');
  const language = settings.language;
  const slotKey = meetingSlotKey(period);
  const latest = records.find(record => record.type === 'meeting' && record.workshop === settings.workshop && record.slotKey === slotKey);
  const openIssues = useMemo(() => issues.filter(issue => issue.workshop === settings.workshop && issue.status !== 'closed'), [issues, settings.workshop]);
  const existingOpenIssue = issues.find(issue => issue.sourceRecordId === latest?.id && issue.status !== 'closed');
  const [status, setStatus] = useState<MeetingStatus | null>(() => latest?.status === 'held' || latest?.status === 'missed' ? latest.status : null);
  const [photoUri, setPhotoUri] = useState<string | null>(latest?.photoUri ?? null);
  const [summary, setSummary] = useState(latest?.meetingSummary ?? latest?.note ?? '');
  const [reopenAt, setReopenAt] = useState(latest?.nextReviewAt ?? '');
  const [actualTime, setActualTime] = useState(latest?.actualMeetingTime ?? new Date().toTimeString().slice(0, 5));
  const [selectedIssues, setSelectedIssues] = useState<string[]>(latest?.linkedIssueIds ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const scheduledTime = meetingTime(settings, period);
  const isAdmin = settings.role === 'admin';
  const timeOptions: MeetingTime[] = period === 'morning' ? ['10:00', '10:30'] : ['14:00', '15:00'];

  function selectPeriod(value: MeetingPeriod) {
    const saved = records.find(record => record.type === 'meeting' && record.workshop === settings.workshop && record.slotKey === meetingSlotKey(value));
    setPeriod(value);
    setStatus(saved?.status === 'held' || saved?.status === 'missed' ? saved.status : null);
    setPhotoUri(saved?.photoUri ?? null);
    setSummary(saved?.meetingSummary ?? saved?.note ?? '');
    setReopenAt(saved?.nextReviewAt ?? '');
    setActualTime(saved?.actualMeetingTime ?? new Date().toTimeString().slice(0, 5));
    setSelectedIssues(saved?.linkedIssueIds ?? []);
  }

  function setScheduledTime(value: MeetingTime) {
    if (period === 'morning' && (value === '10:00' || value === '10:30')) void updateSettings({ ...settings, morningMeetingTime: value });
    if (period === 'afternoon' && (value === '14:00' || value === '15:00')) void updateSettings({ ...settings, afternoonMeetingTime: value });
  }

  function toggleIssue(id: string) {
    setSelectedIssues(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  }

  async function save() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (!status) { setError(t(language, 'meetingResult')); return; }
    if (!photoUri) { setError(t(language, 'photoRequired')); return; }
    if (status === 'held' && !summary.trim()) { setError(t(language, 'meetingSummary')); return; }
    if (status === 'missed' && (!summary.trim() || !reopenAt.trim())) { setError(t(language, 'meetingRequiredNote')); return; }
    if (status === 'held' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(actualTime)) { setError(t(language, 'meetingActualTime')); return; }
    if (status === 'missed' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(reopenAt.trim())) { setError(t(language, 'reopenAt')); return; }
    if (existingOpenIssue) { setError(t(language, 'unresolvedTask')); return; }
    const sameAgenda = (latest?.linkedIssueIds ?? []).length === selectedIssues.length && selectedIssues.every(id => latest?.linkedIssueIds?.includes(id));
    const unchanged = Boolean(latest && latest.status === status && latest.photoUri === photoUri && latest.note === summary.trim() && sameAgenda && (status !== 'held' || latest.actualMeetingTime === actualTime) && (status !== 'missed' || latest.nextReviewAt === reopenAt.trim()));
    if (unchanged) { setError(t(language, 'noChanges')); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const id = latest?.id ?? newId();
      const record: CheckRecord = {
        id, type: 'meeting', workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift,
        status, note: summary.trim(), photoUri, meetingPeriod: period, actualMeetingTime: status === 'held' ? actualTime : undefined,
        meetingSummary: status === 'held' ? summary.trim() : undefined, nextReviewAt: status === 'missed' ? reopenAt.trim() : undefined,
        linkedIssueIds: selectedIssues, slotKey, createdAt: now,
        revision: (latest?.revision ?? 0) + (latest ? 1 : 0),
        revisionHistory: latest ? [...(latest.revisionHistory ?? []), { id: newId(), editor: settings.operator.trim(), createdAt: now, status: latest.status, note: latest.note, photoUri: latest.photoUri }] : undefined,
      };
      const nextIssues: Issue[] = status === 'missed' ? [{
        id: newId(), sourceRecordId: id, type: 'meeting', workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift,
        title: 'meetingMissed', note: `${summary.trim()} · ${t(language, 'reopenAt')}: ${reopenAt.trim()}`, photoUri,
        responsibleDepartment: 'production', priority: 'beforeStart', status: 'awaitingAck',
        updates: [{ id: newId(), actor: settings.operator.trim(), action: 'reported', message: summary.trim(), createdAt: now }], createdAt: now,
      }] : [];
      await addSubmission([record], nextIssues);
      router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <Screen>
    <Eyebrow>{settings.workshop} · {dateKey()}</Eyebrow>
    <Title subtitle={t(language, 'meetingIntro')}>{t(language, 'meeting')}</Title>
    <Card style={s.card}>
      <Text style={s.label}>{t(language, 'currentSlot')}</Text>
      <View style={s.slotRow}>{(['morning', 'afternoon'] as const).map(value => {
        const selected = period === value;
        const title = t(language, value === 'morning' ? 'meetingMorning' : 'meetingAfternoon');
        const time = value === 'morning' ? settings.morningMeetingTime : settings.afternoonMeetingTime;
        return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => selectPeriod(value)} style={[s.slot, selected && s.slotSelected]}><Text style={[s.slotTitle, selected && s.slotTextActive]}>{title}</Text><Text style={[s.slotTime, selected && s.slotTextActive]}>{time}</Text></Pressable>;
      })}</View>
      {isAdmin ? <>
        <Text style={s.subLabel}>{period === 'morning' ? t(language, 'morningTime') : t(language, 'afternoonTime')}</Text>
        <View style={s.timeChoices}>{timeOptions.map(time => {
          const selected = scheduledTime === time;
          return <Pressable key={time} onPress={() => setScheduledTime(time)} style={[s.timeChoice, selected && s.timeChoiceSelected]}><Text style={[s.timeText, selected && s.timeTextSelected]}>{time}</Text></Pressable>;
        })}</View>
      </> : <Text style={s.hint}>{language === 'zh' ? '会议时间由管理员设定' : 'ผู้ดูแลระบบเป็นผู้กำหนดเวลาประชุม'}</Text>}
    </Card>

    <Card style={s.card}>
      <Text style={s.label}>{t(language, 'meetingResult')}</Text>
      <View style={s.resultRow}>{(['held', 'missed'] as const).map(value => {
        const selected = status === value;
        return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setStatus(value)} style={[s.result, selected && (value === 'held' ? s.resultHeld : s.resultMissed)]}><Text style={[s.resultText, selected && s.resultTextActive]}>{t(language, value === 'held' ? 'meetingHeld' : 'meetingMissed')}</Text></Pressable>;
      })}</View>
      {status === 'held' ? <View style={s.field}><Text style={s.subLabel}>{t(language, 'meetingActualTime')}</Text><TextInput value={actualTime} onChangeText={setActualTime} placeholder={scheduledTime} style={s.inputSingle} placeholderTextColor="#98A5AA" keyboardType="numbers-and-punctuation" /></View> : null}
      <View style={s.field}><Text style={s.subLabel}>{t(language, status === 'missed' ? 'meetingNotHeldReason' : 'meetingSummary')}{status ? ' · *' : ''}</Text><TextInput value={summary} onChangeText={setSummary} placeholder={t(language, status === 'missed' ? 'meetingRequiredNote' : 'meetingSummaryPlaceholder')} multiline textAlignVertical="top" style={s.input} placeholderTextColor="#98A5AA" /></View>
      {status === 'missed' ? <View style={s.field}><Text style={s.subLabel}>{t(language, 'reopenAt')} · *</Text><TextInput value={reopenAt} onChangeText={setReopenAt} placeholder={t(language, 'reopenAtPlaceholder')} style={s.inputSingle} placeholderTextColor="#98A5AA" keyboardType="numbers-and-punctuation" /></View> : null}
    </Card>

    <Card style={s.card}>
      <Row><Text style={s.label}>{t(language, 'meetingAgenda')}</Text><Text style={s.count}>{selectedIssues.length} / {openIssues.length}</Text></Row>
      {openIssues.length ? openIssues.map(issue => {
        const selected = selectedIssues.includes(issue.id);
        return <Pressable key={issue.id} onPress={() => toggleIssue(issue.id)} style={[s.issueOption, selected && s.issueOptionActive]}><View style={[s.checkbox, selected && s.checkboxActive]}><Text style={s.checkboxText}>{selected ? '✓' : ''}</Text></View><View style={s.issueCopy}><Text style={s.issueTitle}>{issue.note}</Text><Text style={s.hint}>{issue.workshop} · {t(language, issue.status)}</Text></View></Pressable>;
      }) : <Text style={s.hint}>{t(language, 'noAgendaIssues')}</Text>}
    </Card>

    <Card style={s.card}>
      <Text style={s.label}>{t(language, 'evidence')} · *</Text>
      <PhotoField language={language} value={photoUri} onChange={setPhotoUri} />
    </Card>
    {existingOpenIssue ? <Card style={s.issueNotice}><Text style={s.hint}>{t(language, 'unresolvedTask')}</Text><PrimaryButton label={t(language, 'viewIssue')} secondary onPress={() => router.push({ pathname: '/issue', params: { id: existingOpenIssue.id } } as never)} /></Card> : null}
    {error ? <Text style={s.error}>{error}</Text> : null}
    <PrimaryButton label={saving ? '…' : t(language, 'saveMeeting')} onPress={() => void save()} disabled={saving || Boolean(existingOpenIssue)} />
  </Screen>;
}

const s = StyleSheet.create({
  card: { padding: 15, borderRadius: 18, gap: 11 }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' }, subLabel: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  slotRow: { flexDirection: 'row', gap: 8 }, slot: { flex: 1, minHeight: 64, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: '#F8FAFD', justifyContent: 'center', alignItems: 'center', gap: 4 }, slotSelected: { borderColor: colors.blue, backgroundColor: colors.blue }, slotTitle: { color: colors.muted, fontSize: 12, fontWeight: '800' }, slotTime: { color: colors.ink, fontSize: 17, fontWeight: '900' }, slotTextActive: { color: '#FFFFFF' },
  timeChoices: { flexDirection: 'row', gap: 8 }, timeChoice: { minWidth: 86, minHeight: 42, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFE', justifyContent: 'center', alignItems: 'center' }, timeChoiceSelected: { borderColor: colors.teal, backgroundColor: colors.tealSoft }, timeText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, timeTextSelected: { color: colors.teal },
  resultRow: { flexDirection: 'row', gap: 8 }, result: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: '#FAFCFE' }, resultHeld: { backgroundColor: colors.teal, borderColor: colors.teal }, resultMissed: { backgroundColor: colors.red, borderColor: colors.red }, resultText: { color: colors.muted, fontSize: 13, fontWeight: '900' }, resultTextActive: { color: '#fff' }, field: { gap: 8 }, input: { minHeight: 86, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.ink, fontSize: 14, lineHeight: 21, backgroundColor: '#FBFCFE' }, inputSingle: { minHeight: 48, borderColor: colors.line, borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, color: colors.ink, fontSize: 14, backgroundColor: '#FBFCFE' },
  issueOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: '#FBFCFE' }, issueOptionActive: { borderColor: colors.blue, backgroundColor: colors.blueSoft }, checkbox: { width: 23, height: 23, borderRadius: 6, borderWidth: 1, borderColor: '#A9B8CB', justifyContent: 'center', alignItems: 'center' }, checkboxActive: { backgroundColor: colors.blue, borderColor: colors.blue }, checkboxText: { color: '#fff', fontSize: 15, fontWeight: '900' }, issueCopy: { flex: 1, gap: 3 }, issueTitle: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '800' }, count: { color: colors.blue, fontSize: 12, fontWeight: '900' }, hint: { color: colors.muted, fontSize: 12, lineHeight: 18 }, issueNotice: { borderColor: '#EBC7C1', backgroundColor: '#FFF9F8' }, error: { color: colors.red, textAlign: 'center', fontSize: 13, fontWeight: '800' },
});
