import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { DangerOutlineButton } from '@/components/ui/DangerOutlineButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { FootprintPromoCard } from '@/components/profile/FootprintPromoCard';
import { ProfileSummaryRow } from '@/components/profile/ProfileSummaryRow';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { useAuth } from '@/context/authContext';
import { registerForPushNotificationsAsync, savePushToken, removePushToken } from '@/services/pushNotificationService';
import { updateUserProfile } from '@/services/userService';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { Theme } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: 'help-circle-outline', title: 'Help & Support', route: '/profile/help' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled ?? true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!FEATURE_FLAGS.notificationsEnabled) return;
    if (!user?.uid || !notifEnabled) return;
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token && token !== user.expoPushToken) {
          await savePushToken(user.uid, token);
        }
      } catch (e) {
        console.log('Push token registration skipped:', e);
      }
    })();
  }, [user?.uid, user?.expoPushToken, notifEnabled]);

  const handleToggleNotifications = async (value: boolean) => {
    if (!user?.uid || toggling) return;
    if (!FEATURE_FLAGS.notificationsEnabled) {
      Alert.alert('Not Available', 'Notifications are temporarily disabled in this app build.');
      return;
    }
    setToggling(true);
    try {
      if (value) {
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          Alert.alert('Permission Required', 'Push notifications require a development build. They are not supported in Expo Go.');
          setToggling(false);
          return;
        }
        await savePushToken(user.uid, token);
      } else {
        await removePushToken(user.uid);
      }
      await updateUserProfile(user.uid, { notificationsEnabled: value } as any);
      setNotifEnabled(value);
    } catch {
      Alert.alert('Not Available', 'Push notifications require a development build and are not supported in Expo Go.');
    } finally {
      setToggling(false);
    }
  };

  const roleBadge = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          {/* Push Notifications toggle commented out — not supported in Expo Go
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
