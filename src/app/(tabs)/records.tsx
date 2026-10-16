import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryName, t } from '../../domain/i18n';
import type { CheckRecord, CheckType } from '../../domain/model';
import type { TextKey } from '../../domain/i18n';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function RecordsScreen() {
  const { records, settings } = useDm();
  const l = settings.language;
  const [filter, setFilter] = useState<CheckType | 'all'>('all');
  const visible = records.filter(record => record.workshop === settings.workshop && (filter === 'all' || record.type === filter));
  const recordTitle = (type: CheckType, category?: CheckRecord['category']) => type === '4m' && category
    ? `${t(l, 'fourM')} · ${categoryName(l, category, true)}`
    : t(l, type === 'meeting' ? 'meeting' : type === 'legacyInterval' ? 'legacyInterval' : 'fourM');
  const statusLabel = (status: CheckRecord['status']) => t(l, status === 'held' ? 'meetingHeld' : status === 'missed' ? 'meetingMissed' : status);
  return <Screen><Eyebrow>{settings.workshop}</Eyebrow><Title subtitle={t(l, 'localOnly')}>{t(l, 'records')}</Title>
    <View style={s.filters}>{(['all', '4m', 'meeting'] as const).map(value => <Pressable key={value} onPress={() => setFilter(value)} style={[s.filter, filter === value && s.active]}><Text style={[s.filterText, filter === value && s.activeText]}>{t(l, value === 'all' ? 'all' : value === '4m' ? 'fourMOnly' : 'meetingOnly')}</Text></Pressable>)}</View>
    {visible.length ? visible.map(record => <Card key={record.id}><Row><View style={{ flex: 1 }}><Text style={s.title}>{recordTitle(record.type, record.category)}</Text><Text style={s.meta}>{record.operator} · {new Date(record.createdAt).toLocaleString()} · {record.type === '4m' ? t(l, record.targetShift ?? record.shift) : ''}</Text></View><StatusBadge label={statusLabel(record.status)} tone={record.status === 'normal' || record.status === 'held' ? 'teal' : 'red'} /></Row>{record.selection ? <Text style={s.meta}>{t(l, 'pointContent')}：{t(l, record.selection as TextKey)}</Text> : null}{record.photoUri ? <Image source={{ uri: record.photoUri }} style={s.photo} resizeMode="cover" /> : <Text style={s.meta}>{t(l, 'noPhoto')}</Text>}{record.note ? <Text style={s.note}>{record.note}</Text> : null}{record.revisionHistory?.length ? <View style={s.revisions}><Text style={s.revisionTitle}>{t(l, 'correctionRecord')} · {record.revisionHistory.length}</Text>{record.revisionHistory.map(revision => <View key={revision.id} style={s.revisionItem}><Text style={s.meta}>{revision.editor} · {new Date(revision.createdAt).toLocaleString()}</Text><Text style={s.meta}>{statusLabel(revision.status)}{revision.selection ? ` · ${t(l, revision.selection as TextKey)}` : ''}</Text>{revision.note ? <Text style={s.note}>{revision.note}</Text> : null}{revision.photoUri ? <Image source={{ uri: revision.photoUri }} style={s.revisionPhoto} resizeMode="cover" /> : null}</View>)}</View> : null}</Card>) : <Card><Text style={s.empty}>{t(l, 'empty')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  filters: { flexDirection: 'row', backgroundColor: '#E9EFF0', padding: 4, borderRadius: 13, gap: 4 }, filter: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, active: { backgroundColor: '#fff' },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, activeText: { color: colors.teal }, title: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 }, photo: { width: '100%', height: 170, borderRadius: 12 }, note: { color: colors.ink, fontSize: 13, lineHeight: 20 }, revisions: { borderTopWidth: 1, borderColor: colors.line, paddingTop: 12, gap: 8 }, revisionTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, revisionItem: { borderLeftWidth: 2, borderColor: colors.teal, paddingLeft: 9, gap: 2 }, revisionPhoto: { width: '100%', height: 120, borderRadius: 10 }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 25 },
});
