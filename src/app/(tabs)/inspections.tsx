import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../domain/i18n';
import { today4m, meetingSlotKey, type MeetingPeriod } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { AppIcon, Card, Eyebrow, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function InspectionsScreen() {
  const { settings, records } = useDm();
  const l = settings.language;
  const count = today4m(records, settings);
  const periods: MeetingPeriod[] = ['morning', 'afternoon'];
  const meetings = periods.map(period => records.find(record => record.type === 'meeting' && record.workshop === settings.workshop && record.slotKey === meetingSlotKey(period)));

  return <Screen>
    <Eyebrow>{t(l, 'factoryOverview')} · {settings.workshop} · {t(l, settings.shift)}</Eyebrow>
    <Title subtitle={t(l, 'inspectionIntro')}>{t(l, 'inspectionHub')}</Title>
    <Text style={s.section}>{t(l, 'today')}</Text>

    <Pressable onPress={() => router.push('/inspection/four-m')} style={({ pressed }) => pressed && s.pressed}>
      <Card style={s.card}>
        <Row style={s.top}>
          <View style={[s.icon, { backgroundColor: colors.tealSoft }]}><Text style={[s.iconText, { color: colors.teal }]}>4M</Text></View>
          <View style={s.copy}><Text style={s.cardTitle}>{t(l, 'fourM')}</Text><Text style={s.cardDescription}>{t(l, 'fourMIntro')}</Text></View>
          <Text style={s.arrow}>›</Text>
        </Row>
        <View style={s.progressRow}><Text style={s.progressLabel}>{t(l, 'fourMProgress')}</Text><Text style={s.progressNumber}>{count}/4</Text></View>
        <View style={s.track}><View style={[s.fill, { width: `${count * 25}%` }]} /></View>
      </Card>
    </Pressable>

    <Pressable onPress={() => router.push('/inspection/meeting' as Href)} style={({ pressed }) => pressed && s.pressed}>
      <Card style={s.card}>
        <Row style={s.top}>
          <View style={[s.icon, { backgroundColor: colors.cyanSoft }]}><AppIcon name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }} glyph="◷" tintColor={colors.cyan} size={23} /></View>
          <View style={s.copy}><Text style={s.cardTitle}>{t(l, 'meeting')}</Text><Text style={s.cardDescription}>{t(l, 'meetingIntro')}</Text></View>
          <Text style={s.arrow}>›</Text>
        </Row>
        {periods.map((period, index) => {
          const record = meetings[index];
          const title = t(l, period === 'morning' ? 'meetingMorning' : 'meetingAfternoon');
          const time = period === 'morning' ? settings.morningMeetingTime : settings.afternoonMeetingTime;
          const label = !record ? t(l, 'notChecked') : t(l, record.status === 'held' ? 'meetingHeld' : 'meetingMissed');
          return <Row key={period} style={s.slotRow}><Text style={s.progressLabel}>{title} · {time}</Text><StatusBadge label={label} tone={record?.status === 'held' ? 'teal' : record?.status === 'missed' ? 'red' : 'amber'} /></Row>;
        })}
      </Card>
    </Pressable>

  </Screen>;
}

const s = StyleSheet.create({
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 3 },
  card: { padding: 16, borderRadius: 18, shadowColor: '#254E83', shadowOpacity: 0.04, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  top: { alignItems: 'center' }, icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, iconText: { fontSize: 17, fontWeight: '900' },
  copy: { flex: 1, gap: 5 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, cardDescription: { color: colors.muted, fontSize: 11, lineHeight: 16 }, arrow: { color: colors.muted, fontSize: 26, marginLeft: 3 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, progressLabel: { color: colors.muted, fontSize: 11 }, progressNumber: { color: colors.teal, fontSize: 13, fontWeight: '900' }, track: { height: 6, borderRadius: 9, backgroundColor: '#E8EEF7', overflow: 'hidden' }, fill: { height: '100%', borderRadius: 9, backgroundColor: colors.teal },
  slotRow: { paddingTop: 4 }, pressed: { opacity: 0.86 },
});
