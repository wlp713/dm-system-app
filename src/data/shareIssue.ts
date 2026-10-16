import { Platform, Share } from 'react-native';
import type { CheckRecord } from '../domain/model';
import { t, type TextKey } from '../domain/i18n';

export function issueShareText(record: CheckRecord, language: 'zh' | 'th') {
  const departmentKey = record.responsibleDepartment ? ({
    production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment',
    quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther',
  } as const)[record.responsibleDepartment] : 'deptOther';
  const status = record.issueStatus ? t(language, record.issueStatus as TextKey) : t(language, 'awaitingAck');
  const priority = record.priority ? t(language, ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[record.priority]) : '';
  return [
    `${t(language, 'shareTitle')} · ${record.id.slice(0, 8)}`,
    `${t(language, 'workshop')}: ${record.workshop} · ${t(language, record.shift)}`,
    `${t(language, 'status')}: ${status} · ${priority}`,
    `${t(language, 'responsibleDepartment')}: ${t(language, departmentKey)}`,
    `${t(language, 'responsiblePerson')}: ${record.responsiblePerson ?? t(language, 'noName')}`,
    `${t(language, 'issueImpact')}: ${record.note}`,
  ].join('\n');
}

export async function shareIssue(record: CheckRecord, language: 'zh' | 'th') {
  const text = issueShareText(record, language);
  if (Platform.OS !== 'web') {
    await Share.share({ message: text, title: t(language, 'shareTitle') });
    return 'shared' as const;
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title: t(language, 'shareTitle'), text });
    return 'shared' as const;
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return 'copied' as const;
  }
  return 'manual' as const;
}
