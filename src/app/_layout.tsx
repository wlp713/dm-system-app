import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DmProvider, useDm } from '../state/DmProvider';
import { t } from '../domain/i18n';
import { colors } from '../ui/theme';

function RootNavigator() {
  const { settings } = useDm();
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="inspection/four-m" options={{ title: t(settings.language, 'fourM') }} /><Stack.Screen name="inspection/meeting" options={{ title: t(settings.language, 'meeting') }} /><Stack.Screen name="check/[category]" options={{ title: t(settings.language, 'fourM') }} /><Stack.Screen name="rankings" options={{ headerShown: false }} /></Stack></>;
}

export default function RootLayout() { return <DmProvider><RootNavigator /></DmProvider>; }
