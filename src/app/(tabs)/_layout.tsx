import { Tabs } from 'expo-router';
import { useDm } from '../../state/DmProvider';
import { isOpenIssue } from '../../domain/model';
import { t } from '../../domain/i18n';
import { colors } from '../../ui/theme';
import { AppIcon } from '../../ui/components';

const items = [
  { name: 'index', key: 'home', icon: { ios: 'house.fill', android: 'home', web: 'home' }, glyph: '⌂' },
  { name: 'inspections', key: 'inspectionHub', icon: { ios: 'checklist', android: 'fact_check', web: 'fact_check' }, glyph: '☷' },
  { name: 'inbox', key: 'todos', icon: { ios: 'tray.full.fill', android: 'inbox', web: 'inbox' }, glyph: '▣' },
  { name: 'records', key: 'records', icon: { ios: 'doc.text.fill', android: 'description', web: 'description' }, glyph: '▤' },
  { name: 'settings', key: 'settings', icon: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }, glyph: '●' },
] as const;

export default function TabsLayout() {
  const { settings, issues } = useDm();
  const openIssueCount = issues.filter(isOpenIssue).length;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: '#fff' }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    {items.map(item => <Tabs.Screen key={item.name} name={item.name} options={{ title: t(settings.language, item.key), tabBarBadge: item.name === 'inbox' && openIssueCount ? openIssueCount : undefined, tabBarBadgeStyle: { backgroundColor: colors.red, color: '#fff', fontSize: 10, minWidth: 18, height: 18 }, tabBarIcon: ({ color }) => <AppIcon name={item.icon} glyph={item.glyph} tintColor={color} size={22} /> }} />)}
  </Tabs>;
}
