import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type FeaturedEventCardProps = {
  title: string;
  location: string;
  indexLabel?: string;
  coverImage?: string | null;
  onPress?: () => void;
};

export function FeaturedEventCard({ title, location, indexLabel, coverImage, onPress }: FeaturedEventCardProps) {
  return (
    <TouchableOpacity
      style={{ width: width - 32 }}
      className="relative mr-4 h-[160px] overflow-hidden rounded-2xl bg-surface-featured"
      onPress={onPress}
      disabled={!onPress}>
      {coverImage ? <Image source={{ uri: coverImage }} className="absolute h-full w-full" resizeMode="cover" /> : null}
      {coverImage ? <View className="absolute h-full w-full bg-black/40" /> : null}
      <View className="z-10 flex-1 justify-between p-5">
        {indexLabel ? (
          <View className="absolute right-4 top-4 rounded-full bg-black/60 px-2 py-1">
            <Text className="text-[10px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              {indexLabel}
            </Text>
          </View>
        ) : null}
        <Text className={`text-xs font-black uppercase ${coverImage ? 'text-white' : 'text-ntu-primary'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Featured Event
        </Text>
        <View>
          <Text className={`text-[22px] font-bold leading-7 ${coverImage ? 'text-white' : 'text-ntu-primary'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {title}
          </Text>
          <Text className={`mt-1 text-[13px] ${coverImage ? 'text-white/80' : 'text-ntu-primary/80'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
