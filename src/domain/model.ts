export type Language = 'zh' | 'th';
export type Category = 'person' | 'machine' | 'material' | 'method';
export type CheckStatus = 'normal' | 'abnormal';
export type CheckType = '4m' | 'twoHour';

export interface Settings {
  workshop: string;
  operator: string;
  shift: 'day' | 'night';
  language: Language;
}

export interface CheckRecord {
  id: string;
  type: CheckType;
  category?: Category;
  workshop: string;
  operator: string;
  shift: Settings['shift'];
  status: CheckStatus;
  note: string;
  photoUri: string | null;
  slotKey: string;
  createdAt: string;
}

export const CATEGORIES: Category[] = ['person', 'machine', 'material', 'method'];
export const WORKSHOPS = ['PRO1', 'PRO2', 'PRO3', 'PRO4', 'PRO5', 'PRO6', 'PE', 'IP', 'QA', 'PC'];
export const DEFAULT_SETTINGS: Settings = { workshop: 'PRO1', operator: '', shift: 'day', language: 'zh' };

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function twoHourSlot(date = new Date()) {
  const start = Math.floor(date.getHours() / 2) * 2;
  return {
    key: `${dateKey(date)}-${String(start).padStart(2, '0')}`,
    label: `${String(start).padStart(2, '0')}:00–${String((start + 2) % 24).padStart(2, '0')}:00`,
  };
}

export function today4m(records: CheckRecord[], settings: Settings) {
  const prefix = `${dateKey()}-${settings.shift}`;
  return CATEGORIES.filter(category => records.some(record => record.type === '4m' && record.category === category && record.workshop === settings.workshop && record.slotKey === prefix)).length;
}
