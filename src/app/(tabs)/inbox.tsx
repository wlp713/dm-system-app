import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import type { Issue, IssueAction } from '../../domain/model';
import { isOpenIssue } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, PrimaryButton, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

function quickAction(issue: Issue): Exclude<IssueAction, 'reported' | 'comment'> | null {
  switch (issue.status) {
    case 'awaitingAck': case 'crossShift': return 'accepted';
    case 'accepted': return 'started';
    case 'processing': return 'submittedForReview';
    case 'waitingVerification': return 'closed';
    default: return null;
  }
}

function issueTitle(issue: Issue, language: 'zh' | 'th') {
  return issue.type === '4m' && issue.category ? `${t(language, 'fourM')} · ${categoryName(language, issue.category, true)}` : t(language, issue.title === 'meetingMissed' ? 'meetingMissed' : 'meeting');
}

export default function InboxScreen() {
  const { issues, settings, updateIssue } = useDm();
  const [showClosed, setShowClosed] = useState(false);
  const language = settings.language;
  const orderedIssues = useMemo(() => [...issues].sort((a, b) => {
    const order = { immediate: 0, beforeStart: 1, followUp: 2 } as const;
    return (order[a.priority] - order[b.priority]) || b.createdAt.localeCompare(a.createdAt);
  }), [issues]);
  const visible = orderedIssues.filter(issue => showClosed ? issue.status === 'closed' : isOpenIssue(issue));
  const waiting = orderedIssues.filter(isOpenIssue).length;

  return <Screen>
    <Title subtitle={`${t(language, 'todoSubtitle')} · ${waiting}`}>{t(language, 'todos')}</Title>
    <Text style={s.queueHint}>{language === 'zh' ? '按责任部门接单，跨班问题保留在同一条处理记录中。' : 'งานอยู่ในคิวของแผนกรับผิดชอบ และปัญหาข้ามกะยังอยู่ในรายการเดิม'}</Text>
    <View style={s.switcher}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: !showClosed }} onPress={() => setShowClosed(false)} style={[s.switchItem, !showClosed && s.switchActive]}><Text style={[s.switchText, !showClosed && s.switchTextActive]}>{t(language, 'openIssueCount')} · {waiting}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: showClosed }} onPress={() => setShowClosed(true)} style={[s.switchItem, showClosed && s.switchActive]}><Text style={[s.switchText, showClosed && s.switchTextActive]}>{t(language, 'closed')}</Text></Pressable>
    </View>

    {visible.length ? visible.map(issue => {
      const priorityKey = ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[issue.priority];
      const departmentKey = ({ production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' } as const)[issue.responsibleDepartment];
      const nextAction = showClosed ? null : quickAction(issue);
      return <Card key={issue.id} style={[s.issueCard, issue.priority === 'immediate' && s.urgentCard]}>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/issue', params: { id: issue.id } } as never)} style={s.cardPress}>
          <Row><Text style={s.title}>{issueTitle(issue, language)}</Text><StatusBadge label={t(language, issue.status)} tone={issue.status === 'closed' ? 'teal' : issue.priority === 'immediate' ? 'red' : 'amber'} /></Row>
          <Text style={s.impact} numberOfLines={3}>{issue.note}</Text>
          <Row><Text style={s.meta}>{issue.workshop} · {t(language, issue.targetShift ?? issue.shift)}</Text><StatusBadge label={t(language, priorityKey)} tone={issue.priority === 'immediate' ? 'red' : 'amber'} /></Row>
          <Text style={s.owner}>{t(language, departmentKey)}{issue.responsiblePerson ? ` · ${issue.responsiblePerson}` : ''}</Text>
          {issue.photoUri ? <Image source={{ uri: issue.photoUri }} style={s.photo} resizeMode="cover" /> : null}
          <Text style={s.time}>{new Date(issue.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
        </Pressable>
        {nextAction ? <PrimaryButton label={t(language, nextAction === 'accepted' ? 'acceptIssue' : nextAction === 'started' ? 'startIssue' : nextAction === 'submittedForReview' ? 'sendToVerify' : 'verifyClose')} secondary onPress={() => void updateIssue(issue.id, nextAction)} /> : null}
      </Card>;
    }) : <Card style={s.emptyCard}><Text style={s.emptyTitle}>{showClosed ? t(language, 'empty') : t(language, 'noOpenIssues')}</Text><Text style={s.emptyHint}>{showClosed ? t(language, 'issueTitle') : t(language, 'defaultOwnerHint')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  queueHint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  switcher: { flexDirection: 'row', backgroundColor: '#E9EFF0', padding: 4, borderRadius: 13, gap: 4 }, switchItem: { flex: 1, minHeight: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }, switchActive: { backgroundColor: '#fff' }, switchText: { color: colors.muted, fontSize: 13, fontWeight: '800' }, switchTextActive: { color: colors.blue },
  issueCard: { padding: 14, gap: 10 }, urgentCard: { borderColor: '#E7B2A9', borderWidth: 2 }, cardPress: { gap: 10 }, title: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '900' }, impact: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '700' }, meta: { color: colors.muted, fontSize: 12 }, owner: { color: colors.ink, fontSize: 14, fontWeight: '800' }, photo: { width: '100%', height: 154, borderRadius: 12 }, time: { color: colors.muted, fontSize: 11 },
  emptyCard: { alignItems: 'center', paddingVertical: 34 }, emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', textAlign: 'center' }, emptyHint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
});
