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
    if (current) return JSON.parse(current) as CheckRecord[];
    const legacy = await AsyncStorage.getItem(LEGACY_RECORDS_KEY);
    if (!legacy) return [];
    const records = (JSON.parse(legacy) as Record<string, unknown>[]).map(record => ({
      ...record,
      type: record.type === 'twoHour' ? 'legacyInterval' : record.type,
    })) as CheckRecord[];
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return records;
  },
  async saveRecord(record) {
    const records = await this.getRecords();
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...records]));
  },
};
