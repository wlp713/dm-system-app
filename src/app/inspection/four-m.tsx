import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import { CATEGORIES, dateKey } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function FourMScreen() {
  const { settings, records } = useDm();
  const l = settings.language;
  const slotKey = `${dateKey()}-${settings.shift}`;
  const done = CATEGORIES.filter(category => records.some(record => record.type === '4m' && record.category === category && record.workshop === settings.workshop && record.slotKey === slotKey)).length;
  return <Screen><Eyebrow>{settings.workshop} / {t(l, settings.shift)}</Eyebrow><Title subtitle={t(l, 'fourMIntro')}>{t(l, 'fourM')}</Title>
    <Card style={{ backgroundColor: colors.tealSoft, borderColor: colors.tealSoft }}><Row><Text style={s.progress}>{done} / 4</Text><Text style={s.progressLabel}>{t(l, 'fourMProgress')}</Text></Row><View style={s.progressTrack}><View style={[s.progressFill, { width: `${done * 25}%` }]} /></View></Card>
    {CATEGORIES.map((category, index) => {
      const record = records.find(item => item.type === '4m' && item.category === category && item.workshop === settings.workshop && item.slotKey === slotKey);
      return <Pressable key={category} onPress={() => router.push({ pathname: '/check/[category]', params: { category } })}><Card><Row><View style={[s.symbol, { backgroundColor: index % 2 ? colors.blueSoft : colors.tealSoft }]}><Text style={[s.symbolText, { color: index % 2 ? colors.blue : colors.teal }]}>{categoryName(l, category)}</Text></View><View style={s.middle}><Text style={s.category}>{categoryName(l, category, true)}</Text><Text style={s.hint}>{t(l, `${category}Hint`)}</Text></View><StatusBadge label={record ? t(l, 'checked') : t(l, 'notChecked')} tone={record ? 'teal' : 'amber'} /></Row><Row><Text style={s.bottom}>{record ? new Date(record.createdAt).toLocaleTimeString() : t(l, 'photoProof')}</Text><Text style={s.arrow}>→</Text></Row></Card></Pressable>;
    })}
  </Screen>;
}

const s = StyleSheet.create({
  progress: { fontSize: 26, color: colors.teal, fontWeight: '900' }, progressLabel: { color: colors.teal, fontSize: 13, fontWeight: '800' },
    progressTrack: { height: 7, borderRadius: 9, backgroundColor: '#D2E2FA' }, progressFill: { height: 7, borderRadius: 9, backgroundColor: colors.teal },
  symbol: { width: 54, height: 54, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, symbolText: { fontSize: 21, fontWeight: '900' },
  middle: { flex: 1, gap: 3 }, category: { fontSize: 17, color: colors.ink, fontWeight: '800' }, hint: { fontSize: 12, color: colors.muted },
  bottom: { color: colors.muted, fontSize: 12 }, arrow: { color: colors.teal, fontSize: 17, fontWeight: '800' },
});
