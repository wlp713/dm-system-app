import { StyleSheet, Text, View } from 'react-native';
import type { Language, RankingMetric } from '../domain/model';
import type { RankingRow as RankingData } from '../domain/demo-rankings';
import { colors } from './theme';

export function RankingRow({ row, metric, language }: { row: RankingData; metric: RankingMetric; language: Language }) {
  const otherMetric = metric === '4m' ? 'meeting' : '4m';
  const otherLabel = otherMetric === '4m' ? '4M' : (language === 'zh' ? '检讨' : 'ประชุม');
  return <View style={s.row}>
    <View style={[s.rank, row.rank <= 3 && s.topRank]}><Text style={[s.rankText, row.rank <= 3 && s.topRankText]}>{row.rank}</Text></View>
    <View style={s.copy}>
      <View style={s.nameLine}><Text numberOfLines={1} style={s.name}>{row.label}</Text>{row.workshop && row.id !== row.workshop ? <Text style={s.workshop}>{row.workshop}</Text> : null}</View>
      <View style={s.track}><View style={[s.fill, { width: `${row.rate}%`, backgroundColor: metric === '4m' ? colors.blue : colors.teal }]} /></View>
      <Text style={s.meta}>{row.completed}/{row.planned}　·　{otherLabel} {row.otherCompleted}/{row.otherPlanned}</Text>
    </View>
    <Text style={[s.rate, { color: metric === '4m' ? colors.blue : colors.teal }]}>{row.rate}%</Text>
  </View>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  rank: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#EEF2F8', alignItems: 'center', justifyContent: 'center' },
  topRank: { backgroundColor: '#FFF0D8' }, rankText: { color: colors.muted, fontSize: 12, fontWeight: '900' }, topRankText: { color: colors.amber },
  copy: { flex: 1, gap: 5, minWidth: 0 }, nameLine: { flexDirection: 'row', alignItems: 'center', gap: 7 }, name: { flexShrink: 1, color: colors.ink, fontSize: 13, fontWeight: '800' }, workshop: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  track: { height: 5, borderRadius: 6, backgroundColor: '#E9EEF5', overflow: 'hidden' }, fill: { height: '100%', borderRadius: 6 }, meta: { color: colors.muted, fontSize: 10 }, rate: { minWidth: 43, textAlign: 'right', fontSize: 16, fontWeight: '900' },
});
