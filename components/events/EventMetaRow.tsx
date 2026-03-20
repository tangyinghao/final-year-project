import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type EventMetaRowProps = {
  iconName: string;
  label: string;
};

export function EventMetaRow({ iconName, label }: EventMetaRowProps) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="w-8 items-center">
        <Ionicons name={iconName as any} size={20} color={Theme.colors.icon.muted} />
      </View>
      <Text className="ml-2 text-[15px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
        {label}
      </Text>
    </View>
  );
}
