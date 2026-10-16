import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { executorRankings } from '../domain/demo-rankings';
import { t } from '../domain/i18n';
import { formatPeriod, type DashboardPeriod, type RankingMetric } from '../domain/model';
import { useDm } from '../state/DmProvider';
import { Card, Row, Screen, Title } from '../ui/components';
import { RankingRow } from '../ui/RankingRow';
import { colors } from '../ui/theme';

const periods: DashboardPeriod[] = ['day', 'week', 'month'];

export default function RankingsScreen() {
  const { settings } = useDm();
  const params = useLocalSearchParams<{ period?: DashboardPeriod; metric?: RankingMetric }>();
  const [period, setPeriod] = useState<DashboardPeriod>(params.period || 'day');
  const [metric, setMetric] = useState<RankingMetric>(params.metric || '4m');
  const l = settings.language;
  const rows = executorRankings(period, metric, l);
  return <Screen>
    <Pressable onPress={() => router.back()} style={s.back}><Text style={s.backText}>‹　{t(l, 'home')}</Text></Pressable>
    <Title subtitle={`${formatPeriod(new Date(), period)} · ${t(l, metric === '4m' ? 'metric4m' : 'metricMeeting')} · ${t(l, 'demoDataHint')}`}>{t(l, 'executorRanking')}</Title>
    <Card style={s.card}>
      <Row style={s.controls}>
        <View style={s.periods}>{periods.map(value => <Pressable key={value} onPress={() => setPeriod(value)} style={[s.period, period === value && s.periodActive]}><Text style={[s.periodText, period === value && s.periodTextActive]}>{t(l, `period${value[0].toUpperCase()}${value.slice(1)}` as 'periodDay' | 'periodWeek' | 'periodMonth')}</Text></Pressable>)}</View>
      </Row>
      <View style={s.metrics}>{(['4m', 'meeting'] as const).map(value => <Pressable key={value} onPress={() => setMetric(value)} style={[s.metric, metric === value && (value === '4m' ? s.metricBlue : s.metricTeal)]}><Text style={[s.metricText, metric === value && s.metricTextActive]}>{t(l, value === '4m' ? 'metric4m' : 'metricMeeting')}</Text></Pressable>)}</View>
      {rows.map(row => <RankingRow key={row.id} row={row} metric={metric} language={l} />)}
    </Card>
    <View style={s.notice}><Text style={s.noticeText}>{t(l, 'demoDataHint')}</Text></View>
  </Screen>;
}

const s = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 3 }, backText: { color: colors.blue, fontSize: 14, fontWeight: '800' },
  card: { padding: 15, borderRadius: 18, gap: 3 }, controls: { marginBottom: 8 }, periods: { flexDirection: 'row', gap: 7 }, period: { paddingHorizontal: 17, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F0F3F8' }, periodActive: { backgroundColor: colors.blue }, periodText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, periodTextActive: { color: '#FFFFFF' },
  metrics: { flexDirection: 'row', gap: 6, backgroundColor: '#F0F3F8', padding: 4, borderRadius: 11, marginBottom: 5 }, metric: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 }, metricBlue: { backgroundColor: colors.blue }, metricTeal: { backgroundColor: colors.teal }, metricText: { color: colors.muted, fontSize: 11, fontWeight: '800' }, metricTextActive: { color: '#FFFFFF' },
  notice: { padding: 12, borderRadius: 12, backgroundColor: '#FFF7E9' }, noticeText: { color: '#956017', fontSize: 11, lineHeight: 16 },
});
