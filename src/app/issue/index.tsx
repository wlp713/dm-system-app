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
  const { issues, settings, updateIssue } = useDm();
  const language = settings.language;
  const issue = useMemo(() => issues.find(item => item.id === id), [id, issues]);
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [working, setWorking] = useState(false);
  if (!issue) return <Screen><Title>{t(language, 'issueTitle')}</Title><Card><Text style={s.body}>{t(language, 'noOpenIssues')}</Text><PrimaryButton label={t(language, 'todos')} onPress={() => router.replace('/(tabs)/inbox' as never)} /></Card></Screen>;

  const statusTone = issue.status === 'closed' ? 'teal' : issue.priority === 'immediate' ? 'red' : 'amber';
  const departmentKey = ({ production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' } as const)[issue.responsibleDepartment];
  const priorityKey = ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[issue.priority];
  const title = issue.type === '4m' && issue.category ? `${t(language, 'fourM')} · ${categoryName(language, issue.category, true)}` : t(language, 'meeting');

  async function applyAction(action: Exclude<IssueAction, 'reported'>, message = '') {
    setWorking(true); setFeedback('');
    try { await updateIssue(issue!.id, action, message); setComment(''); }
    catch { setFeedback(t(language, 'statusActionRequired')); }
    finally { setWorking(false); }
  }

  async function share() {
    try {
      const result = await shareIssue(issue!, language);
      setFeedback(result === 'copied' ? t(language, 'shareCopied') : result === 'manual' ? t(language, 'shareIssue') : '');
    } catch { setFeedback(''); }
  }

  return <Screen>
    <Eyebrow>{issue.workshop} · {t(language, issue.targetShift ?? issue.shift)}</Eyebrow>
    <Title subtitle={`${t(language, 'reportedBy')}: ${issue.operator}`}>{title}</Title>
    <Card style={s.issueCard}>
      <Row><StatusBadge label={t(language, issue.status)} tone={statusTone} /><StatusBadge label={t(language, priorityKey)} tone={issue.priority === 'immediate' ? 'red' : 'amber'} /></Row>
      <Text style={s.impact}>{issue.note}</Text>
      {issue.photoUri ? <Image source={{ uri: issue.photoUri }} style={s.photo} resizeMode="cover" /> : null}
      <View style={s.metaBlock}>
        <Text style={s.meta}>{t(language, 'responsibleDepartment')}: {t(language, departmentKey)}</Text>
        {issue.responsiblePerson ? <Text style={s.owner}>{t(language, 'responsiblePerson')}: {issue.responsiblePerson}</Text> : null}
        <Text style={s.meta}>{new Date(issue.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => void share()} style={s.shareButton}><Text style={s.shareLabel}>{t(language, 'shareIssue')}</Text></Pressable>
    </Card>
    {actionsFor(issue.status).length ? <Card style={s.actionCard}>
      <Text style={s.section}>{t(language, 'statusAction')}</Text>
      {actionsFor(issue.status).map(item => <PrimaryButton key={item.action} label={t(language, item.label)} secondary={item.tone === 'secondary'} disabled={working} onPress={() => void applyAction(item.action, item.action === 'closed' ? t(language, 'actionClosed') : '')} />)}
    </Card> : null}
    {issue.status !== 'closed' ? <Card style={s.actionCard}>
      <Text style={s.section}>{t(language, 'addUpdate')}</Text>
      <TextInput value={comment} onChangeText={setComment} placeholder={t(language, 'updatePlaceholder')} multiline textAlignVertical="top" style={s.input} placeholderTextColor="#98A5AA" />
      <PrimaryButton label={working ? '…' : t(language, 'addUpdate')} secondary onPress={() => comment.trim() && void applyAction('comment', comment)} disabled={working || !comment.trim()} />
    </Card> : null}
    {feedback ? <Text style={s.feedback}>{feedback}</Text> : null}
    <Card style={s.historyCard}>
      <Text style={s.section}>{t(language, 'issueHistory')}</Text>
      {[...issue.updates].reverse().map(item => <View key={item.id} style={s.timelineItem}>
        <View style={s.timelineDot} /><View style={s.timelineCopy}>
          <Row><Text style={s.action}>{t(language, actionLabelKey(item.action))}</Text><Text style={s.time}>{new Date(item.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text></Row>
          <Text style={s.meta}>{item.actor} · {new Date(item.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
          {item.message ? <Text style={s.message}>{item.message}</Text> : null}
        </View>
      </View>)}
      {!issue.updates.length ? <Text style={s.meta}>{t(language, 'empty')}</Text> : null}
    </Card>
  </Screen>;
}

const s = StyleSheet.create({
  issueCard: { borderColor: '#F0C7C0', gap: 14 }, actionCard: { gap: 10 }, historyCard: { gap: 12 }, section: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  impact: { color: colors.ink, fontSize: 17, lineHeight: 25, fontWeight: '700' }, photo: { width: '100%', height: 205, borderRadius: 13 }, metaBlock: { gap: 4 }, meta: { color: colors.muted, fontSize: 13, lineHeight: 19 }, owner: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  shareButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.blueSoft }, shareLabel: { color: colors.blue, fontSize: 14, fontWeight: '900' }, input: { minHeight: 85, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, lineHeight: 22, color: colors.ink, backgroundColor: '#FBFCFE' }, feedback: { color: colors.teal, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  timelineItem: { flexDirection: 'row', gap: 10, paddingBottom: 12 }, timelineDot: { width: 10, height: 10, borderRadius: 6, marginTop: 6, backgroundColor: colors.teal }, timelineCopy: { flex: 1, gap: 3 }, action: { color: colors.ink, fontSize: 14, fontWeight: '800' }, time: { color: colors.muted, fontSize: 11 }, message: { color: colors.ink, fontSize: 14, lineHeight: 21, marginTop: 3 }, body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
