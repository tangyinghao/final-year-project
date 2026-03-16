import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const TODAY_NOTIFICATIONS = [
  {
    id: 1,
    type: 'event',
    title: 'Event Reminder',
    message: 'Badminton Session starts in 2 hours.',
    time: '2h ago',
    unread: true,
    icon: 'calendar',
    iconBg: '#EBF4FE',
    iconColor: '#1B1C62',
  },
  {
    id: 2,
    type: 'message',
    title: 'Ivy Xu',
    message: 'Sent you a message.',
    time: '4h ago',
    unread: false,
    avatar: 'https://i.pravatar.cc/150?u=ivy',
  },
];

const EARLIER_NOTIFICATIONS = [
  {
    id: 3,
    type: 'approval',
    title: 'Listing Approved',
    message: 'Your Software Engineer listing is live.',
    time: 'Yesterday',
    unread: false,
    icon: 'checkmark-circle',
    iconBg: '#E6F9EC',
    iconColor: '#24A148',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderNotification = (item: any) => (
    <TouchableOpacity 
      key={item.id} 
      className={`flex-row px-5 py-4 items-center border-b border-[#E5E5EA] ${item.unread ? 'bg-blue-50/20' : 'bg-white'}`}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full bg-gray-200" />
      ) : (
        <View style={{ backgroundColor: item.iconBg }} className="w-12 h-12 rounded-full items-center justify-center">
          <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
        </View>
      )}

      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
          <Text className="text-[12px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.time}</Text>
        </View>
        <Text className="text-[14px] text-[#4A4A4A] mt-1" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          {item.message}
        </Text>
      </View>

      {item.unread && (
        <View className="w-2.5 h-2.5 rounded-full bg-[#D71440] ml-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Notifications
        </Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="settings-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View className="pt-4">
          <Text className="px-5 text-[15px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Today</Text>
          {TODAY_NOTIFICATIONS.map(renderNotification)}
        </View>

        {/* Earlier Section */}
        <View className="pt-5">
          <Text className="px-5 text-[15px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Earlier</Text>
          {EARLIER_NOTIFICATIONS.map(renderNotification)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
