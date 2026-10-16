import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { CATEGORY_OPTION_KEYS, RESPONSIBLE_DEPARTMENTS, type Category, type CheckStatus, dateKey, type DepartmentKey, type IssuePriority, type MeetingPeriod, type MeetingStatus, meetingSlotKey, meetingTime, isOpenIssue, isIssueRecord } from '../domain/model';
import { t, type TextKey } from '../domain/i18n';
import { useDm } from '../state/DmProvider';
import { Card, PhotoField, PrimaryButton, Row, StatusBadge } from './components';
import { colors } from './theme';

export function CheckForm({ type, category, meetingPeriod = 'morning' }: { type: '4m' | 'meeting'; category?: Category; meetingPeriod?: MeetingPeriod }) {
  const { settings, addRecord, records } = useDm();
  const language = settings.language;
  const slotKey = type === '4m' ? `${dateKey()}-${settings.targetShift}` : meetingSlotKey(meetingPeriod);
  const latest = records.find(record => record.type === type && record.category === category && record.workshop === settings.workshop && (type === 'meeting' || record.targetShift === settings.targetShift || (!record.targetShift && record.shift === settings.targetShift)) && record.slotKey === slotKey);
  const [status, setStatus] = useState<CheckStatus | MeetingStatus>(latest?.status ?? (type === 'meeting' ? 'held' : 'normal'));
  const [selection, setSelection] = useState<string | undefined>(latest?.selection ?? (category ? CATEGORY_OPTION_KEYS[category][0] : undefined));
  const [note, setNote] = useState(latest?.note ?? '');
  const [responsibleDepartment, setResponsibleDepartment] = useState<DepartmentKey | undefined>(latest?.responsibleDepartment);
  const [responsiblePerson, setResponsiblePerson] = useState(latest?.responsiblePerson ?? '');
  const [priority, setPriority] = useState<IssuePriority>(latest?.priority ?? 'beforeStart');
  const [photoUri, setPhotoUri] = useState<string | null>(latest?.photoUri ?? null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isMeeting = type === 'meeting';
  const isIssue = status === 'abnormal' || status === 'missed';
  const unresolvedExistingIssue = Boolean(latest && isIssueRecord(latest) && isOpenIssue(latest));
  const outcomeOptions: (CheckStatus | MeetingStatus)[] = isMeeting ? ['held', 'missed'] : ['normal', 'abnormal'];
  const meetingLabel = meetingPeriod === 'morning' ? t(language, 'meetingMorning') : t(language, 'meetingAfternoon');
  const timeLabel = meetingTime(settings, meetingPeriod);

  async function save() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (unresolvedExistingIssue) { setError(t(language, 'unresolvedTask')); return; }
    if (type === '4m' && category && !selection) { setError(t(language, 'fourMRequiredOptions')); return; }
    if (!photoUri) { setError(t(language, 'photoRequired')); return; }
    if (isIssue && !note.trim()) { setError(t(language, status === 'missed' ? 'meetingRequiredNote' : 'issueRequiredImpact')); return; }
    if (isIssue && !responsibleDepartment) { setError(t(language, 'issueRequiredDepartment')); return; }
    if (isIssue && !responsiblePerson.trim()) { setError(t(language, 'issueRequiredPerson')); return; }
    setSaving(true);
    try {
      const createdAt = new Date().toISOString();
      const recordId = latest?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const revisionHistory = latest ? [...(latest.revisionHistory ?? []), {
        id: `${Date.now()}-revision`, editor: settings.operator.trim(), createdAt,
        status: latest.status, note: latest.note, photoUri: latest.photoUri, selection: latest.selection,
      }] : undefined;
      const reopeningIssue = isIssue && (!latest?.issueStatus || latest.issueStatus === 'closed');
      const issueUpdates = isIssue && reopeningIssue
        ? [...(latest?.issueUpdates ?? []), { id: `${Date.now()}-reported`, actor: settings.operator.trim(), action: 'reported' as const, message: note.trim(), createdAt }]
        : latest?.issueUpdates;
      await addRecord({
        id: recordId,
        type: isMeeting ? 'meeting' : '4m', category,
        workshop: settings.workshop, operator: settings.operator.trim(), shift: settings.shift,
        targetShift: type === '4m' ? settings.targetShift : undefined,
        status, note: note.trim(), photoUri, selection, meetingPeriod: isMeeting ? meetingPeriod : undefined,
        slotKey, createdAt, revision: (latest?.revision ?? 0) + (latest ? 1 : 0), revisionHistory,
        responsiblePerson: isIssue ? responsiblePerson.trim() : undefined,
        responsibleDepartment: isIssue ? responsibleDepartment : undefined, priority: isIssue ? priority : undefined,
        issueStatus: reopeningIssue ? 'awaitingAck' : latest?.issueStatus, issueUpdates,
      });
      router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <Card style={formStyles.form}>
    <Row style={formStyles.context}>
      <Text style={formStyles.mini}>{settings.workshop} · {t(language, isMeeting ? settings.shift : settings.targetShift)}{isMeeting ? ` · ${meetingLabel} ${timeLabel}` : ` · ${t(language, 'currentShiftTarget')}`}</Text>
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
      <Row><Text style={formStyles.label}>{t(language, 'evidence')}</Text><StatusBadge label={language === 'zh' ? '必拍' : 'ต้องถ่าย'} tone="teal" /></Row>
      <PhotoField language={language} value={photoUri} onChange={setPhotoUri} />
    </View>

    {isIssue ? <View style={formStyles.issueFields}>
      <View style={formStyles.field}>
        <Text style={formStyles.label}>{t(language, 'responsibleDepartment')} · *</Text>
        <View style={formStyles.choiceGrid}>{RESPONSIBLE_DEPARTMENTS.map(department => {
          const labels = { production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' } as const;
          const label = t(language, labels[department]);
          return <Pressable key={department} accessibilityRole="button" accessibilityState={{ selected: responsibleDepartment === department }} onPress={() => setResponsibleDepartment(department)} style={[formStyles.choice, responsibleDepartment === department && formStyles.choiceActive]}>
            <Text style={[formStyles.choiceText, responsibleDepartment === department && formStyles.choiceTextActive]}>{label}</Text>
          </Pressable>;
        })}</View>
      </View>

      <View style={formStyles.field}>
        <Text style={formStyles.label}>{t(language, 'responsiblePerson')} · *</Text>
        <TextInput value={responsiblePerson} onChangeText={setResponsiblePerson} placeholder={t(language, 'responsiblePersonPlaceholder')} style={formStyles.inputSingle} placeholderTextColor="#98A5AA" returnKeyType="done" />
      </View>

      <View style={formStyles.field}>
        <Text style={formStyles.label}>{t(language, 'issuePriority')}</Text>
        <View style={formStyles.priorityRow}>{(['immediate', 'beforeStart', 'followUp'] as const).map(value => {
          const active = priority === value;
          const labelKey = value === 'immediate' ? 'priorityImmediate' : value === 'beforeStart' ? 'priorityBeforeStart' : 'priorityFollowUp';
          return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setPriority(value)} style={[formStyles.priorityButton, active && formStyles.priorityActive, value === 'immediate' && active && formStyles.priorityImmediate]}>
            <Text style={[formStyles.priorityText, active && formStyles.priorityTextActive]}>{t(language, labelKey)}</Text>
          </Pressable>;
        })}</View>
        <Text style={formStyles.help}>{t(language, 'issuePriorityHint')}</Text>
      </View>
    </View> : null}

    <View style={formStyles.field}>
      <Text style={formStyles.label}>{t(language, isIssue ? 'issueImpact' : 'note')}{isIssue ? ' · *' : ''}</Text>
      <TextInput value={note} onChangeText={setNote} placeholder={t(language, isIssue ? 'issueImpactPlaceholder' : 'notePlaceholder')} multiline textAlignVertical="top" style={formStyles.input} placeholderTextColor="#98A5AA" />
    </View>

    {error ? <Text style={formStyles.error}>{error}</Text> : null}
    {unresolvedExistingIssue ? <PrimaryButton label={t(language, 'viewIssue')} secondary onPress={() => router.push({ pathname: '/issue', params: { id: latest!.id } } as never)} /> : null}
    <PrimaryButton label={saving ? '…' : t(language, latest ? 'correctionRecord' : 'save')} onPress={save} disabled={saving || unresolvedExistingIssue} />
  </Card>;
}

const formStyles = StyleSheet.create({
  form: { padding: 16, borderRadius: 18, gap: 16 }, context: { paddingBottom: 3 }, mini: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  field: { gap: 9 }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  segment: { flexDirection: 'row', backgroundColor: '#F0F4F9', padding: 4, borderRadius: 12, gap: 5 }, segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 }, segmentText: { color: colors.muted, fontWeight: '800', fontSize: 13 }, segmentTextActive: { color: '#fff' }, normalActive: { backgroundColor: colors.teal }, abnormalActive: { backgroundColor: colors.red },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { flexGrow: 1, minWidth: '45%', minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFE' }, choiceActive: { backgroundColor: colors.blueSoft, borderColor: colors.blue }, choiceText: { color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }, choiceTextActive: { color: colors.blue },
  input: { minHeight: 92, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, lineHeight: 22, color: colors.ink, backgroundColor: '#FBFCFE' }, inputSingle: { minHeight: 50, borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 16, color: colors.ink, backgroundColor: '#FBFCFE' },
  issueFields: { gap: 16, paddingTop: 15, paddingBottom: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }, priorityRow: { flexDirection: 'row', gap: 7 }, priorityButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: '#FBFCFE' }, priorityActive: { backgroundColor: colors.blue, borderColor: colors.blue }, priorityImmediate: { backgroundColor: colors.red, borderColor: colors.red }, priorityText: { color: colors.muted, fontSize: 12, fontWeight: '800', textAlign: 'center' }, priorityTextActive: { color: '#fff' }, help: { color: colors.muted, fontSize: 12, lineHeight: 18 }, error: { color: colors.red, fontSize: 13, lineHeight: 19, fontWeight: '700' },
});
