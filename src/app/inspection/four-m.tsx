import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryName, t, type TextKey } from '../../domain/i18n';
import { CATEGORIES, dateKey, type Category, type CheckRecord, type CheckStatus, type DepartmentKey, type Issue, type IssuePriority } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PhotoField, PrimaryButton, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

const prompts: Record<Category, TextKey> = { person: 'personCheck', machine: 'machineCheck', material: 'materialCheck', method: 'methodCheck' };
const ownerByCategory: Record<Category, DepartmentKey> = { person: 'production', machine: 'equipment', material: 'logistics', method: 'engineering' };
const departmentLabels: Record<DepartmentKey, TextKey> = { production: 'deptProduction', logistics: 'deptLogistics', equipment: 'deptEquipment', quality: 'deptQuality', engineering: 'deptEngineering', other: 'deptOther' };
const resultOptions: CheckStatus[] = ['normal', 'abnormal', 'notApplicable'];
const priorityOptions: IssuePriority[] = ['immediate', 'beforeStart', 'followUp'];
type ItemDraft = { status: CheckStatus | null; note: string; priority: IssuePriority };

function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export default function FourMScreen() {
  const { settings, records, issues, addSubmission } = useDm();
  const language = settings.language;
  const slotKey = `${dateKey()}-${settings.targetShift}`;
  const current = useMemo(() => CATEGORIES.map(category => records.find(record => record.type === '4m' && record.category === category && record.workshop === settings.workshop && record.slotKey === slotKey)), [records, settings.workshop, slotKey]);
  const priorBatch = current.find(Boolean)?.batchId;
  const [drafts, setDrafts] = useState<Record<Category, ItemDraft>>(() => Object.fromEntries(CATEGORIES.map(category => {
    const saved = current.find(item => item?.category === category);
    const priorIssue = saved ? issues.find(issue => issue.sourceRecordId === saved.id) : undefined;
    return [category, { status: saved?.status === 'normal' || saved?.status === 'abnormal' || saved?.status === 'notApplicable' ? saved.status : null, note: saved?.note ?? '', priority: priorIssue?.priority ?? 'beforeStart' }];
  })) as Record<Category, ItemDraft>);
  const [photoUri, setPhotoUri] = useState<string | null>(current.find(item => item?.photoUri)?.photoUri ?? null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const completed = Object.values(drafts).filter(item => item.status !== null).length;
  const existingOpenIssue = current.flatMap(record => record ? issues.filter(issue => issue.sourceRecordId === record.id && issue.status !== 'closed') : []);


  function updateDraft(category: Category, change: Partial<ItemDraft>) {
    setDrafts(value => ({ ...value, [category]: { ...value[category], ...change } }));
  }

  async function submit() {
    setError('');
    if (!settings.operator.trim()) { setError(t(language, 'nameRequired')); return; }
    if (completed !== CATEGORIES.length) { setError(t(language, 'selectResult')); return; }
    if (!photoUri) { setError(t(language, 'photoRequired')); return; }
    const abnormalItems = CATEGORIES.filter(category => drafts[category].status === 'abnormal');
    if (abnormalItems.some(category => !drafts[category].note.trim())) { setError(t(language, 'abnormalNote')); return; }
    if (existingOpenIssue.length) { setError(t(language, 'unresolvedTask')); return; }
    const unchanged = CATEGORIES.every(category => {
      const previous = current.find(item => item?.category === category);
      return Boolean(previous && previous.status === drafts[category].status && previous.note === (drafts[category].status === 'abnormal' ? drafts[category].note.trim() : '') && previous.photoUri === photoUri);
    });
    if (unchanged) { setError(t(language, 'noChanges')); return; }
    setSaving(true);
    try {
      const batchId = priorBatch ?? newId();
      const now = new Date().toISOString();
      const nextRecords: CheckRecord[] = CATEGORIES.map(category => {
        const previous = current.find(item => item?.category === category);
        const status = drafts[category].status!;
        const revisionHistory = previous ? [...(previous.revisionHistory ?? []), {
          id: newId(), editor: settings.operator.trim(), createdAt: now,
          status: previous.status, note: previous.note, photoUri: previous.photoUri, selection: previous.selection,
        }] : undefined;
        return {
          id: previous?.id ?? newId(), type: '4m', category, workshop: settings.workshop,
          operator: settings.operator.trim(), shift: settings.shift, targetShift: settings.targetShift,
          status, note: status === 'abnormal' ? drafts[category].note.trim() : '', photoUri,
          slotKey, batchId, createdAt: now, revision: (previous?.revision ?? 0) + (previous ? 1 : 0), revisionHistory,
        };
      });
      const nextIssues: Issue[] = abnormalItems.map(category => {
        const record = nextRecords.find(item => item.category === category)!;
        return {
          id: newId(), sourceRecordId: record.id, type: '4m', category, workshop: settings.workshop,
          operator: settings.operator.trim(), shift: settings.shift, targetShift: settings.targetShift,
          title: 'abnormal', note: drafts[category].note.trim(), photoUri,
          responsibleDepartment: ownerByCategory[category], priority: drafts[category].priority,
          status: 'awaitingAck', updates: [{ id: newId(), actor: settings.operator.trim(), action: 'reported', message: drafts[category].note.trim(), createdAt: now }], createdAt: now, batchId,
        };
      });
      await addSubmission(nextRecords, nextIssues);
      router.back();
    } catch { setError(t(language, 'saveError')); }
    finally { setSaving(false); }
  }

  return <Screen>
    <Eyebrow>{settings.workshop} · {t(language, settings.targetShift)} · {dateKey()}</Eyebrow>
    <Title subtitle={t(language, 'fourMIntro')}>{t(language, 'fourM')}</Title>

    <Card style={s.notice}>
      <Row><Text style={s.noticeTitle}>{t(language, 'fourMTemplateNotice')}</Text><StatusBadge label={language === 'zh' ? '演示模板' : 'ตัวอย่าง'} tone="amber" /></Row>
    </Card>

    <Card style={s.progressCard}>
      <Row><Text style={s.progressLabel}>{t(language, 'selectResult')}</Text><Text style={s.progressValue}>{completed} / 4</Text></Row>
      <View style={s.track}><View style={[s.trackFill, { width: `${completed * 25}%` }]} /></View>
    </Card>

    {CATEGORIES.map((category, index) => {
      const draft = drafts[category];
      const departmentKey = departmentLabels[ownerByCategory[category]];
      return <Card key={category} style={s.itemCard}>
        <Row style={s.itemHeading}><View style={[s.symbol, index % 2 ? s.symbolBlue : s.symbolTeal]}><Text style={[s.symbolText, index % 2 ? s.symbolTextBlue : s.symbolTextTeal]}>{categoryName(language, category)}</Text></View>
          <View style={s.itemCopy}><Text style={s.itemTitle}>{categoryName(language, category, true)}</Text><Text style={s.prompt}>{t(language, prompts[category])}</Text></View>
          {draft.status ? <StatusBadge label={t(language, draft.status)} tone={draft.status === 'normal' || draft.status === 'notApplicable' ? 'teal' : 'red'} /> : null}
        </Row>
        <View style={s.choiceRow}>{resultOptions.map(result => {
          const active = draft.status === result;
          return <Pressable key={result} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => updateDraft(category, { status: result })} style={[s.choice, active && (result === 'abnormal' ? s.choiceAbnormal : s.choiceActive)]}>
            <Text style={[s.choiceText, active && s.choiceTextActive]}>{t(language, result)}</Text>
          </Pressable>;
        })}</View>
        {draft.status === 'abnormal' ? <View style={s.abnormalBlock}>
          <Text style={s.queueHint}>{t(language, 'defaultOwnerHint')} · {t(language, departmentKey)}</Text>
          <TextInput value={draft.note} onChangeText={value => updateDraft(category, { note: value })} placeholder={t(language, 'issueImpactPlaceholder')} multiline textAlignVertical="top" style={s.noteInput} placeholderTextColor="#98A5AA" />
          <View style={s.priorityRow}>{priorityOptions.map(priority => {
            const key = ({ immediate: 'priorityImmediate', beforeStart: 'priorityBeforeStart', followUp: 'priorityFollowUp' } as const)[priority];
            const active = draft.priority === priority;
            return <Pressable key={priority} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => updateDraft(category, { priority })} style={[s.priority, active && (priority === 'immediate' ? s.priorityRed : s.priorityActive)]}><Text style={[s.priorityText, active && s.priorityTextActive]}>{t(language, key)}</Text></Pressable>;
          })}</View>
        </View> : null}
      </Card>;
    })}

    <Card style={s.photoCard}>
      <Text style={s.photoTitle}>{t(language, 'batchEvidence')} · *</Text>
      <PhotoField language={language} value={photoUri} onChange={setPhotoUri} hint={t(language, 'batchEvidenceHint')} />
    </Card>

    {existingOpenIssue.length ? <Card style={s.openIssueCard}>
      <Text style={s.queueHint}>{t(language, 'unresolvedTask')}</Text>
      <PrimaryButton label={t(language, 'viewIssue')} secondary onPress={() => router.push({ pathname: '/issue', params: { id: existingOpenIssue[0].id } } as never)} />
    </Card> : null}
    {error ? <Text style={s.error}>{error}</Text> : null}
    <PrimaryButton label={saving ? '…' : t(language, 'save')} onPress={() => void submit()} disabled={saving || existingOpenIssue.length > 0} />
  </Screen>;
}

const s = StyleSheet.create({
  notice: { backgroundColor: '#FFF8EA', borderColor: '#F1DFBF', padding: 13 }, noticeTitle: { flex: 1, color: '#805717', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  progressCard: { padding: 14, gap: 8 }, progressLabel: { color: colors.ink, fontSize: 13, fontWeight: '800' }, progressValue: { color: colors.blue, fontWeight: '900', fontSize: 15 }, track: { height: 7, borderRadius: 9, backgroundColor: '#E8EEF7', overflow: 'hidden' }, trackFill: { height: '100%', borderRadius: 9, backgroundColor: colors.blue },
  itemCard: { padding: 14, borderRadius: 17, gap: 12 }, itemHeading: { alignItems: 'flex-start' }, symbol: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, symbolTeal: { backgroundColor: colors.tealSoft }, symbolBlue: { backgroundColor: colors.blueSoft }, symbolText: { fontSize: 18, fontWeight: '900' }, symbolTextTeal: { color: colors.teal }, symbolTextBlue: { color: colors.blue }, itemCopy: { flex: 1, gap: 4 }, itemTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' }, prompt: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  choiceRow: { flexDirection: 'row', gap: 7 }, choice: { flex: 1, minHeight: 45, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FAFCFE' }, choiceActive: { borderColor: colors.teal, backgroundColor: colors.teal }, choiceAbnormal: { borderColor: colors.red, backgroundColor: colors.red }, choiceText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, choiceTextActive: { color: '#FFFFFF' },
  abnormalBlock: { gap: 9, borderTopWidth: 1, borderColor: colors.line, paddingTop: 11 }, queueHint: { color: colors.muted, fontSize: 12, lineHeight: 18 }, noteInput: { minHeight: 74, borderColor: colors.line, borderWidth: 1, borderRadius: 11, padding: 12, color: colors.ink, fontSize: 14, lineHeight: 20, backgroundColor: '#FBFCFE' }, priorityRow: { flexDirection: 'row', gap: 6 }, priority: { flex: 1, minHeight: 42, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFE' }, priorityActive: { borderColor: colors.blue, backgroundColor: colors.blue }, priorityRed: { borderColor: colors.red, backgroundColor: colors.red }, priorityText: { color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' }, priorityTextActive: { color: '#FFFFFF' },
  photoCard: { padding: 14 }, photoTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, openIssueCard: { borderColor: '#EDC6C0', backgroundColor: '#FFF9F8' }, error: { color: colors.red, fontSize: 13, fontWeight: '800', textAlign: 'center' },
});
