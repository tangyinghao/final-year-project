import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type ChipTone = 'default' | 'primary' | 'info' | 'saved';

type ChipProps = {
  label: string;
  selected?: boolean;
  tone?: ChipTone;
  onPress?: () => void;
  className?: string;
};

export function Chip({ label, selected, tone = 'default', onPress, className = '' }: ChipProps) {
  const styles = {
    default: selected ? 'bg-ntu-primary' : 'bg-surface-muted',
    primary: selected ? 'bg-ntu-primary' : 'border border-ntu-primary bg-white',
    info: 'border border-border-info bg-surface-info',
    saved: selected ? 'bg-accent-saved' : 'bg-surface-muted',
  }[tone];

  const textStyles = {
    default: selected ? 'text-white' : 'text-text-muted',
    primary: selected ? 'text-white' : 'text-ntu-primary',
    info: 'text-ntu-primary',
    saved: selected ? 'text-black' : 'text-text-muted',
  }[tone];

  return (
    <TouchableOpacity onPress={onPress} className={`rounded-full px-4 py-1.5 ${styles} ${className}`} disabled={!onPress}>
      <Text className={`text-[13px] ${selected ? 'font-bold' : ''} ${textStyles}`} style={{ fontFamily: selected ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
