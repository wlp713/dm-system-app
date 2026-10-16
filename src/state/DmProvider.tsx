import React, { createContext, useContext, useEffect, useState } from 'react';
import { localRepository } from '../data/repository';
import { CheckRecord, DEFAULT_SETTINGS, Settings } from '../domain/model';

interface DmContextValue {
  settings: Settings;
  records: CheckRecord[];
  loaded: boolean;
  updateSettings: (settings: Settings) => Promise<void>;
  addRecord: (record: CheckRecord) => Promise<void>;
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
    setRecords(current => [record, ...current]);
  }
  return <DmContext.Provider value={{ settings, records, loaded, updateSettings, addRecord }}>{children}</DmContext.Provider>;
}

export function useDm() {
  const context = useContext(DmContext);
  if (!context) throw new Error('DmProvider missing');
  return context;
}
