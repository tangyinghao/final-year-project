import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';

type ProfileSummaryRowProps = {
  name: string;
  role: string;
  avatar?: string | null;
  onPress: () => void;
};

export function ProfileSummaryRow({ name, role, avatar, onPress }: ProfileSummaryRowProps) {
  return (
    <TouchableOpacity className="mb-4 flex-row items-center border-b border-border-default px-4 py-4 active:bg-gray-50" onPress={onPress}>
      <Avatar uri={avatar} size={80} />
      <View className="ml-4 flex-1 justify-center">
        <Text className="mb-1 text-[22px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {name}
        </Text>
        <View className="self-start rounded-full bg-ntu-primary px-3 py-1">
          <Text className="text-[12px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {role}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Theme.colors.icon.muted} />
    </TouchableOpacity>
  );
}
