import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Theme } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputContainerClassName?: string;
  hideShadow?: boolean;
};

export function TextField({
  label,
  error,
  containerClassName = '',
  inputContainerClassName = '',
  hideShadow,
  style,
  ...props
}: TextFieldProps) {
  const hasError = !!error;

  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? (
        <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          shadowColor: hideShadow ? 'transparent' : Theme.colors.text.primary,
          shadowOpacity: hideShadow ? 0 : 0.04,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: hideShadow ? 0 : 2,
        }}
        className={`min-h-12 flex-row items-center rounded-xl border bg-white px-4 ${hasError ? 'border-status-error' : 'border-border-default'} ${inputContainerClassName}`}>
        <TextInput
          {...props}
          style={[{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16 }, style]}
          className="flex-1 text-black"
          placeholderTextColor={Theme.colors.input.placeholder}
        />
      </View>
      {hasError ? (
        <Text className="text-[13px] text-status-error" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
