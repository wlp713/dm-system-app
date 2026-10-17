import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckRecord, DEFAULT_SETTINGS, Issue, Settings } from '../domain/model';

const SETTINGS_KEY = 'dm:settings:v1';
const RECORDS_KEY = 'dm:records:v2';
const LEGACY_RECORDS_KEY = 'dm:records:v1';
const ISSUES_KEY = 'dm:issues:v1';

export interface CheckRepository {
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  getRecords(): Promise<CheckRecord[]>;
  saveRecord(record: CheckRecord): Promise<void>;
  getIssues(): Promise<Issue[]>;
  saveSubmission(records: CheckRecord[], issues: Issue[]): Promise<void>;
  saveIssue(issue: Issue): Promise<void>;
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
  async getIssues() {
    const stored = await AsyncStorage.getItem(ISSUES_KEY);
    if (stored) return JSON.parse(stored) as Issue[];
    const legacyRecords = await this.getRecords();
    const migrated = legacyRecords.flatMap((record): Issue[] => {
      if (record.status !== 'abnormal' && record.status !== 'missed') return [];
      const updates = record.issueUpdates ?? [{
        id: `${record.id}-migrated`, actor: record.operator, action: 'reported' as const,
        message: record.note, createdAt: record.createdAt,
      }];
      return [{
        id: record.id, sourceRecordId: record.id, type: record.type === 'meeting' || record.type === 'legacyInterval' ? 'meeting' : '4m',
        category: record.category, workshop: record.workshop, operator: record.operator, shift: record.shift,
        targetShift: record.targetShift, title: record.type === 'meeting' || record.type === 'legacyInterval' ? 'meetingMissed' : 'abnormal',
        note: record.note, photoUri: record.photoUri, responsiblePerson: record.responsiblePerson,
        responsibleDepartment: record.responsibleDepartment ?? 'other', priority: record.priority ?? 'followUp',
        status: record.issueStatus ?? 'awaitingAck', updates, createdAt: record.createdAt, batchId: record.batchId,
      }];
    });
    await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(migrated));
    return migrated;
  },
  async saveSubmission(records, issues) {
    const currentRecords = await this.getRecords();
    const currentIssues = await this.getIssues();
    const nextRecords = [...records, ...currentRecords.filter(item => !records.some(next => next.id === item.id))];
    const nextIssues = [...issues, ...currentIssues.filter(item => !issues.some(next => next.id === item.id))];
    await AsyncStorage.multiSet([[RECORDS_KEY, JSON.stringify(nextRecords)], [ISSUES_KEY, JSON.stringify(nextIssues)]]);
  },
  async saveIssue(issue) {
    const issues = await this.getIssues();
    await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify([issue, ...issues.filter(item => item.id !== issue.id)]));
  },
};
