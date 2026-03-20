import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type RecipientChipProps = {
  label: string;
  onRemove: () => void;
};

export function RecipientChip({ label, onRemove }: RecipientChipProps) {
  return (
    <View className="mb-1 flex-row items-center rounded-full border border-border-info bg-surface-info px-3 py-1.5">
      <Text className="text-[14px] text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
        {label}
      </Text>
      <TouchableOpacity onPress={onRemove} className="ml-1 items-center justify-center">
        <Ionicons name="close-circle" size={16} color={Theme.colors.icon.primary} />
      </TouchableOpacity>
    </View>
  );
}
