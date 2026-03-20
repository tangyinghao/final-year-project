import React from 'react';
import { Text, View } from 'react-native';

type TabUnreadBadgeProps = {
  count: number;
};

export function TabUnreadBadge({ count }: TabUnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <View className="absolute -right-[10px] -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1">
      <Text className="text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</Text>
    </View>
  );
}
