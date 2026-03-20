import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type SettingsRowProps = {
  iconName: string;
  title: string;
  value?: string;
  onPress?: () => void;
  showDivider?: boolean;
  rightSlot?: React.ReactNode;
};

export function SettingsRow({ iconName, title, value, onPress, showDivider, rightSlot }: SettingsRowProps) {
  const content = (
    <View className="flex-row items-center py-4 pr-2">
      <View className="mr-3 w-8 items-center justify-center">
        <Ionicons name={iconName as any} size={24} color={Theme.colors.icon.primary} />
      </View>
      <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
        {title}
      </Text>
      {rightSlot || (value ? <Text className="text-[14px] text-text-muted">{value}</Text> : <Ionicons name="chevron-forward" size={20} color={Theme.colors.icon.muted} />)}
    </View>
  );

  return (
    <>
      {onPress ? (
        <TouchableOpacity className="active:bg-gray-50" onPress={onPress}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
      {showDivider ? <View className="ml-11 h-px bg-border-default" /> : null}
    </>
  );
}
