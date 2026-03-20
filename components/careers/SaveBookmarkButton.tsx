import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type SaveBookmarkButtonProps = {
  saved: boolean;
  onPress: () => void;
};

export function SaveBookmarkButton({ saved, onPress }: SaveBookmarkButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} className="-mr-2 -mt-1 p-1">
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Theme.colors.accent.saved : Theme.colors.icon.primary} />
    </TouchableOpacity>
  );
}
