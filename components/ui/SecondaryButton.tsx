import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function SecondaryButton({ label, onPress, disabled, className = '' }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      className={`w-full min-h-12 items-center justify-center rounded-xl border border-border-default bg-white px-4 py-3 ${disabled ? 'opacity-60' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}>
      <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
