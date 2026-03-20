import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type HeaderActionButtonProps = {
  iconName?: string;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function HeaderActionButton({ iconName, label, onPress, disabled, className = '' }: HeaderActionButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} className={`min-h-10 min-w-10 items-center justify-center ${className}`}>
      {label ? (
        <Text className={`text-[16px] ${disabled ? 'text-gray-400' : 'text-ntu-primary'} ${disabled ? '' : 'font-bold'}`} style={{ fontFamily: disabled ? 'PlusJakartaSans-Regular' : 'PlusJakartaSans-Bold' }}>
          {label}
        </Text>
      ) : (
        <Ionicons name={(iconName || 'chevron-back') as any} size={28} color={disabled ? Theme.colors.icon.disabled : Theme.colors.icon.primary} />
      )}
    </TouchableOpacity>
  );
}
