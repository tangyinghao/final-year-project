import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';

type ChatListItemProps = {
  name: string;
  avatar?: string | null;
  time: string;
  lastText: string;
  unreadCount: number;
  onPress: () => void;
};

export function ChatListItem({ name, avatar, time, lastText, unreadCount, onPress }: ChatListItemProps) {
  const isUnread = unreadCount > 0;

  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3 active:bg-gray-50" onPress={onPress}>
      <Avatar uri={avatar} size={52} />
      <View className="ml-4 flex-1 justify-center">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {name}
          </Text>
          <View className="flex-row items-center">
            <Text className={`text-[13px] ${isUnread ? 'text-ntu-primary' : 'text-text-muted'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              {time}
            </Text>
            {isUnread ? (
              <View className="ml-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-ntu-primary px-1.5">
                <Text className="text-[11px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <Text
          numberOfLines={1}
          className={`mr-2 text-[14px] ${isUnread ? 'font-semibold text-black' : 'text-text-muted'}`}
          style={{ fontFamily: isUnread ? 'PlusJakartaSans-SemiBold' : 'PlusJakartaSans-Regular' }}>
          {lastText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
