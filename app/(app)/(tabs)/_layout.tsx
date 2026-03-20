import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { TabUnreadBadge } from '@/components/navigation/TabUnreadBadge';
import { Theme } from '@/constants/theme';
import { useUnread } from '@/context/unreadContext';

export default function TabLayout() {
  const { totalUnread } = useUnread();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.icon.primary,
        tabBarInactiveTintColor: Theme.colors.icon.muted,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface.base,
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border.default,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans-Regular',
          fontSize: 12,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={24} color={color} />
              <TabUnreadBadge count={totalUnread} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="careers"
        options={{
          title: 'Careers',
          tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
