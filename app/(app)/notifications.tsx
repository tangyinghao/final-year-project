import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBadge } from '@/components/ui/IconBadge';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { useAuth } from '@/context/authContext';
import { subscribeToNotifications, markNotificationAsRead } from '@/services/notificationService';
import { AppNotification } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

const ICON_MAP: Record<string, { icon: string; tone: 'primary' | 'success' | 'warning' | 'info' }> = {
  event: { icon: 'calendar', tone: 'primary' },
  approval: { icon: 'checkmark-circle', tone: 'success' },
  report: { icon: 'alert-circle', tone: 'warning' },
  system: { icon: 'information-circle', tone: 'info' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNotifs = notifications.filter((n) => n.createdAt?.toDate() >= today);
  const earlierNotifs = notifications.filter((n) => !n.createdAt || n.createdAt.toDate() < today);

  const handleTap = async (item: AppNotification) => {
    if (!item.read) await markNotificationAsRead(item.id);
    if (item.data?.route) {
      router.push(item.data.route as any);
    }
  };

  const formatTime = (n: AppNotification) => {
    if (!n.createdAt) return '';
    const date = n.createdAt.toDate();
    const diffMs = Date.now() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return 'Yesterday';
  };

  const renderNotification = (item: AppNotification) => {
    const iconInfo = ICON_MAP[item.type] || ICON_MAP.system;
    return (
      <TouchableOpacity key={item.id} className={`flex-row items-center border-b border-border-default px-5 py-4 ${!item.read ? 'bg-blue-50/20' : 'bg-white'}`} onPress={() => handleTap(item)}>
        {item.type === 'message' ? (
          <Image source={DEFAULT_AVATAR} className="h-12 w-12 rounded-full bg-gray-200" />
        ) : (
          <IconBadge iconName={iconInfo.icon} tone={iconInfo.tone} className="h-12 w-12" size={24} />
        )}
        <View className="ml-4 flex-1 justify-center">
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
            <Text className="text-[12px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{formatTime(item)}</Text>
          </View>
          <Text className="mt-1 text-[14px] text-text-strong-secondary" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.body}</Text>
        </View>
        {!item.read ? <View className="ml-2 h-2.5 w-2.5 rounded-full bg-danger" /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Notifications" onLeftPress={() => router.back()} showBorder />

      {loading ? (
        <EmptyState iconName="notifications-outline" message="Loading notifications..." className="flex-1 justify-center" />
      ) : notifications.length === 0 ? (
        <EmptyState iconName="notifications-outline" message="No notifications yet." className="flex-1 justify-center" />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {todayNotifs.length > 0 ? (
            <View className="pt-4">
              <Text className="mb-2 px-5 text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Today</Text>
              {todayNotifs.map(renderNotification)}
            </View>
          ) : null}
          {earlierNotifs.length > 0 ? (
            <View className="pt-5">
              <Text className="mb-2 px-5 text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Earlier</Text>
              {earlierNotifs.map(renderNotification)}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
