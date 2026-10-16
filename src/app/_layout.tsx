import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DmProvider } from '../state/DmProvider';
import { colors } from '../ui/theme';

export default function RootLayout() {
  return <DmProvider><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="check/[category]" options={{ title: '4M 点检' }} /></Stack></DmProvider>;
}
