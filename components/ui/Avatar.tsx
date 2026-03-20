import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { DEFAULT_AVATAR } from '@/constants/images';

type AvatarProps = {
  uri?: string | null;
  source?: ImageSourcePropType;
  size?: number;
  className?: string;
};

export function Avatar({ uri, source, size = 48, className = '' }: AvatarProps) {
  return (
    <Image
      source={uri ? { uri } : source || DEFAULT_AVATAR}
      className={`rounded-full bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
