import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AvatarStack } from '@/components/ui/AvatarStack';

type EventListCardProps = {
  title: string;
  description: string;
  timeLabel: string;
  attendees: { id: string; uri?: string | null }[];
  onPress: () => void;
};

export function EventListCard({ title, description, timeLabel, attendees, onPress }: EventListCardProps) {
  return (
    <TouchableOpacity className="mx-4 mb-4 rounded-xl border border-border-default bg-white p-4 shadow-sm" onPress={onPress}>
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="mr-2 flex-1 text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {title}
        </Text>
      </View>
      <Text className="mb-3 text-[14px] leading-5 text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
        {description}
      </Text>
      <View className="mt-1 flex-row items-end justify-between">
        <Text className="text-[13px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          {timeLabel}
        </Text>
        <AvatarStack items={attendees} />
      </View>
    </TouchableOpacity>
  );
}
