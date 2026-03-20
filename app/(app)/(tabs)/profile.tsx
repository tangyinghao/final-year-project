import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { registerForPushNotificationsAsync, savePushToken, removePushToken } from '@/services/pushNotificationService';
import { updateUserProfile } from '@/services/userService';

const MENU_ITEMS = [
  { icon: 'notifications-outline', title: 'Notifications', route: '/notifications' },
  { icon: 'help-circle-outline', title: 'Help & Support', route: '/profile/help' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled ?? true);
  const [toggling, setToggling] = useState(false);

  // Register push token on mount if notifications are enabled
  useEffect(() => {
    if (!user?.uid || !notifEnabled) return;
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token && token !== user.expoPushToken) {
          await savePushToken(user.uid, token);
        }
      } catch (e) {
        // Silently fail in Expo Go / emulator where push is unsupported
        console.log('Push token registration skipped:', e);
      }
    })();
  }, [user?.uid, notifEnabled]);

  const handleToggleNotifications = async (value: boolean) => {
    if (!user?.uid || toggling) return;
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

  const handleLogout = async () => {
    await logout();
  };

  const roleBadge = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Student';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="items-center justify-center px-4 pb-6">
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-4 mb-4 active:bg-gray-50 border-b border-[#E5E5EA]"
          // @ts-ignore
          onPress={() => router.push('/profile/edit')}
        >
          <Image
            source={user?.profilePhoto ? { uri: user.profilePhoto } : DEFAULT_AVATAR}
            className="w-20 h-20 rounded-full bg-gray-200"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-[22px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              {user?.displayName || 'User'}
            </Text>
            <View className="bg-[#1B1C62] self-start px-3 py-1 rounded-full">
              <Text className="text-white text-[12px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {roleBadge}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
        </TouchableOpacity>

        {/* Footprint Map Card */}
        <TouchableOpacity
          className="mx-4 mb-4 bg-[#1B1C62] rounded-xl px-5 py-6 items-center shadow-lg shadow-blue-900/40 relative overflow-hidden"
          onPress={() => router.push('/profile/footprint' as any)}
        >
          <Ionicons name="map-outline" size={80} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: -10, top: -10 }} />
          <Ionicons name="location" size={24} color="#FFFFFF" style={{ marginBottom: 8 }} />
          <Text className="text-white text-[18px] font-bold text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>My Footprint Map</Text>
          <Text className="text-white/80 text-[13px] text-center mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Campus Explorer</Text>
        </TouchableOpacity>

        {/* Menu List */}
        <View className="px-4">
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                className="flex-row items-center py-4 active:bg-gray-50"
                // @ts-ignore
                onPress={() => router.push(item.route as any)}
              >
                <View className="w-8 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={24} color="#1B1C62" />
                </View>
                <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && (
                <View className="h-[1px] bg-[#E5E5EA] ml-11" />
              )}
            </React.Fragment>
          ))}
          <View className="h-[1px] bg-[#E5E5EA] ml-11" />

          <View className="flex-row items-center py-4 pr-2">
            <View className="w-8 items-center justify-center mr-3">
              <Ionicons name="notifications" size={24} color="#1B1C62" />
            </View>
            <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              Push Notifications
            </Text>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotifications}
              disabled={toggling}
              trackColor={{ false: '#E5E5EA', true: '#1B1C62' }}
              thumbColor="white"
            />
          </View>

          <View className="h-[1px] bg-[#E5E5EA] ml-11" />

          <View className="flex-row items-center py-4 active:bg-gray-50 pr-2">
            <View className="w-8 items-center justify-center mr-3">
              <Ionicons name="information-circle-outline" size={24} color="#1B1C62" />
            </View>
            <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              About MSCircle
            </Text>
            <Text className="text-[14px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-10 mb-8">
          <TouchableOpacity
            className="w-full py-3 items-center justify-center rounded-xl border border-[#D71440]"
            onPress={handleLogout}
          >
            <Text className="text-[#D71440] font-bold text-[16px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
