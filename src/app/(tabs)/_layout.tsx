import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useDm } from '../../state/DmProvider';
import { t } from '../../domain/i18n';
import { colors } from '../../ui/theme';

const items = [
  { name: 'index', key: 'home', symbol: '⌂' },
  { name: 'four-m', key: 'fourM', symbol: '4M' },
  { name: 'two-hour', key: 'twoHour', symbol: '2H' },
  { name: 'records', key: 'records', symbol: '▤' },
  { name: 'settings', key: 'settings', symbol: '●' },
] as const;

export default function TabsLayout() {
  const { settings } = useDm();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 66, paddingTop: 6, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: '#fff' }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' } }}>
    {items.map(item => <Tabs.Screen key={item.name} name={item.name} options={{ title: t(settings.language, item.key), tabBarIcon: ({ color }) => <Text style={{ color, fontSize: item.symbol.length === 2 ? 15 : 22, fontWeight: '900' }}>{item.symbol}</Text> }} />)}
  </Tabs>;
}
