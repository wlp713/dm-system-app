import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import type { CheckRecord, IssueAction } from '../../domain/model';
import { isIssueRecord, isOpenIssue } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PrimaryButton, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

function quickAction(record: CheckRecord): Exclude<IssueAction, 'reported' | 'comment'> | null {
  switch (record.issueStatus) {
    case 'awaitingAck': case 'crossShift': return 'accepted';
    case 'accepted': return 'started';
    case 'processing': return 'submittedForReview';
    case 'waitingVerification': return 'closed';
    default: return null;
  }
}

export default function InboxScreen() {
  const { records, settings, updateIssue } = useDm();
  const [showClosed, setShowClosed] = useState(false);
  const language = settings.language;
  const issues = useMemo(() => records.filter(isIssueRecord).sort((a, b) => {
    const order = { immediate: 0, beforeStart: 1, followUp: 2 } as const;
    return (order[a.priority ?? 'followUp'] - order[b.priority ?? 'followUp']) || b.createdAt.localeCompare(a.createdAt);
  }), [records]);
  const visible = issues.filter(issue => showClosed ? issue.issueStatus === 'closed' : isOpenIssue(issue));
  const waiting = issues.filter(isOpenIssue).length;

  return <Screen>
    <Eyebrow>{settings.workshop} · {t(language, settings.shift)}</Eyebrow>
    <Title subtitle={`${t(language, 'todoSubtitle')} · ${waiting}`}>{t(language, 'todos')}</Title>

    <View style={s.switcher}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: !showClosed }} onPress={() => setShowClosed(false)} style={[s.switchItem, !showClosed && s.switchActive]}><Text style={[s.switchText, !showClosed && s.switchTextActive]}>{t(language, 'openIssueCount')} · {waiting}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: showClosed }} onPress={() => setShowClosed(true)} style={[s.switchItem, showClosed && s.switchActive]}><Text style={[s.switchText, showClosed && s.switchTextActive]}>{t(language, 'closed')}</Text></Pressable>
    </View>

    {visible.length ? visible.map(record => {
      const priorityKey = record.priority ? ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[record.priority] : 'priorityBeforeStart';
      const departmentKey = record.responsibleDepartment ? ({ production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' } as const)[record.responsibleDepartment] : 'deptOther';
      const issueTitle = record.type === '4m' && record.category ? `${t(language, 'fourM')} · ${categoryName(language, record.category, true)}` : t(language, 'meeting');
      const nextAction = showClosed ? null : quickAction(record);
      return <Card key={record.id} style={[s.issueCard, record.priority === 'immediate' && s.urgentCard]}>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/issue', params: { id: record.id } } as never)} style={s.cardPress}>
          <Row><Text style={s.title}>{issueTitle}</Text><StatusBadge label={t(language, record.issueStatus ?? 'awaitingAck')} tone={record.issueStatus === 'closed' ? 'teal' : record.priority === 'immediate' ? 'red' : 'amber'} /></Row>
          <Text style={s.impact} numberOfLines={3}>{record.note}</Text>
          <Row><Text style={s.meta}>{record.workshop} · {t(language, record.targetShift ?? record.shift)}</Text><StatusBadge label={t(language, priorityKey)} tone={record.priority === 'immediate' ? 'red' : 'amber'} /></Row>
          <Text style={s.owner}>{t(language, departmentKey)} · {record.responsiblePerson || t(language, 'noName')}</Text>
          {record.photoUri ? <Image source={{ uri: record.photoUri }} style={s.photo} resizeMode="cover" /> : null}
          <Text style={s.time}>{new Date(record.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text>
        </Pressable>
        {nextAction ? <PrimaryButton label={t(language, nextAction === 'accepted' ? 'acceptIssue' : nextAction === 'started' ? 'startIssue' : nextAction === 'submittedForReview' ? 'sendToVerify' : 'verifyClose')} secondary={nextAction !== 'accepted'} onPress={() => void updateIssue(record.id, nextAction)} /> : null}
      </Card>;
    }) : <Card style={s.emptyCard}><Text style={s.emptyTitle}>{t(language, 'noOpenIssues')}</Text><Text style={s.emptyHint}>{showClosed ? t(language, 'empty') : t(language, 'issueTitle')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  switcher: { flexDirection: 'row', backgroundColor: '#E9EFF0', padding: 4, borderRadius: 13, gap: 4 }, switchItem: { flex: 1, minHeight: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }, switchActive: { backgroundColor: '#fff' }, switchText: { color: colors.muted, fontSize: 13, fontWeight: '800' }, switchTextActive: { color: colors.blue },
  issueCard: { padding: 14, gap: 10 }, urgentCard: { borderColor: '#E7B2A9', borderWidth: 2 }, cardPress: { gap: 10 }, title: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '900' }, impact: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '700' }, meta: { color: colors.muted, fontSize: 12 }, owner: { color: colors.ink, fontSize: 14, fontWeight: '800' }, photo: { width: '100%', height: 154, borderRadius: 12 }, time: { color: colors.muted, fontSize: 11 },
  emptyCard: { alignItems: 'center', paddingVertical: 34 }, emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', textAlign: 'center' }, emptyHint: { color: colors.muted, fontSize: 13, marginTop: 8, textAlign: 'center' },
});
