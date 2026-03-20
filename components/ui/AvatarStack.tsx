import React from 'react';
import { Text, View } from 'react-native';
import { Avatar } from './Avatar';

type AvatarItem = {
  id: string;
  uri?: string | null;
};

type AvatarStackProps = {
  items: AvatarItem[];
  maxVisible?: number;
  size?: number;
};

export function AvatarStack({ items, maxVisible = 3, size = 24 }: AvatarStackProps) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <View className="flex-row items-center">
      {visible.map((item, index) => (
        <Avatar key={item.id} uri={item.uri} size={size} className={`border-2 border-white ${index > 0 ? '-ml-2' : ''}`} />
      ))}
      {overflow > 0 ? (
        <View className="min-w-[24px] -ml-2 h-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 px-1">
          <Text className="text-center text-[10px] font-bold text-text-muted">{`+${overflow}`}</Text>
        </View>
      ) : null}
    </View>
  );
}
