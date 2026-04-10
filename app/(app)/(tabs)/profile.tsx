import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { FootprintPromoCard } from '@/components/profile/FootprintPromoCard';
import { ProfileSummaryRow } from '@/components/profile/ProfileSummaryRow';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { DangerOutlineButton } from '@/components/ui/DangerOutlineButton';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  { icon: 'help-circle-outline', title: 'Help & Support', route: '/profile/help' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const roleBadge = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Profile" className="pb-6" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileSummaryRow
          name={user?.displayName || 'User'}
          role={roleBadge}
          avatar={user?.profilePhoto}
          onPress={() => router.push('/profile/edit' as any)}
        />

        <FootprintPromoCard title="My Footprint Map" subtitle="Campus Explorer" onPress={() => router.push('/profile/footprint' as any)} />

        <View className="px-4">
          {MENU_ITEMS.map((item, index) => (
            <SettingsRow
              key={item.title}
              iconName={item.icon}
              title={item.title}
              onPress={() => router.push(item.route as any)}
              showDivider={true}
            />
          ))}
          {/* Push Notifications toggle not supported in Expo Go
          <SettingsRow
            iconName="notifications"
            title="Push Notifications"
            rightSlot={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotifications}
                disabled={toggling}
                trackColor={{ false: Theme.colors.border.default, true: Theme.colors.brand.primary }}
                thumbColor={Theme.colors.text.inverse}
              />
            }
            showDivider={true}
          />
          */}
          <SettingsRow iconName="information-circle-outline" title="About MSCircle" value="Version 1.0.0" />
        </View>

        <View className="mb-8 mt-10 px-6">
          <DangerOutlineButton label="Log Out" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
