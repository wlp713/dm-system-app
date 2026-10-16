import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckRecord, DEFAULT_SETTINGS, Settings } from '../domain/model';

const SETTINGS_KEY = 'dm:settings:v1';
const RECORDS_KEY = 'dm:records:v2';
const LEGACY_RECORDS_KEY = 'dm:records:v1';

export interface CheckRepository {
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  getRecords(): Promise<CheckRecord[]>;
  saveRecord(record: CheckRecord): Promise<void>;
}

export const localRepository: CheckRepository = {
  async getSettings() {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  },
  async saveSettings(settings) { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); },
  async getRecords() {
    const current = await AsyncStorage.getItem(RECORDS_KEY);
    const legacy = current ? null : await AsyncStorage.getItem(LEGACY_RECORDS_KEY);
    if (!current && !legacy) return [];
    const records = (JSON.parse(current ?? legacy!) as Record<string, unknown>[]).map(raw => {
      const record = {
        ...raw,
        type: raw.type === 'twoHour' ? 'legacyInterval' : raw.type,
        targetShift: raw.targetShift ?? raw.shift,
      } as CheckRecord;
      if ((record.status === 'abnormal' || record.status === 'missed') && !record.issueStatus) {
        record.issueStatus = 'awaitingAck';
        record.priority = 'followUp';
        record.issueUpdates = [{
          id: `${record.id}-migrated`, actor: record.operator, action: 'reported',
          message: record.note, createdAt: record.createdAt,
        }];
      }
      return record;
    });
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return records;
  },
  async saveRecord(record) {
    const records = await this.getRecords();
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...records.filter(item => item.id !== record.id)]));
  },
};
