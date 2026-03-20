import { Stack } from 'expo-router';
import { UnreadProvider } from '@/context/unreadContext';

export default function AppLayout() {
  return (
    <UnreadProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UnreadProvider>
  );
}