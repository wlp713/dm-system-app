import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import type { IssueAction, IssueStatus } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PrimaryButton, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';
import { shareIssue } from '../../data/shareIssue';

type TransitionAction = Exclude<IssueAction, 'reported' | 'comment'>;
type ActionButton = { action: TransitionAction; label: 'acceptIssue' | 'startIssue' | 'sendToVerify' | 'verifyClose' | 'returnToWork' | 'handoverIssue'; tone?: 'secondary' };

function actionsFor(status: IssueStatus): ActionButton[] {
  if (status === 'awaitingAck') return [{ action: 'accepted', label: 'acceptIssue' }, { action: 'handedOver', label: 'handoverIssue', tone: 'secondary' }];
  if (status === 'accepted') return [{ action: 'started', label: 'startIssue' }, { action: 'submittedForReview', label: 'sendToVerify', tone: 'secondary' }, { action: 'handedOver', label: 'handoverIssue', tone: 'secondary' }];
  if (status === 'processing') return [{ action: 'submittedForReview', label: 'sendToVerify' }, { action: 'handedOver', label: 'handoverIssue', tone: 'secondary' }];
  if (status === 'waitingVerification') return [{ action: 'closed', label: 'verifyClose' }, { action: 'returned', label: 'returnToWork', tone: 'secondary' }];
  if (status === 'crossShift') return [{ action: 'accepted', label: 'acceptIssue' }];
  return [];
}

function actionLabelKey(action: IssueAction) {
  const keys = { reported: 'actionReported', accepted: 'actionAccepted', started: 'actionStarted', submittedForReview: 'actionSubmittedForReview', returned: 'actionReturned', handedOver: 'actionHandedOver', closed: 'actionClosed', comment: 'actionComment' } as const;
  return keys[action];
}

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { records, settings, updateIssue } = useDm();
  const language = settings.language;
  const record = useMemo(() => records.find(item => item.id === id && (item.status === 'abnormal' || item.status === 'missed')), [id, records]);
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [working, setWorking] = useState(false);
  if (!record) return <Screen><Title>{t(language, 'issueTitle')}</Title><Card><Text style={s.body}>{t(language, 'noOpenIssues')}</Text><PrimaryButton label={t(language, 'todos')} onPress={() => router.replace('/(tabs)/inbox' as never)} /></Card></Screen>;

  const issueStatus = record.issueStatus ?? 'awaitingAck';
  const title = record.type === '4m' && record.category ? `${t(language, 'fourM')} · ${categoryName(language, record.category, true)}` : t(language, 'meeting');
  const statusTone = issueStatus === 'closed' ? 'teal' : record.priority === 'immediate' ? 'red' : 'amber';
  const departmentKey = record.responsibleDepartment ? ({ production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' } as const)[record.responsibleDepartment] : 'deptOther';
  const priorityKey = record.priority ? ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[record.priority] : 'priorityBeforeStart';

  async function applyAction(action: Exclude<IssueAction, 'reported'>, message = '') {
    setWorking(true);
    setFeedback('');
    try {
      await updateIssue(record!.id, action, message);
      setComment('');
    } catch {
      setFeedback(t(language, 'statusActionRequired'));
    } finally { setWorking(false); }
  }

  async function share() {
    try {
      const result = await shareIssue(record!, language);
      setFeedback(result === 'copied' ? t(language, 'shareCopied') : result === 'manual' ? t(language, 'shareIssue') : '');
    } catch { setFeedback(''); }
  }

  return <Screen>
    <Eyebrow>{record.workshop} · {t(language, record.targetShift ?? record.shift)}</Eyebrow>
    <Title subtitle={`${t(language, 'reportedBy')}: ${record.operator}`}>{title}</Title>

    <Card style={s.issueCard}>
      <Row><StatusBadge label={t(language, issueStatus)} tone={statusTone} /><StatusBadge label={t(language, priorityKey)} tone={record.priority === 'immediate' ? 'red' : 'amber'} /></Row>
      <Text style={s.impact}>{record.note}</Text>
      {record.photoUri ? <Image source={{ uri: record.photoUri }} style={s.photo} resizeMode="cover" /> : null}
      <View style={s.metaBlock}>
        <Text style={s.meta}>{t(language, 'responsibleDepartment')}: {t(language, departmentKey)}</Text>
        <Text style={s.owner}>{t(language, 'responsiblePerson')}: {record.responsiblePerson || t(language, 'noName')}</Text>
        <Text style={s.meta}>{new Date(record.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={share} style={s.shareButton}><Text style={s.shareLabel}>{t(language, 'shareIssue')}</Text></Pressable>
    </Card>

    {actionsFor(issueStatus).length ? <Card style={s.actionCard}>
      <Text style={s.section}>{t(language, 'statusAction')}</Text>
      {actionsFor(issueStatus).map(item => <PrimaryButton key={item.action} label={t(language, item.label)} secondary={item.tone === 'secondary'} disabled={working} onPress={() => void applyAction(item.action, item.action === 'closed' ? t(language, 'actionClosed') : '')} />)}
    </Card> : null}

    {issueStatus !== 'closed' ? <Card style={s.actionCard}>
      <Text style={s.section}>{t(language, 'addUpdate')}</Text>
      <TextInput value={comment} onChangeText={setComment} placeholder={t(language, 'updatePlaceholder')} multiline textAlignVertical="top" style={s.input} placeholderTextColor="#98A5AA" />
      <PrimaryButton label={working ? '…' : t(language, 'addUpdate')} secondary onPress={() => comment.trim() && void applyAction('comment', comment)} disabled={working || !comment.trim()} />
    </Card> : null}

    {feedback ? <Text style={s.feedback}>{feedback}</Text> : null}

    <Card style={s.historyCard}>
      <Text style={s.section}>{t(language, 'issueHistory')}</Text>
      {[...(record.issueUpdates ?? [])].reverse().map(item => <View key={item.id} style={s.timelineItem}>
        <View style={s.timelineDot} />
        <View style={s.timelineCopy}>
          <Row><Text style={s.action}>{t(language, actionLabelKey(item.action))}</Text><Text style={s.time}>{new Date(item.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text></Row>
          <Text style={s.meta}>{item.actor} · {new Date(item.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
          {item.message ? <Text style={s.message}>{item.message}</Text> : null}
        </View>
      </View>)}
      {!record.issueUpdates?.length ? <Text style={s.meta}>{t(language, 'empty')}</Text> : null}
    </Card>
  </Screen>;
}

const s = StyleSheet.create({
  issueCard: { borderColor: '#F0C7C0', gap: 14 }, actionCard: { gap: 10 }, historyCard: { gap: 12 }, section: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  impact: { color: colors.ink, fontSize: 17, lineHeight: 25, fontWeight: '700' }, photo: { width: '100%', height: 205, borderRadius: 13 }, metaBlock: { gap: 4 }, meta: { color: colors.muted, fontSize: 13, lineHeight: 19 }, owner: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  shareButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.blueSoft }, shareLabel: { color: colors.blue, fontSize: 14, fontWeight: '900' }, input: { minHeight: 85, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, lineHeight: 22, color: colors.ink, backgroundColor: '#FBFCFE' }, feedback: { color: colors.teal, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  timelineItem: { flexDirection: 'row', gap: 10, paddingBottom: 12 }, timelineDot: { width: 10, height: 10, borderRadius: 6, marginTop: 6, backgroundColor: colors.teal }, timelineCopy: { flex: 1, gap: 3 }, action: { color: colors.ink, fontSize: 14, fontWeight: '800' }, time: { color: colors.muted, fontSize: 11 }, message: { color: colors.ink, fontSize: 14, lineHeight: 21, marginTop: 3 }, body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
