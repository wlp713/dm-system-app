import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../domain/i18n';
import { today4m, twoHourSlot } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Card, Eyebrow, PrimaryButton, Row, Screen, StatusBadge, Title } from '../../ui/components';
import { colors } from '../../ui/theme';

export default function HomeScreen() {
  const { settings, records } = useDm();
  const l = settings.language;
  const count = today4m(records, settings);
  const slot = twoHourSlot();
  const thisSlot = records.find(record => record.type === 'twoHour' && record.workshop === settings.workshop && record.slotKey === slot.key);
  const latest = records.filter(record => record.workshop === settings.workshop).slice(0, 2);
  return <Screen>
    <Row><Eyebrow>{t(l, 'app').toUpperCase()}</Eyebrow><StatusBadge label={t(l, 'demo')} tone="amber" /></Row>
    <Title subtitle={`${settings.workshop} · ${t(l, settings.shift)} · ${settings.operator || t(l, 'noName')}`}>{t(l, 'greeting')}</Title>
    {!settings.operator ? <Pressable onPress={() => router.push('/settings')} style={s.namePrompt}><Text style={s.namePromptText}>{t(l, 'nameRequired')} →</Text></Pressable> : null}
    <Card style={s.hero}><Eyebrow>{t(l, 'today')}</Eyebrow><Text style={s.heroTitle}>{t(l, 'overview')}</Text><Row style={{ alignItems: 'flex-end' }}><View><Text style={s.heroNumber}>{count}<Text style={s.heroDenom}> / 4</Text></Text><Text style={s.heroLabel}>{t(l, 'fourMProgress')}</Text></View><View style={s.heroDivider} /><View><Text style={s.heroSlot}>{thisSlot ? '✓' : '—'}</Text><Text style={s.heroLabel}>{t(l, 'twoHourCurrent')}</Text></View></Row></Card>
    <Text style={s.section}>{t(l, 'today')}</Text>
    <Card><Row><View style={s.featureText}><Text style={s.featureIcon}>4M</Text><Text style={s.featureTitle}>{t(l, 'fourM')}</Text><Text style={s.featureDesc}>{t(l, 'fourMIntro')}</Text></View><StatusBadge label={`${count}/4`} tone={count === 4 ? 'teal' : 'amber'} /></Row><PrimaryButton label={t(l, 'start')} onPress={() => router.push('/four-m')} /></Card>
    <Card><Row><View style={s.featureText}><Text style={[s.featureIcon, { backgroundColor: colors.blueSoft, color: colors.blue }]}>2H</Text><Text style={s.featureTitle}>{t(l, 'twoHour')}</Text><Text style={s.featureDesc}>{slot.label} · {t(l, 'photoProof')}</Text></View><StatusBadge label={thisSlot ? t(l, 'checked') : t(l, 'notChecked')} tone={thisSlot ? 'teal' : 'amber'} /></Row><PrimaryButton label={t(l, 'go')} onPress={() => router.push('/two-hour')} secondary /></Card>
    <Row><Text style={s.section}>{t(l, 'latest')}</Text><Pressable onPress={() => router.push('/records')}><Text style={s.link}>{t(l, 'seeAll')} →</Text></Pressable></Row>
    {latest.length ? latest.map(record => <Card key={record.id}><Row><Text style={s.recordTitle}>{record.type === '4m' ? `${t(l, 'fourM')} · ${record.category ? t(l, `${record.category}Full`) : ''}` : t(l, 'twoHour')}</Text><StatusBadge label={t(l, record.status)} tone={record.status === 'normal' ? 'teal' : 'red'} /></Row><Text style={s.recordMeta}>{new Date(record.createdAt).toLocaleString()}</Text></Card>) : <Card><Text style={s.recordMeta}>{t(l, 'empty')}</Text></Card>}
  </Screen>;
}

const s = StyleSheet.create({
  namePrompt: { padding: 14, borderRadius: 12, backgroundColor: colors.amberSoft }, namePromptText: { color: colors.amber, fontWeight: '800' },
  hero: { backgroundColor: colors.ink, borderColor: colors.ink, padding: 23 }, heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroNumber: { color: '#fff', fontSize: 42, fontWeight: '900' }, heroDenom: { fontSize: 20, color: '#ADC9D0' }, heroLabel: { color: '#ADC9D0', fontSize: 12, marginTop: 3 },
  heroDivider: { width: 1, height: 55, backgroundColor: '#45606A' }, heroSlot: { color: '#fff', fontSize: 39, fontWeight: '900' },
  section: { color: colors.ink, fontSize: 17, fontWeight: '800' }, featureText: { flex: 1, gap: 5 },
  featureIcon: { alignSelf: 'flex-start', backgroundColor: colors.tealSoft, color: colors.teal, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7, fontWeight: '900' },
  featureTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' }, featureDesc: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  link: { color: colors.teal, fontSize: 12, fontWeight: '800' }, recordTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' }, recordMeta: { color: colors.muted, fontSize: 12 },
});
