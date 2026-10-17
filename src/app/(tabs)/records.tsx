import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import type { CheckRecord, CheckType } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

type RecordGroup = { id: string; records: CheckRecord[] };

export default function RecordsScreen() {
  const { records, issues, settings } = useDm();
  const language = settings.language;
  const [filter, setFilter] = useState<CheckType | 'all'>('all');
  const visible = records.filter(record => (settings.role === 'admin' || record.workshop === settings.workshop) && (filter === 'all' || record.type === filter));
  const groups = useMemo(() => {
    const grouped = new Map<string, RecordGroup>();
    visible.forEach(record => {
      const key = record.batchId ?? record.id;
      const group = grouped.get(key) ?? { id: key, records: [] };
      group.records.push(record);
      grouped.set(key, group);
    });
    return [...grouped.values()];
  }, [visible]);
  const statusTone = (status: CheckRecord['status']) => status === 'normal' || status === 'notApplicable' || status === 'held' ? 'teal' : 'red';
  const statusLabel = (status: CheckRecord['status']) => t(language, status === 'held' ? 'meetingHeld' : status === 'missed' ? 'meetingMissed' : status);

  return <Screen>
    <Eyebrow>{settings.role === 'admin' ? t(language, 'factoryName') : settings.workshop}</Eyebrow>
    <Title subtitle={t(language, 'localOnly')}>{t(language, 'records')}</Title>
    <View style={s.filters}>{(['all', '4m', 'meeting'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[s.filter, filter === value && s.active]}><Text style={[s.filterText, filter === value && s.activeText]}>{t(language, value === 'all' ? 'all' : value === '4m' ? 'fourMOnly' : 'meetingOnly')}</Text></Pressable>)}</View>

    {groups.length ? groups.map(group => {
      const entry = group.records[0];
      const isFourM = entry.type === '4m';
      const photo = group.records.find(record => record.photoUri)?.photoUri;
      const groupIssues = issues.filter(issue => group.records.some(record => record.id === issue.sourceRecordId));
      return <Card key={group.id} style={s.card}>
        <Row><View style={s.heading}><Text style={s.cardTitle}>{t(language, isFourM ? 'fourM' : entry.type === 'meeting' ? 'meeting' : 'legacyInterval')}</Text><Text style={s.meta}>{entry.workshop} · {entry.operator} · {new Date(entry.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'zh-CN')}</Text><Text style={s.meta}>{t(language, entry.targetShift ?? entry.shift)}</Text></View>
          {group.records.length === 1 ? <StatusBadge label={statusLabel(entry.status)} tone={statusTone(entry.status)} /> : <StatusBadge label={`${group.records.filter(record => record.status === 'normal' || record.status === 'notApplicable').length}/${group.records.length}`} tone="teal" />}</Row>

        {isFourM ? <View style={s.itemList}>{group.records.map(record => record.category ? <View key={record.id} style={s.itemRow}>
          <Row><Text style={s.itemTitle}>{categoryName(language, record.category, true)}</Text><StatusBadge label={statusLabel(record.status)} tone={statusTone(record.status)} /></Row>
          {record.status === 'abnormal' && record.note ? <Text style={s.note}>{record.note}</Text> : null}
          {record.revisionHistory?.length ? <Text style={s.meta}>{t(language, 'correctionRecord')} · {record.revisionHistory.length}</Text> : null}
        </View> : null)}</View> : <>
          {entry.type === 'meeting' ? <>
            {entry.actualMeetingTime ? <Text style={s.meta}>{t(language, 'meetingActualTime')}: {entry.actualMeetingTime}</Text> : null}
            {entry.meetingSummary || entry.note ? <Text style={s.note}>{entry.meetingSummary ?? entry.note}</Text> : null}
            {entry.nextReviewAt ? <Text style={s.meta}>{t(language, 'reopenAt')}: {entry.nextReviewAt}</Text> : null}
            {entry.linkedIssueIds?.length ? <View style={s.linkedIssues}>{entry.linkedIssueIds.map(id => {
              const issue = issues.find(item => item.id === id);
              return issue ? <Pressable key={id} onPress={() => router.push({ pathname: '/issue', params: { id } } as never)} style={s.issueLink}><Text style={s.issueLinkText}>{issue.note}　›</Text></Pressable> : null;
            })}</View> : null}
          </> : entry.note ? <Text style={s.note}>{entry.note}</Text> : null}
        </>}

        {photo ? <Image source={{ uri: photo }} style={s.photo} resizeMode="cover" /> : <Text style={s.meta}>{t(language, 'noPhoto')}</Text>}
        {groupIssues.map(issue => <Pressable key={issue.id} onPress={() => router.push({ pathname: '/issue', params: { id: issue.id } } as never)} style={s.issueLink}><Text style={s.issueLinkText}>{t(language, 'issueTitle')} · {t(language, issue.status)}　›</Text></Pressable>)}
      </Card>;
    }) : <Card><Text style={s.empty}>{t(language, 'empty')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  filters: { flexDirection: 'row', backgroundColor: '#E9EFF0', padding: 4, borderRadius: 13, gap: 4 }, filter: { flex: 1, paddingVertical: 10, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, active: { backgroundColor: '#fff' }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, activeText: { color: colors.teal },
  card: { padding: 15, gap: 11 }, heading: { flex: 1, gap: 3 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 11, lineHeight: 16 }, itemList: { gap: 8 }, itemRow: { gap: 5, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#F7FAFE', borderRadius: 11 }, itemTitle: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: '800' }, note: { color: colors.ink, fontSize: 13, lineHeight: 19 }, photo: { width: '100%', height: 170, borderRadius: 12 }, linkedIssues: { gap: 6 }, issueLink: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 10, backgroundColor: colors.blueSoft, borderRadius: 9 }, issueLinkText: { color: colors.blue, fontSize: 12, fontWeight: '800' }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 25 },
});
