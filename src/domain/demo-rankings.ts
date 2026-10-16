import type { DashboardPeriod, RankingMetric } from './model';
import { WORKSHOPS } from './model';

type Rates = { fourM: number[]; meeting: number[] };
export interface RankingRow {
  id: string;
  label: string;
  workshop?: string;
  completed: number;
  planned: number;
  rate: number;
  otherCompleted: number;
  otherPlanned: number;
  otherRate: number;
  rank: number;
}

const workshopRates: Record<DashboardPeriod, Rates> = {
  day: {
    fourM: [75, 100, 100, 75, 75, 50, 100, 75, 50, 75],
    meeting: [100, 50, 100, 100, 50, 0, 100, 50, 100, 50],
  },
  week: {
    fourM: [95, 90, 100, 85, 80, 75, 95, 85, 90, 80],
    meeting: [90, 80, 100, 90, 70, 65, 95, 80, 90, 75],
  },
  month: {
    fourM: [94, 92, 97, 88, 84, 79, 96, 87, 91, 82],
    meeting: [91, 82, 96, 92, 76, 70, 94, 84, 90, 78],
  },
};

const people = [
  { workshop: WORKSHOPS[2], fourM: [100, 95, 96], meeting: [100, 90, 96] },
  { workshop: WORKSHOPS[0], fourM: [75, 90, 92], meeting: [100, 90, 91] },
  { workshop: WORKSHOPS[6], fourM: [100, 95, 96], meeting: [100, 95, 94] },
  { workshop: WORKSHOPS[3], fourM: [75, 85, 88], meeting: [100, 90, 92] },
  { workshop: WORKSHOPS[1], fourM: [100, 90, 92], meeting: [50, 80, 82] },
  { workshop: WORKSHOPS[8], fourM: [50, 90, 91], meeting: [100, 90, 90] },
  { workshop: WORKSHOPS[4], fourM: [75, 80, 84], meeting: [50, 70, 76] },
  { workshop: WORKSHOPS[5], fourM: [50, 75, 79], meeting: [0, 65, 70] },
  { workshop: WORKSHOPS[7], fourM: [75, 85, 87], meeting: [50, 80, 84] },
  { workshop: WORKSHOPS[9], fourM: [75, 80, 82], meeting: [50, 75, 78] },
];

function plannedCount(period: DashboardPeriod, metric: RankingMetric) {
  const meetingsPerPeriod = { day: 2, week: 10, month: 40 }[period];
  const checksPerPeriod = { day: 4, week: 20, month: 80 }[period];
  return metric === 'meeting' ? meetingsPerPeriod : checksPerPeriod;
}

function countFor(rate: number, planned: number) {
  return Math.round(planned * rate / 100);
}

function toRows(items: { id: string; label: string; workshop?: string; fourMRate: number; meetingRate: number }[], period: DashboardPeriod, metric: RankingMetric): RankingRow[] {
  const planned = plannedCount(period, metric);
  const otherMetric: RankingMetric = metric === '4m' ? 'meeting' : '4m';
  const otherPlanned = plannedCount(period, otherMetric);
  return items.map(item => {
    const rate = metric === '4m' ? item.fourMRate : item.meetingRate;
    const otherRate = metric === '4m' ? item.meetingRate : item.fourMRate;
    return {
      id: item.id, label: item.label, workshop: item.workshop,
      completed: countFor(rate, planned), planned, rate,
      otherCompleted: countFor(otherRate, otherPlanned), otherPlanned, otherRate, rank: 0,
    };
  }).sort((a, b) => b.rate - a.rate || b.completed - a.completed || a.label.localeCompare(b.label))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function workshopRankings(period: DashboardPeriod, metric: RankingMetric) {
  const rates = workshopRates[period];
  return toRows(WORKSHOPS.map((workshop, index) => ({
    id: workshop,
    label: workshop,
    workshop,
    fourMRate: rates.fourM[index],
    meetingRate: rates.meeting[index],
  })), period, metric);
}

export function executorRankings(period: DashboardPeriod, metric: RankingMetric, language: 'zh' | 'th') {
  const periodIndex = { day: 0, week: 1, month: 2 }[period];
  return toRows(people.map((person, index) => ({
    id: `demo-person-${index + 1}`,
    label: language === 'zh' ? `示例人员 ${String(index + 1).padStart(2, '0')}` : `พนักงานตัวอย่าง ${String(index + 1).padStart(2, '0')}`,
    workshop: person.workshop,
    fourMRate: person.fourM[periodIndex],
    meetingRate: person.meeting[periodIndex],
  })), period, metric);
}
