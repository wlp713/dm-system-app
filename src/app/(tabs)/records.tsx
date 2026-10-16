import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import { CheckType } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function RecordsScreen() {
  const { records, settings } = useDm();
  const l = settings.language;
  const [filter, setFilter] = useState<CheckType | 'all'>('all');
  const visible = records.filter(record => record.workshop === settings.workshop && (filter === 'all' || record.type === filter));
  return <Screen><Eyebrow>{settings.workshop}</Eyebrow><Title subtitle={t(l, 'localOnly')}>{t(l, 'records')}</Title>
    <View style={s.filters}>{(['all', '4m', 'twoHour'] as const).map(value => <Pressable key={value} onPress={() => setFilter(value)} style={[s.filter, filter === value && s.active]}><Text style={[s.filterText, filter === value && s.activeText]}>{t(l, value === 'all' ? 'all' : value === '4m' ? 'fourMOnly' : 'twoHourOnly')}</Text></Pressable>)}</View>
    {visible.length ? visible.map(record => <Card key={record.id}><Row><View style={{ flex: 1 }}><Text style={s.title}>{record.type === '4m' && record.category ? `${t(l, 'fourM')} · ${categoryName(l, record.category, true)}` : t(l, 'twoHour')}</Text><Text style={s.meta}>{record.operator} · {new Date(record.createdAt).toLocaleString()}</Text></View><StatusBadge label={t(l, record.status)} tone={record.status === 'normal' ? 'teal' : 'red'} /></Row>{record.photoUri ? <Image source={{ uri: record.photoUri }} style={s.photo} resizeMode="cover" /> : <Text style={s.meta}>{t(l, 'noPhoto')}</Text>}{record.note ? <Text style={s.note}>{record.note}</Text> : null}</Card>) : <Card><Text style={s.empty}>{t(l, 'empty')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  filters: { flexDirection: 'row', backgroundColor: '#E9EFF0', padding: 4, borderRadius: 13, gap: 4 }, filter: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, active: { backgroundColor: '#fff' },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, activeText: { color: colors.teal }, title: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 }, photo: { width: '100%', height: 170, borderRadius: 12 }, note: { color: colors.ink, fontSize: 13, lineHeight: 20 }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 25 },
});
