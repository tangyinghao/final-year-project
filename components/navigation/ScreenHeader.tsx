import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Theme } from '@/constants/theme';
import { HeaderActionButton } from './HeaderActionButton';

type ScreenHeaderProps = {
  title: string;
  leftIconName?: string;
  onLeftPress?: () => void;
  leftLabel?: string;
  rightIconName?: string;
  onRightPress?: () => void;
  rightLabel?: string;
  rightDisabled?: boolean;
  rightLoading?: boolean;
  showBorder?: boolean;
  className?: string;
};

export function ScreenHeader({
  title,
  leftIconName,
  onLeftPress,
  leftLabel,
  rightIconName,
  onRightPress,
  rightLabel,
  rightDisabled,
  rightLoading,
  showBorder,
  className = '',
}: ScreenHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between bg-white px-4 py-3 ${showBorder ? 'border-b border-border-default' : ''} ${className}`}>
      <View className="min-w-10 items-start">
        {onLeftPress || leftLabel ? (
          <HeaderActionButton iconName={leftIconName} label={leftLabel} onPress={onLeftPress} className="-ml-2" />
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>
      <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
        {title}
      </Text>
      <View className="min-w-10 items-end">
        {rightLoading ? (
          <View className="h-10 w-10 items-center justify-center">
            <ActivityIndicator size="small" color={Theme.colors.brand.primary} />
          </View>
        ) : rightIconName || rightLabel ? (
          <HeaderActionButton iconName={rightIconName} label={rightLabel} onPress={onRightPress} disabled={rightDisabled} className="-mr-2" />
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>
    </View>
  );
}
