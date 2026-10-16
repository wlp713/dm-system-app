import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../domain/i18n';
import type { MeetingPeriod, MeetingTime } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, Row, Screen } from '../../ui/components';
import { CheckForm } from '../../ui/CheckForm';
import { colors } from '../../ui/theme';

export default function MeetingScreen() {
  const { settings, updateSettings } = useDm();
  const [period, setPeriod] = useState<MeetingPeriod>('morning');
  const l = settings.language;
  const meetingSlots: { period: MeetingPeriod; title: string; time: string }[] = [
    { period: 'morning', title: t(l, 'meetingMorning'), time: settings.morningMeetingTime },
    { period: 'afternoon', title: t(l, 'meetingAfternoon'), time: settings.afternoonMeetingTime },
  ];
  const timeOptions: MeetingTime[] = period === 'morning' ? ['10:00', '10:30'] : ['14:00', '15:00'];
  const selectedTime = period === 'morning' ? settings.morningMeetingTime : settings.afternoonMeetingTime;

  function setMeetingTime(value: MeetingTime) {
    if (period === 'morning' && (value === '10:00' || value === '10:30')) void updateSettings({ ...settings, morningMeetingTime: value });
    if (period === 'afternoon' && (value === '14:00' || value === '15:00')) void updateSettings({ ...settings, afternoonMeetingTime: value });
  }

  return <Screen>
    <Eyebrow>{settings.workshop} / {t(l, settings.shift)}</Eyebrow>
    <Text style={s.intro}>{t(l, 'meetingIntro')}</Text>

    <Card style={s.slotCard}>
      <Text style={s.label}>{t(l, 'currentSlot')}</Text>
      <View style={s.slotRow}>
        {meetingSlots.map(slot => <Pressable key={slot.period} onPress={() => setPeriod(slot.period)} style={[s.slot, period === slot.period && s.slotSelected]}>
          <Text style={[s.slotTitle, period === slot.period && s.slotTitleSelected]}>{slot.title}</Text>
          <Text style={[s.slotTime, period === slot.period && s.slotTitleSelected]}>{slot.time}</Text>
        </Pressable>)}
      </View>
      <Text style={s.label}>{period === 'morning' ? t(l, 'morningTime') : t(l, 'afternoonTime')}</Text>
      <Row style={s.timeChoices}>
        {timeOptions.map(time => {
          const selected = selectedTime === time;
          return <Pressable key={time} onPress={() => setMeetingTime(time)} style={[s.timeChoice, selected && s.timeChoiceSelected]}>
            <Text style={[s.timeText, selected && s.timeTextSelected]}>{time}</Text>
          </Pressable>;
        })}
      </Row>
      <Text style={s.scheduleHint}>{l === 'zh' ? '上午默认 10:30，下午默认 14:00，可按工厂实际会议时间调整。' : 'ค่าเริ่มต้นช่วงเช้า 10:30 และช่วงบ่าย 14:00 ปรับตามเวลาโรงงานได้'}</Text>
    </Card>

    <CheckForm key={period} type="meeting" meetingPeriod={period} />
  </Screen>;
}

const s = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 }, slotCard: { padding: 15, borderRadius: 18, gap: 10 }, label: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  slotRow: { flexDirection: 'row', gap: 8 }, slot: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: '#F8FAFD', paddingVertical: 12, alignItems: 'center', gap: 4 }, slotSelected: { borderColor: colors.blue, backgroundColor: colors.blue }, slotTitle: { color: colors.muted, fontSize: 12, fontWeight: '800' }, slotTime: { color: colors.ink, fontSize: 17, fontWeight: '900' }, slotTitleSelected: { color: '#FFFFFF' },
  timeChoices: { justifyContent: 'flex-start' }, timeChoice: { minWidth: 90, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFE', alignItems: 'center' }, timeChoiceSelected: { borderColor: colors.teal, backgroundColor: colors.tealSoft }, timeText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, timeTextSelected: { color: colors.teal }, scheduleHint: { color: colors.muted, fontSize: 10, lineHeight: 15 },
});
