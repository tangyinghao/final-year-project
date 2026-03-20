import React from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';

type FilterChipRowProps = {
  tags: string[];
  activeTag: string;
  onChange: (tag: string) => void;
};

export function FilterChipRow({ tags, activeTag, onChange }: FilterChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          selected={activeTag === tag}
          tone={tag === 'Saved' ? 'saved' : 'default'}
          onPress={() => onChange(tag)}
          className="mr-2"
        />
      ))}
      <View className="w-8" />
    </ScrollView>
  );
}
