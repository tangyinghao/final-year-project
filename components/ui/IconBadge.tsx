import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type IconBadgeTone = 'primary' | 'danger' | 'success' | 'warning' | 'info';

type IconBadgeProps = {
  iconName: string;
  tone?: IconBadgeTone;
  size?: number;
  className?: string;
};

const toneMap = {
  primary: { bg: 'bg-surface-info', color: Theme.colors.brand.primary },
  danger: { bg: 'bg-red-50', color: Theme.colors.brand.danger },
  success: { bg: 'bg-surface-success', color: Theme.colors.status.success },
  warning: { bg: 'bg-surface-warning', color: Theme.colors.status.warning },
  info: { bg: 'bg-surface-muted', color: Theme.colors.icon.muted },
};

export function IconBadge({ iconName, tone = 'primary', size = 32, className = '' }: IconBadgeProps) {
  const toneStyle = toneMap[tone];

  return (
    <View className={`h-16 w-16 items-center justify-center rounded-full ${toneStyle.bg} ${className}`}>
      <Ionicons name={iconName as any} size={size} color={toneStyle.color} />
    </View>
  );
}
