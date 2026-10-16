import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../../domain/i18n';
import { WORKSHOPS } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PrimaryButton, Screen, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function SettingsScreen() {
  const { settings, updateSettings } = useDm();
  const [name, setName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const currentName = name ?? settings.operator;
  const l = settings.language;
  async function update(key: 'workshop' | 'shift' | 'language', value: string) {
    await updateSettings({ ...settings, operator: currentName.trim(), [key]: value });
    setSaved(true);
  }
  async function saveName() { await updateSettings({ ...settings, operator: currentName.trim() }); setName(null); setSaved(true); }
  return <Screen><Eyebrow>{t(l, 'app')}</Eyebrow><Title subtitle={t(l, 'localOnly')}>{t(l, 'settings')}</Title>
    <Card><Text style={s.label}>{t(l, 'profile')}</Text><TextInput value={currentName} onChangeText={value => { setName(value); setSaved(false); }} placeholder={t(l, 'namePlaceholder')} placeholderTextColor="#98A5AA" style={s.input} /><PrimaryButton label={saved ? t(l, 'saved') : t(l, 'saveProfile')} onPress={saveName} /></Card>
    <Card><Text style={s.label}>{t(l, 'workshop')}</Text><View style={s.grid}>{WORKSHOPS.map(workshop => <Pressable key={workshop} onPress={() => update('workshop', workshop)} style={[s.choice, settings.workshop === workshop && s.selected]}><Text style={[s.choiceText, settings.workshop === workshop && s.selectedText]}>{workshop}</Text></Pressable>)}</View></Card>
    <Card><Text style={s.label}>{t(l, 'shift')}</Text><View style={s.grid}>{(['day', 'night'] as const).map(shift => <Pressable key={shift} onPress={() => update('shift', shift)} style={[s.choice, settings.shift === shift && s.selected]}><Text style={[s.choiceText, settings.shift === shift && s.selectedText]}>{t(l, shift)}</Text></Pressable>)}</View></Card>
    <Card><Text style={s.label}>{t(l, 'language')}</Text><View style={s.grid}><Pressable onPress={() => update('language', 'zh')} style={[s.choice, l === 'zh' && s.selected]}><Text style={[s.choiceText, l === 'zh' && s.selectedText]}>中文</Text></Pressable><Pressable onPress={() => update('language', 'th')} style={[s.choice, l === 'th' && s.selected]}><Text style={[s.choiceText, l === 'th' && s.selectedText]}>ไทย</Text></Pressable></View></Card>
  </Screen>;
}

const s = StyleSheet.create({
  label: { color: colors.ink, fontSize: 16, fontWeight: '800' }, input: { borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: colors.ink, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, choice: { borderWidth: 1, borderColor: colors.line, borderRadius: 11, minWidth: 74, paddingHorizontal: 14, paddingVertical: 11, alignItems: 'center', backgroundColor: '#F8FBFB' },
  selected: { borderColor: colors.teal, backgroundColor: colors.tealSoft }, choiceText: { color: colors.muted, fontWeight: '800', fontSize: 13 }, selectedText: { color: colors.teal },
});
