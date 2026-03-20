import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type SmartMatchBannerProps = {
  title: string;
  description: string;
  onPress: () => void;
};

export function SmartMatchBanner({ title, description, onPress }: SmartMatchBannerProps) {
  return (
    <TouchableOpacity className="m-5 flex-row items-center justify-between rounded-xl border border-border-info bg-surface-info p-4" onPress={onPress}>
      <View className="mr-3 flex-1">
        <View className="mb-1 flex-row items-center">
          <Ionicons name="sparkles" size={18} color={Theme.colors.icon.primary} />
          <Text className="ml-1 text-[15px] font-bold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {title}
          </Text>
        </View>
        <Text className="text-[13px] text-text-strong-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Theme.colors.icon.primary} />
    </TouchableOpacity>
  );
}
