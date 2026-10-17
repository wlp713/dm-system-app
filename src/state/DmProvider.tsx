import React, { createContext, useContext, useEffect, useState } from 'react';
import { localRepository } from '../data/repository';
import { CheckRecord, DEFAULT_SETTINGS, Issue, IssueAction, IssueStatus, nextIssueStatus, Settings } from '../domain/model';

interface DmContextValue {
  settings: Settings;
  records: CheckRecord[];
  issues: Issue[];
  loaded: boolean;
  updateSettings: (settings: Settings) => Promise<void>;
  addRecord: (record: CheckRecord) => Promise<void>;
  addSubmission: (records: CheckRecord[], issues?: Issue[]) => Promise<void>;
  updateIssue: (recordId: string, action: Exclude<IssueAction, 'reported'>, message?: string) => Promise<void>;
}

const DmContext = createContext<DmContextValue | null>(null);

export function DmProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<CheckRecord[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Promise.all([localRepository.getSettings(), localRepository.getRecords(), localRepository.getIssues()])
      .then(([savedSettings, savedRecords, savedIssues]) => { setSettings(savedSettings); setRecords(savedRecords); setIssues(savedIssues); })
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
  async function addSubmission(nextRecords: CheckRecord[], nextIssues: Issue[] = []) {
    await localRepository.saveSubmission(nextRecords, nextIssues);
    setRecords(current => [...nextRecords, ...current.filter(item => !nextRecords.some(next => next.id === item.id))]);
    setIssues(current => [...nextIssues, ...current.filter(item => !nextIssues.some(next => next.id === item.id))]);
  }
  async function updateIssue(recordId: string, action: Exclude<IssueAction, 'reported'>, message = '') {
    const issue = issues.find(item => item.id === recordId);
    if (!issue) throw new Error('issue-not-found');
    const currentStatus = issue.status;
    const nextStatus: IssueStatus | null = action === 'comment' ? currentStatus : nextIssueStatus(currentStatus, action);
    if (!nextStatus) throw new Error('invalid-issue-transition');
    const update = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      actor: settings.operator.trim(), action, message: message.trim(), createdAt: new Date().toISOString(),
    };
    const updated = { ...issue, status: nextStatus, updates: [...issue.updates, update] };
    await localRepository.saveIssue(updated);
    setIssues(current => current.map(item => item.id === recordId ? updated : item));
  }
  return <DmContext.Provider value={{ settings, records, issues, loaded, updateSettings, addRecord, addSubmission, updateIssue }}>{children}</DmContext.Provider>;
}

export function useDm() {
  const context = useContext(DmContext);
  if (!context) throw new Error('DmProvider missing');
  return context;
}
