export type Language = 'zh' | 'th';
export type Category = 'person' | 'machine' | 'material' | 'method';
export type CheckStatus = 'normal' | 'abnormal';
export type MeetingStatus = 'held' | 'missed';
export type CheckType = '4m' | 'meeting' | 'legacyInterval';
export type DashboardPeriod = 'day' | 'week' | 'month';
export type RankingMetric = '4m' | 'meeting';
export type MeetingPeriod = 'morning' | 'afternoon';
export type MeetingTime = '10:00' | '10:30' | '14:00' | '15:00';

export interface Settings {
  workshop: string;
  operator: string;
  shift: 'day' | 'night';
  language: Language;
  morningMeetingTime: Extract<MeetingTime, '10:00' | '10:30'>;
  afternoonMeetingTime: Extract<MeetingTime, '14:00' | '15:00'>;
}

export interface CheckRecord {
  id: string;
  type: CheckType;
  category?: Category;
  workshop: string;
  operator: string;
  shift: Settings['shift'];
  status: CheckStatus | MeetingStatus;
  note: string;
  photoUri: string | null;
  selection?: string;
  meetingPeriod?: MeetingPeriod;
  slotKey: string;
  createdAt: string;
}

export const CATEGORIES: Category[] = ['person', 'machine', 'material', 'method'];
export const WORKSHOPS = ['PRO1', 'PRO2', 'PRO3', 'PRO4', 'PRO5', 'PRO6', 'PE', 'IP', 'QA', 'PC'];
export const DEFAULT_SETTINGS: Settings = {
  workshop: 'PRO1', operator: '', shift: 'day', language: 'zh',
  morningMeetingTime: '10:30', afternoonMeetingTime: '14:00',
};

export const CATEGORY_OPTION_KEYS: Record<Category, string[]> = {
  person: ['present', 'leave', 'absent', 'late'],
  machine: ['equipmentReady', 'maintenanceDue', 'equipmentStopped'],
  material: ['materialKitted', 'materialShortage', 'wrongMaterial'],
  method: ['standardReady', 'fixtureReady', 'methodDeviation'],
};

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function meetingSlotKey(period: MeetingPeriod, date = new Date()) {
  return `${dateKey(date)}-${period}`;
}

export function meetingTime(settings: Settings, period: MeetingPeriod) {
  return period === 'morning' ? settings.morningMeetingTime : settings.afternoonMeetingTime;
}

export function periodStart(date: Date, period: DashboardPeriod) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (period === 'week') {
    const weekday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - weekday);
  } else if (period === 'month') {
    start.setDate(1);
  }
  return start;
}

export function periodEnd(date: Date, period: DashboardPeriod) {
  const end = periodStart(date, period);
  if (period === 'week') end.setDate(end.getDate() + 6);
  if (period === 'month') end.setMonth(end.getMonth() + 1, 0);
  return end;
}

export function formatPeriod(date: Date, period: DashboardPeriod) {
  const start = periodStart(date, period);
  const end = periodEnd(date, period);
  if (period === 'day') return dateKey(date);
  if (period === 'month') return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  return `${dateKey(start)} – ${dateKey(end)}`;
}

export function today4m(records: CheckRecord[], settings: Settings) {
  const prefix = `${dateKey()}-${settings.shift}`;
  return CATEGORIES.filter(category => records.some(record => record.type === '4m' && record.category === category && record.workshop === settings.workshop && record.slotKey === prefix)).length;
}
