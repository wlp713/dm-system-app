import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../domain/i18n';
import { dateKey, today4m, twoHourSlot } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { AppIcon, Card, Row, Screen, StatusBadge } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function HomeScreen() {
  const { settings, records } = useDm();
  const l = settings.language;
  const slot = twoHourSlot();
  const scoped = records.filter(record => record.workshop === settings.workshop);
  const thisSlot = scoped.find(record => record.type === 'twoHour' && record.slotKey === slot.key);
  const count = today4m(records, settings);
  const currentShiftRecords = scoped.filter(record => record.slotKey === `${dateKey()}-${settings.shift}` || (record.type === 'twoHour' && record.shift === settings.shift && record.slotKey.startsWith(dateKey())));
  const recent = [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2);

  return <Screen>
    <LinearGradient colors={['#0D5ED7', '#277FF1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
      <Row style={s.headerTop}>
        <View style={s.headerCopy}>
          <Text style={s.headerTitle}>{t(l, 'dashboard')}</Text>
          <Text style={s.headerSubtitle}>{settings.workshop}　·　{t(l, settings.shift)}</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={s.avatar} accessibilityLabel={t(l, 'settings')}>
          <Text style={s.avatarText}>{settings.operator.trim().charAt(0) || 'DM'}</Text>
        </Pressable>
      </Row>
      <Text style={s.headerTagline}>{t(l, 'greeting')}</Text>
    </LinearGradient>

    <Card style={s.overview}>
      <Row><Text style={s.overviewTitle}>{t(l, 'overview')}</Text><Text style={s.date}>{dateKey()}</Text></Row>
      <View style={s.metrics}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>{t(l, 'fourM')}</Text>
          <Text style={[s.metricValue, { color: colors.teal }]}>{count}<Text style={s.metricDenom}>/4</Text></Text>
          <View style={s.track}><View style={[s.fill, { width: `${count * 25}%` }]} /></View>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metric}>
          <Text style={s.metricLabel}>{t(l, 'twoHour')}</Text>
          <Text style={[s.metricValue, { color: thisSlot ? '#0D9B79' : colors.blue }]}>{thisSlot ? t(l, 'checked') : t(l, 'notChecked')}</Text>
          <Text style={s.metricFoot}>{slot.label}</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metric}>
          <Text style={s.metricLabel}>{t(l, 'shiftRecords')}</Text>
          <Text style={[s.metricValue, { color: colors.ink }]}>{currentShiftRecords.length}</Text>
          <Text style={s.metricFoot}>{t(l, 'records')}</Text>
        </View>
      </View>
    </Card>

    {!settings.operator ? <Pressable onPress={() => router.push('/settings')} style={s.namePrompt}><Text style={s.namePromptText}>{t(l, 'nameRequired')}　→</Text></Pressable> : null}

    <Row style={s.sectionRow}><Text style={s.section}>{t(l, 'quickStart')}</Text><Text style={s.sectionHint}>{settings.workshop}</Text></Row>
    <View style={s.actions}>
      <Pressable onPress={() => router.push('/inspection/four-m')} style={({ pressed }) => [s.actionPressable, pressed && s.pressed]}>
        <LinearGradient colors={['#2F8BFA', '#1265E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionTile}>
          <AppIcon name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} glyph="camera" tintColor="#FFFFFF" size={26} />
          <Text style={s.actionTitle}>{t(l, 'fourM')}</Text>
          <Text style={s.actionSubtitle}>{t(l, 'fourMProgress')}　{count}/4</Text>
        </LinearGradient>
      </Pressable>
      <Pressable onPress={() => router.push('/inspection/two-hour')} style={({ pressed }) => [s.actionPressable, pressed && s.pressed]}>
        <LinearGradient colors={['#18C4BE', '#079FA7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionTile}>
          <AppIcon name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }} glyph="◷" tintColor="#FFFFFF" size={26} />
          <Text style={s.actionTitle}>{t(l, 'twoHour')}</Text>
          <Text style={s.actionSubtitle}>{slot.label}　›</Text>
        </LinearGradient>
      </Pressable>
    </View>

    <Row style={s.sectionRow}><Text style={s.section}>{t(l, 'latest')}</Text><Pressable onPress={() => router.push('/records')}><Text style={s.link}>{t(l, 'seeAll')}　›</Text></Pressable></Row>
    {recent.length ? recent.map(record => <Card key={record.id} style={s.recentCard}>
      <View style={s.recentIcon}><AppIcon name={{ ios: record.type === '4m' ? 'checkmark.circle.fill' : 'clock.fill', android: record.type === '4m' ? 'task_alt' : 'schedule', web: record.type === '4m' ? 'task_alt' : 'schedule' }} glyph={record.type === '4m' ? '✓' : '◷'} tintColor={colors.teal} size={21} /></View>
      <View style={s.recentText}><Text style={s.recordTitle}>{record.type === '4m' ? `${t(l, 'fourM')} · ${record.category ? t(l, `${record.category}Full`) : ''}` : t(l, 'twoHour')}</Text><Text style={s.recordMeta}>{record.operator} · {new Date(record.createdAt).toLocaleString()}</Text></View>
      <StatusBadge label={t(l, record.status)} tone={record.status === 'normal' ? 'teal' : 'red'} />
    </Card>) : <Card style={s.emptyCard}><Text style={s.recordMeta}>{t(l, 'empty')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  header: { marginHorizontal: -20, marginTop: -20, marginBottom: -34, paddingHorizontal: 21, paddingTop: 24, paddingBottom: 60, borderBottomLeftRadius: 27, borderBottomRightRadius: 27 },
  headerTop: { alignItems: 'center' }, headerCopy: { flex: 1, gap: 8 }, headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 0.2 }, headerSubtitle: { color: '#E2EEFF', fontSize: 13, fontWeight: '700' },
  headerTagline: { color: '#D9E9FF', fontSize: 12, marginTop: 17 }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.blue, fontWeight: '900', fontSize: 15 },
  overview: { marginTop: 0, padding: 17, borderRadius: 20, shadowColor: '#254E83', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, overviewTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, date: { color: colors.muted, fontSize: 11 },
  metrics: { flexDirection: 'row', alignItems: 'stretch', marginTop: 2 }, metric: { flex: 1, minWidth: 0, gap: 5 }, metricDivider: { width: 1, backgroundColor: colors.line, marginHorizontal: 10 }, metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', minHeight: 25 }, metricValue: { fontSize: 17, lineHeight: 23, fontWeight: '900' }, metricDenom: { color: colors.muted, fontSize: 12, fontWeight: '700' }, metricFoot: { color: colors.muted, fontSize: 9, lineHeight: 14 }, track: { height: 5, borderRadius: 9, backgroundColor: '#E8EEF7', overflow: 'hidden' }, fill: { height: '100%', borderRadius: 9, backgroundColor: colors.teal },
  namePrompt: { padding: 13, borderRadius: 12, backgroundColor: colors.amberSoft }, namePromptText: { color: colors.amber, fontWeight: '800', fontSize: 13 },
  sectionRow: { alignItems: 'center', marginTop: 1 }, section: { color: colors.ink, fontSize: 17, fontWeight: '900' }, sectionHint: { color: colors.muted, fontSize: 11 },
  actions: { flexDirection: 'row', gap: 11 }, actionPressable: { flex: 1, minWidth: 0, borderRadius: 17, overflow: 'hidden' }, actionTile: { minHeight: 142, padding: 15, justifyContent: 'space-between', alignItems: 'flex-start' }, pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] }, actionTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 }, actionSubtitle: { color: '#EAF4FF', fontSize: 10, fontWeight: '700' },
  link: { color: colors.teal, fontSize: 11, fontWeight: '800' }, recentCard: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 11 }, recentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' }, recentText: { flex: 1, gap: 4 }, recordTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, recordMeta: { color: colors.muted, fontSize: 10 }, emptyCard: { alignItems: 'center', paddingVertical: 19 },
});
