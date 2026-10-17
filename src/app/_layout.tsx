import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { DmProvider, useDm } from '../state/DmProvider';
import { t } from '../domain/i18n';
import { colors } from '../ui/theme';

function RootNavigator() {
  const { settings, loaded } = useDm();
  if (!loaded) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.blue} /><Text style={{ color: colors.muted, marginTop: 12 }}>{t(settings.language, 'loading')}</Text></View>;
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="inspection/four-m" options={{ title: t(settings.language, 'fourM') }} /><Stack.Screen name="inspection/meeting" options={{ title: t(settings.language, 'meeting') }} /><Stack.Screen name="rankings" options={{ headerShown: false }} /><Stack.Screen name="issue" options={{ title: t(settings.language, 'issueTitle') }} /></Stack></>;
}

export default function RootLayout() { return <DmProvider><RootNavigator /></DmProvider>; }
