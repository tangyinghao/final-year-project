import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { subscribeToNotifications, markNotificationAsRead } from '@/services/notificationService';
import { AppNotification } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

const ICON_MAP: Record<string, { icon: string; bg: string; color: string }> = {
  event: { icon: 'calendar', bg: '#EBF4FE', color: '#1B1C62' },
  approval: { icon: 'checkmark-circle', bg: '#E6F9EC', color: '#24A148' },
  report: { icon: 'alert-circle', bg: '#FFF3E0', color: '#F57C00' },
  system: { icon: 'information-circle', bg: '#F6F6F6', color: '#8E8E93' },
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
      <TouchableOpacity key={item.id}
        className={`flex-row px-5 py-4 items-center border-b border-[#E5E5EA] ${!item.read ? 'bg-blue-50/20' : 'bg-white'}`}
        onPress={() => handleTap(item)}>
        {item.type === 'message' ? (
          <Image source={DEFAULT_AVATAR} className="w-12 h-12 rounded-full bg-gray-200" />
        ) : (
          <View style={{ backgroundColor: iconInfo.bg }} className="w-12 h-12 rounded-full items-center justify-center">
            <Ionicons name={iconInfo.icon as any} size={24} color={iconInfo.color} />
          </View>
        )}
        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
            <Text className="text-[12px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{formatTime(item)}</Text>
          </View>
          <Text className="text-[14px] text-[#4A4A4A] mt-1" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.body}</Text>
        </View>
        {!item.read && <View className="w-2.5 h-2.5 rounded-full bg-[#D71440] ml-2" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Notifications</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="notifications-outline" size={48} color="#C7C7CC" />
          <Text className="text-[16px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>No notifications yet.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {todayNotifs.length > 0 && (
            <View className="pt-4">
              <Text className="px-5 text-[15px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Today</Text>
              {todayNotifs.map(renderNotification)}
            </View>
          )}
          {earlierNotifs.length > 0 && (
            <View className="pt-5">
              <Text className="px-5 text-[15px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Earlier</Text>
              {earlierNotifs.map(renderNotification)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
