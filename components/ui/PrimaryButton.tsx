import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function PrimaryButton({ label, onPress, disabled, loading, className = '' }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`w-full min-h-12 items-center justify-center rounded-xl bg-ntu-primary px-4 py-3 ${isDisabled ? 'opacity-60' : ''} ${className}`}
      onPress={onPress}
      disabled={isDisabled}>
      {loading ? (
        <ActivityIndicator color={Theme.colors.text.inverse} />
      ) : (
        <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
