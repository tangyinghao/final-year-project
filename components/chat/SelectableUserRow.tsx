import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';

type SelectableUserRowProps = {
  name: string;
  subtitle: string;
  avatar?: string | null;
  selected: boolean;
  onPress: () => void;
};

export function SelectableUserRow({ name, subtitle, avatar, selected, onPress }: SelectableUserRowProps) {
  return (
    <TouchableOpacity className="flex-row items-center border-b border-border-default px-5 py-3 active:bg-gray-50" onPress={onPress}>
      <Avatar uri={avatar} size={48} />
      <View className="ml-4 flex-1 justify-center">
        <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {name}
        </Text>
        <Text className="mt-0.5 text-[13px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          {subtitle}
        </Text>
      </View>
      <View className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-ntu-primary bg-ntu-primary' : 'border-icon-disabled'}`}>
        {selected ? <Ionicons name="checkmark" size={16} color={Theme.colors.text.inverse} /> : null}
      </View>
    </TouchableOpacity>
  );
}
