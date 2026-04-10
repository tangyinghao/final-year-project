import { DEFAULT_AVATAR } from '@/constants/images';
import { joinGroup } from '@/services/discoveryService';
import { GroupDiscoveryResult } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const group = useMemo(() => JSON.parse(data as string) as GroupDiscoveryResult, [data]);
  const [joining, setJoining] = useState(false);

  const uniqueReasons = group.reasons.filter((reason, index, reasons) => {
    const normalized = reason.trim().toLowerCase();
    const key = normalized.startsWith('shared interests:')
      ? 'shared interests'
      : normalized.startsWith('same programme:')
        ? 'same programme'
        : normalized.startsWith('shared language:')
          ? 'shared language'
          : normalized;
    return reasons.findIndex((candidate) => {
      const candidateNormalized = candidate.trim().toLowerCase();
      const candidateKey = candidateNormalized.startsWith('shared interests:')
        ? 'shared interests'
        : candidateNormalized.startsWith('same programme:')
          ? 'same programme'
          : candidateNormalized.startsWith('shared language:')
            ? 'shared language'
            : candidateNormalized;
      return candidateKey === key;
    }) === index;
  });

  const resolvedMembers = (group.members && group.members.length > 0)
    ? group.members
    : (group.memberPhotos || []).map((photo, index) => ({
        uid: `fallback-${index}`,
        displayName: group.memberNames?.[index] || 'Member',
        profilePhoto: photo,
      }));

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      await joinGroup(group.chatId);
      Alert.alert('Joined!', `You have joined "${group.name}".`, [
        {
          text: 'Open Chat',
          onPress: () => router.replace({ pathname: '/chat/[id]', params: { id: group.chatId, name: group.name, isGroup: 'true' } } as any),
        },
      ]);
    } catch (e: any) {
      if (e?.code === 'functions/already-exists') {
        Alert.alert('Already a Member', 'You are already in this group.');
      } else if (e?.code === 'functions/resource-exhausted') {
        Alert.alert('Group Full', 'This group has reached its maximum capacity.');
      } else {
        Alert.alert('Error', e.message || 'Failed to join group.');
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Group Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Group Header */}
        <View className="items-center pt-8 pb-6 px-4 bg-[#F6F6F6] border-b border-[#E5E5EA]">
          <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC] mb-4">
            <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.score}% Match</Text>
          </View>
          <Text className="text-[24px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.name}</Text>
          <Text className="text-[14px] text-[#8E8E93] text-center mb-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            Owner: {group.ownerName} · {group.memberCount}{group.maxCapacity ? `/${group.maxCapacity}` : ''} member{group.memberCount !== 1 ? 's' : ''}
          </Text>

          {/* Member Avatars */}
          <View className="flex-row justify-center pl-1">
            {group.memberPhotos.slice(0, 4).map((photo, i) => (
              <Image
                key={i}
                source={photo ? { uri: photo } : DEFAULT_AVATAR}
                className="w-12 h-12 rounded-full border-2 border-white bg-gray-200"
                style={{ zIndex: 4 - i, marginLeft: i > 0 ? -16 : 0 }}
              />
            ))}
            {group.memberCount > 4 && (
              <View className="w-12 h-12 rounded-full border-2 border-white bg-[#F2F2F7] items-center justify-center" style={{ marginLeft: -16 }}>
                <Text className="text-[12px] text-[#4A4A4A] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>+{group.memberCount - 4}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 pt-6 pb-20">
          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Why You Matched</Text>
          <View className="flex-row flex-wrap mb-8">
            {uniqueReasons.map((reason, i) => (
              <View key={i} className="bg-[#F6F6F6] border border-[#E5E5EA] px-4 py-2 rounded-full mr-3 mb-3 flex-row items-center">
                <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                <Text className="text-[14px] text-[#333333] ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Members Section */}
          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Members ({group.memberCount}{group.maxCapacity ? `/${group.maxCapacity}` : ''})
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {resolvedMembers.map((member) => (
              <View key={member.uid} className="items-center w-16">
                <Image
                  source={member.profilePhoto ? { uri: member.profilePhoto } : DEFAULT_AVATAR}
                  className="w-16 h-16 rounded-full bg-gray-200 border border-[#E5E5EA]"
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-5 py-4 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity
          className="w-full bg-[#1B1C62] py-4 rounded-xl items-center justify-center"
          onPress={handleJoinGroup}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
