import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

type FootprintPromoCardProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function FootprintPromoCard({ title, subtitle, onPress }: FootprintPromoCardProps) {
  return (
    <TouchableOpacity className="relative mx-4 mb-4 items-center overflow-hidden rounded-xl bg-ntu-primary px-5 py-6 shadow-lg shadow-blue-900/40" onPress={onPress}>
      <Ionicons name="map-outline" size={80} color={Theme.colors.overlay.onBrandSubtle} style={{ position: 'absolute', right: -10, top: -10 }} />
      <Ionicons name="location" size={24} color={Theme.colors.text.inverse} style={{ marginBottom: 8 }} />
      <Text className="text-center text-[18px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
        {title}
      </Text>
      <Text className="mt-1 text-center text-[13px] text-white/80" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}
