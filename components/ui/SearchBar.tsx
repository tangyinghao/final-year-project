import React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search', className = '' }: SearchBarProps) {
  return (
    <View className={`flex-row items-center rounded-xl bg-surface-muted px-4 py-3 ${className}`}>
      <Ionicons name="search" size={20} color={Theme.colors.icon.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.input.placeholder}
        className="ml-3 flex-1 text-[16px] text-black"
        style={{ fontFamily: 'PlusJakartaSans-Regular', height: Platform.OS === 'ios' ? 24 : 40 }}
      />
    </View>
  );
}
