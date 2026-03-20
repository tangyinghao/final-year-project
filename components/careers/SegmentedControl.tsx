import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type SegmentedControlProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View className="flex-row overflow-hidden rounded-lg border border-ntu-primary">
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            className={`flex-1 items-center justify-center py-2 ${active ? 'bg-ntu-primary' : 'bg-white'}`}
            onPress={() => onChange(option)}>
            <Text className={`text-[14px] font-bold ${active ? 'text-white' : 'text-ntu-primary'}`} style={{ fontFamily: active ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
