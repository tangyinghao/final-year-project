import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type DangerOutlineButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DangerOutlineButton({ label, onPress, disabled, className = '' }: DangerOutlineButtonProps) {
  return (
    <TouchableOpacity
      className={`w-full min-h-12 items-center justify-center rounded-xl border border-danger bg-white px-4 py-3 ${disabled ? 'opacity-60' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}>
      <Text className="text-[16px] font-bold text-danger" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
