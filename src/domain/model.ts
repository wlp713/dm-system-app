export type Language = 'zh' | 'th';
export type Category = 'person' | 'machine' | 'material' | 'method';
export type CheckStatus = 'normal' | 'abnormal';
export type MeetingStatus = 'held' | 'missed';
export type CheckType = '4m' | 'meeting' | 'legacyInterval';
export type DashboardPeriod = 'day' | 'week' | 'month';
export type RankingMetric = '4m' | 'meeting';
export type MeetingPeriod = 'morning' | 'afternoon';
export type MeetingTime = '10:00' | '10:30' | '14:00' | '15:00';
export type DepartmentKey = 'production' | 'logistics' | 'equipment' | 'quality' | 'engineering' | 'other';
export type IssuePriority = 'immediate' | 'beforeStart' | 'followUp';
export type IssueStatus = 'awaitingAck' | 'accepted' | 'processing' | 'waitingVerification' | 'crossShift' | 'closed';
export type IssueAction = 'reported' | 'accepted' | 'started' | 'submittedForReview' | 'returned' | 'handedOver' | 'closed' | 'comment';

export interface IssueUpdate {
  id: string;
  actor: string;
  action: IssueAction;
  message: string;
  createdAt: string;
}

export interface RecordRevision {
  id: string;
  editor: string;
  createdAt: string;
  status: CheckStatus | MeetingStatus;
  note: string;
  photoUri: string | null;
  selection?: string;
}

export interface Settings {
  workshop: string;
  operator: string;
  shift: 'day' | 'night';
  targetShift: 'day' | 'night';
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
  targetShift?: Settings['shift'];
  status: CheckStatus | MeetingStatus;
  note: string;
  photoUri: string | null;
  selection?: string;
  meetingPeriod?: MeetingPeriod;
  slotKey: string;
  createdAt: string;
  responsiblePerson?: string;
  responsibleDepartment?: DepartmentKey;
  priority?: IssuePriority;
  issueStatus?: IssueStatus;
  issueUpdates?: IssueUpdate[];
  revision?: number;
  revisionOf?: string;
  revisionHistory?: RecordRevision[];
}

export const CATEGORIES: Category[] = ['person', 'machine', 'material', 'method'];
export const WORKSHOPS = ['PRO1', 'PRO2', 'PRO3', 'PRO4', 'PRO5', 'PRO6', 'PE', 'IP', 'QA', 'PC'];
export const RESPONSIBLE_DEPARTMENTS: DepartmentKey[] = ['production', 'logistics', 'equipment', 'quality', 'engineering', 'other'];
const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
export const DEFAULT_SETTINGS: Settings = {
  workshop: 'PRO1', operator: '', shift: 'day', targetShift: 'day', language: deviceLocale.startsWith('th') ? 'th' : 'zh',
  morningMeetingTime: '10:30', afternoonMeetingTime: '14:00',
};

export function isIssueRecord(record: CheckRecord) {
  return record.status === 'abnormal' || record.status === 'missed';
}

export function isOpenIssue(record: CheckRecord) {
  return isIssueRecord(record) && record.issueStatus !== 'closed';
}

export function nextIssueStatus(status: IssueStatus, action: Exclude<IssueAction, 'reported' | 'comment'>): IssueStatus | null {
  const transitions: Record<IssueStatus, Partial<Record<Exclude<IssueAction, 'reported' | 'comment'>, IssueStatus>>> = {
    awaitingAck: { accepted: 'accepted', handedOver: 'crossShift' },
    accepted: { started: 'processing', submittedForReview: 'waitingVerification', handedOver: 'crossShift' },
    processing: { submittedForReview: 'waitingVerification', handedOver: 'crossShift' },
    waitingVerification: { returned: 'processing', closed: 'closed' },
    crossShift: { accepted: 'accepted', started: 'processing' },
    closed: {},
  };
  return transitions[status][action] ?? null;
}

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
