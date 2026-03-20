import React from 'react';
import { Text } from 'react-native';

type SectionLabelProps = {
  label: string;
  className?: string;
};

export function SectionLabel({ label, className = '' }: SectionLabelProps) {
  return (
    <Text className={`text-[14px] uppercase text-text-muted ${className}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
      {label}
    </Text>
  );
}
