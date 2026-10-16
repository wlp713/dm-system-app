import React, { createContext, useContext, useEffect, useState } from 'react';
import { localRepository } from '../data/repository';
import { CheckRecord, DEFAULT_SETTINGS, IssueAction, IssueStatus, nextIssueStatus, Settings } from '../domain/model';

interface DmContextValue {
  settings: Settings;
  records: CheckRecord[];
  loaded: boolean;
  updateSettings: (settings: Settings) => Promise<void>;
  addRecord: (record: CheckRecord) => Promise<void>;
  updateIssue: (recordId: string, action: Exclude<IssueAction, 'reported'>, message?: string) => Promise<void>;
}

const DmContext = createContext<DmContextValue | null>(null);

export function DmProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<CheckRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Promise.all([localRepository.getSettings(), localRepository.getRecords()])
      .then(([savedSettings, savedRecords]) => { setSettings(savedSettings); setRecords(savedRecords); })
      .finally(() => setLoaded(true));
  }, []);
  async function updateSettings(next: Settings) {
    await localRepository.saveSettings(next);
    setSettings(next);
  }
  async function addRecord(record: CheckRecord) {
    await localRepository.saveRecord(record);
    setRecords(current => [record, ...current.filter(item => item.id !== record.id)]);
  }
  async function updateIssue(recordId: string, action: Exclude<IssueAction, 'reported'>, message = '') {
    const record = records.find(item => item.id === recordId);
    if (!record || (record.status !== 'abnormal' && record.status !== 'missed')) throw new Error('issue-not-found');
    const currentStatus = record.issueStatus ?? 'awaitingAck';
    const nextStatus: IssueStatus | null = action === 'comment' ? currentStatus : nextIssueStatus(currentStatus, action);
    if (!nextStatus) throw new Error('invalid-issue-transition');
    const update = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      actor: settings.operator.trim(), action, message: message.trim(), createdAt: new Date().toISOString(),
    };
    const updated = { ...record, issueStatus: nextStatus, issueUpdates: [...(record.issueUpdates ?? []), update] };
    await localRepository.saveRecord(updated);
    setRecords(current => current.map(item => item.id === recordId ? updated : item));
  }
  return <DmContext.Provider value={{ settings, records, loaded, updateSettings, addRecord, updateIssue }}>{children}</DmContext.Provider>;
}

export function useDm() {
  const context = useContext(DmContext);
  if (!context) throw new Error('DmProvider missing');
  return context;
}
