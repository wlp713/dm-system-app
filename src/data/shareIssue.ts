import { Platform, Share } from 'react-native';
import type { Issue } from '../domain/model';
import { t, type TextKey } from '../domain/i18n';

export function issueShareText(issue: Issue, language: 'zh' | 'th') {
  const departmentKey = ({
    production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment',
    quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther',
  } as const)[issue.responsibleDepartment];
  const status = t(language, issue.status as TextKey);
  const priority = t(language, ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[issue.priority]);
  return [
    `${t(language, 'shareTitle')} · ${issue.id.slice(0, 8)}`,
    `${t(language, 'workshop')}: ${issue.workshop} · ${t(language, issue.targetShift ?? issue.shift)}`,
    `${t(language, 'status')}: ${status} · ${priority}`,
    `${t(language, 'responsibleDepartment')}: ${t(language, departmentKey)}`,
    `${t(language, 'responsiblePerson')}: ${issue.responsiblePerson ?? t(language, 'noName')}`,
    `${t(language, 'issueImpact')}: ${issue.note}`,
  ].join('\n');
}

export async function shareIssue(issue: Issue, language: 'zh' | 'th') {
  const text = issueShareText(issue, language);
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
