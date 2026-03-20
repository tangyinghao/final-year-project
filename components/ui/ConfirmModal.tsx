import React from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { Theme } from '@/constants/theme';
import { IconBadge } from './IconBadge';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  iconName: string;
  tone?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmModal({
  visible,
  title,
  message,
  iconName,
  tone = 'primary',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: Theme.colors.overlay.scrim }}>
        <View className="w-full items-center rounded-2xl bg-white p-6">
          <IconBadge iconName={iconName} tone={tone} className="mb-4" />
          <Text className="mb-2 text-center text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {title}
          </Text>
          <Text className="mb-6 text-center text-[15px] leading-6 text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {message}
          </Text>
          <View className="w-full flex-row gap-3">
            <SecondaryButton label={cancelLabel} onPress={onCancel} className="flex-1" />
            <View className="flex-1">
              {loading ? (
                <View className="min-h-12 items-center justify-center rounded-xl bg-ntu-primary">
                  <ActivityIndicator color={Theme.colors.text.inverse} />
                </View>
              ) : (
                <PrimaryButton label={confirmLabel} onPress={onConfirm} />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
