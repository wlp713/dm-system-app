import { router, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { executorRankings, workshopRankings } from '../../domain/demo-rankings';
import { formatPeriod, type DashboardPeriod, type RankingMetric } from '../../domain/model';
import { t } from '../../domain/i18n';
import { useDm } from '../../state/DmProvider';
import { AppIcon, Card, Row, Screen } from '../../ui/components';
import { RankingRow } from '../../ui/RankingRow';
import { colors } from '../../ui/theme';

const periods: DashboardPeriod[] = ['day', 'week', 'month'];

export default function HomeScreen() {
  const { settings } = useDm();
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const [metric, setMetric] = useState<RankingMetric>('4m');
  const l = settings.language;
  const shops = workshopRankings(period, metric);
  const people = executorRankings(period, metric, l);
  const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
  const fourMRate = average(shops.map(row => metric === '4m' ? row.rate : row.otherRate));
  const meetingRate = average(shops.map(row => metric === 'meeting' ? row.rate : row.otherRate));

  return <Screen>
    <LinearGradient colors={['#0D5ED7', '#277FF1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
      <Row style={s.headerTop}>
        <View style={s.headerCopy}>
          <Text style={s.factory}>{t(l, 'factoryName')}</Text>
          <Text style={s.headerTitle}>{t(l, 'fullFactoryOverview')}</Text>
          <Text style={s.headerSubtitle}>{t(l, 'greeting')}</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={s.avatar} accessibilityLabel={t(l, 'settings')}>
          <Text style={s.avatarText}>{settings.operator.trim().charAt(0) || 'DM'}</Text>
        </Pressable>
      </Row>
    </LinearGradient>

    <Card style={s.summary}>
      <Row><Text style={s.summaryTitle}>{t(l, 'factoryOverview')}</Text><Text style={s.date}>{formatPeriod(new Date(), period)}</Text></Row>
      <View style={s.summaryMetrics}>
        <View style={s.summaryMetric}><Text style={s.summaryLabel}>{t(l, 'metric4m')}</Text><Text style={[s.summaryValue, { color: colors.blue }]}>{fourMRate}%</Text></View>
        <View style={s.summaryDivider} />
        <View style={s.summaryMetric}><Text style={s.summaryLabel}>{t(l, 'metricMeeting')}</Text><Text style={[s.summaryValue, { color: colors.teal }]}>{meetingRate}%</Text></View>
        <View style={s.periodSwitch}>
          {periods.map(value => <Pressable key={value} onPress={() => setPeriod(value)} style={[s.periodOption, period === value && s.periodActive]}><Text style={[s.periodText, period === value && s.periodTextActive]}>{t(l, `period${value[0].toUpperCase()}${value.slice(1)}` as 'periodDay' | 'periodWeek' | 'periodMonth')}</Text></Pressable>)}
        </View>
      </View>
    </Card>

    <View style={s.demoNotice}><Text style={s.demoDot}>●</Text><Text style={s.demoText}>{t(l, 'demoData')} · {t(l, 'demoDataHint')}</Text></View>

    <Row style={s.sectionRow}><Text style={s.section}>{t(l, 'quickStart')}</Text></Row>
    <View style={s.actions}>
      <Pressable onPress={() => router.push('/inspection/four-m')} style={({ pressed }) => [s.actionPressable, pressed && s.pressed]}>
        <LinearGradient colors={['#2F8BFA', '#1265E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionTile}>
          <AppIcon name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} glyph="camera" tintColor="#FFFFFF" size={23} />
          <Text style={s.actionTitle}>{t(l, 'fourM')}</Text>
          <Text style={s.actionSubtitle}>{t(l, 'person')} · {t(l, 'machine')} · {t(l, 'material')} · {t(l, 'method')}</Text>
        </LinearGradient>
      </Pressable>
      <Pressable onPress={() => router.push('/inspection/meeting' as Href)} style={({ pressed }) => [s.actionPressable, pressed && s.pressed]}>
        <LinearGradient colors={['#18C4BE', '#079FA7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionTile}>
          <AppIcon name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }} glyph="◷" tintColor="#FFFFFF" size={23} />
          <Text style={s.actionTitle}>{t(l, 'meeting')}</Text>
          <Text style={s.actionSubtitle}>{t(l, 'meetingMorning')} · {t(l, 'meetingAfternoon')}</Text>
        </LinearGradient>
      </Pressable>
    </View>

    <Card style={s.rankingCard}>
      <Row style={s.rankingHeader}><View><Text style={s.section}>{t(l, 'workshopRanking')}</Text><Text style={s.sectionHint}>{formatPeriod(new Date(), period)} · {t(l, 'completion')}</Text></View></Row>
      <View style={s.metricSwitch}>
        {(['4m', 'meeting'] as const).map(value => {
          const active = metric === value;
          return <Pressable key={value} onPress={() => setMetric(value)} style={[s.metricOption, active && (value === '4m' ? s.metricActiveBlue : s.metricActiveTeal)]}>
            <Text style={[s.metricOptionText, active && s.metricOptionTextActive]}>{t(l, value === '4m' ? 'metric4m' : 'metricMeeting')}</Text>
          </Pressable>;
        })}
      </View>
      {shops.map(row => <RankingRow key={row.id} row={row} metric={metric} language={l} />)}
    </Card>

    <Card style={s.rankingCard}>
      <Row style={s.rankingHeader}>
        <View><Text style={s.section}>{t(l, 'executorRanking')}</Text><Text style={s.sectionHint}>{t(l, metric === '4m' ? 'metric4m' : 'metricMeeting')} · {t(l, 'completion')}</Text></View>
        <Pressable onPress={() => router.push({ pathname: '/rankings', params: { period, metric } } as unknown as Href)}><Text style={s.link}>{t(l, 'viewAll')}　›</Text></Pressable>
      </Row>
      {people.slice(0, 5).map(row => <RankingRow key={row.id} row={row} metric={metric} language={l} />)}
    </Card>

    {!settings.operator ? <Pressable onPress={() => router.push('/settings')} style={s.namePrompt}><Text style={s.namePromptText}>{t(l, 'nameRequired')}　→</Text></Pressable> : null}
  </Screen>;
}

const s = StyleSheet.create({
  header: { marginHorizontal: -20, marginTop: -20, marginBottom: -34, paddingHorizontal: 21, paddingTop: 25, paddingBottom: 59, borderBottomLeftRadius: 27, borderBottomRightRadius: 27 },
  headerTop: { alignItems: 'center' }, headerCopy: { flex: 1, gap: 5 }, factory: { color: '#D9E9FF', fontSize: 12, fontWeight: '700' }, headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' }, headerSubtitle: { color: '#E2EEFF', fontSize: 12, marginTop: 3 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.blue, fontWeight: '900', fontSize: 14 },
  summary: { marginTop: 0, padding: 15, borderRadius: 19, shadowColor: '#254E83', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, summaryTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' }, date: { color: colors.muted, fontSize: 10 },
  summaryMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }, summaryMetric: { flex: 1, gap: 4 }, summaryLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' }, summaryValue: { fontSize: 21, fontWeight: '900' }, summaryDivider: { width: 1, height: 38, backgroundColor: colors.line },
  periodSwitch: { flexDirection: 'row', backgroundColor: '#F0F3F8', borderRadius: 10, padding: 3, gap: 2 }, periodOption: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 }, periodActive: { backgroundColor: '#FFFFFF' }, periodText: { color: colors.muted, fontSize: 11, fontWeight: '800' }, periodTextActive: { color: colors.blue },
  demoNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 11, borderRadius: 11, backgroundColor: '#FFF7E9' }, demoDot: { color: colors.amber, fontSize: 9 }, demoText: { flex: 1, color: '#956017', fontSize: 10, lineHeight: 15, fontWeight: '700' },
  sectionRow: { alignItems: 'center', marginTop: 1 }, section: { color: colors.ink, fontSize: 16, fontWeight: '900' }, sectionHint: { color: colors.muted, fontSize: 10, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10 }, actionPressable: { flex: 1, minWidth: 0, borderRadius: 16, overflow: 'hidden' }, actionTile: { minHeight: 110, padding: 13, justifyContent: 'space-between', alignItems: 'flex-start' }, pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] }, actionTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 }, actionSubtitle: { color: '#EAF4FF', fontSize: 9, fontWeight: '700' },
  rankingCard: { padding: 15, borderRadius: 18, gap: 3 }, rankingHeader: { alignItems: 'center', paddingBottom: 8 }, metricSwitch: { flexDirection: 'row', backgroundColor: '#F0F3F8', padding: 4, borderRadius: 11, gap: 5, marginBottom: 3 }, metricOption: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' }, metricActiveBlue: { backgroundColor: colors.blue }, metricActiveTeal: { backgroundColor: colors.teal }, metricOptionText: { color: colors.muted, fontSize: 11, fontWeight: '800' }, metricOptionTextActive: { color: '#FFFFFF' },
  link: { color: colors.teal, fontSize: 11, fontWeight: '800' }, namePrompt: { padding: 13, borderRadius: 12, backgroundColor: colors.amberSoft }, namePromptText: { color: colors.amber, fontWeight: '800', fontSize: 12 },
});
