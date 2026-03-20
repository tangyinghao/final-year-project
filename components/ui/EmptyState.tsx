import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type EmptyStateProps = {
  iconName: string;
  message: string;
  className?: string;
};

export function EmptyState({ iconName, message, className = '' }: EmptyStateProps) {
  return (
    <View className={`items-center justify-center pt-10 ${className}`}>
      <Ionicons name={iconName as any} size={48} color={Theme.colors.icon.disabled} />
      <Text className="mt-3 text-[16px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
        {message}
      </Text>
    </View>
  );
}
