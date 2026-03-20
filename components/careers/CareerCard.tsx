import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { SaveBookmarkButton } from './SaveBookmarkButton';

type CareerCardProps = {
  title: string;
  company: string;
  meta: string;
  tags: string[];
  saved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
};

export function CareerCard({ title, company, meta, tags, saved, onToggleSave, onPress }: CareerCardProps) {
  return (
    <TouchableOpacity className="mx-4 mb-4 rounded-xl border border-border-default bg-white p-4 shadow-sm" onPress={onPress}>
      <View className="mb-1 flex-row items-start justify-between">
        <Text className="flex-1 pr-2 text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {title}
        </Text>
        <SaveBookmarkButton saved={saved} onPress={onToggleSave} />
      </View>
      <Text className="mb-1 text-[14px] leading-5 text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
        {company}
      </Text>
      <Text className="mb-3 text-[13px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
        {meta}
      </Text>
      <View className="mt-1 flex-row flex-wrap">
        {tags.map((tag) => (
          <Chip key={tag} label={tag} tone="default" className="mb-2 mr-2 rounded-sm px-3 py-1" />
        ))}
      </View>
    </TouchableOpacity>
  );
}
