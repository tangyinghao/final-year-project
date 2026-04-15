import { SegmentedControl } from '@/components/careers/SegmentedControl';
import { DEFAULT_AVATAR } from '@/constants/images';
import { useAuth } from '@/context/authContext';
import { createDirectChat } from '@/services/chatService';
import { getGroupDiscovery, getPersonDiscovery } from '@/services/discoveryService';
import { DiscoveryResult, GroupDiscoveryResult } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BATCH = 3;
// Fetch a generous upper-bound; the Cloud Functions have no hard cap
const FETCH_LIMIT = 200;

export default function SmartMatchScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('Individual');

  // Individual state
  const [personResults, setPersonResults] = useState<DiscoveryResult[]>([]);
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [personIdx, setPersonIdx] = useState(0);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);

  // Group state
  const [groupResults, setGroupResults] = useState<GroupDiscoveryResult[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [groupIdx, setGroupIdx] = useState(0);

  const matchingEnabled = user?.matchingEnabled === true;

  // Fetch all individual results once
  useEffect(() => {
    if (!user?.uid) return;
    if (!matchingEnabled) {
      setLoadingPerson(false);
      return;
    }
    (async () => {
      setLoadingPerson(true);
      try {
        const { results } = await getPersonDiscovery(0, FETCH_LIMIT);
        setPersonResults(results);
      } catch (e) {
        console.error('Person discovery error:', e);
      } finally {
        setLoadingPerson(false);
      }
    })();
  }, [user?.uid, matchingEnabled]);

  // Fetch all group results once
  useEffect(() => {
    if (!user?.uid) return;
    if (!matchingEnabled) {
      setLoadingGroup(false);
      return;
    }
    (async () => {
      setLoadingGroup(true);
      try {
        const { results } = await getGroupDiscovery(0, FETCH_LIMIT);
        setGroupResults(results);
      } catch (e) {
        console.error('Group discovery error:', e);
      } finally {
        setLoadingGroup(false);
      }
    })();
  }, [user?.uid]);

  // Current visible slice
  const visiblePersons = personResults.slice(personIdx, personIdx + BATCH);
  const visibleGroups = groupResults.slice(groupIdx, groupIdx + BATCH);

  const handleRefresh = () => {
    if (activeTab === 'Individual') {
      const next = personIdx + BATCH;
      setPersonIdx(next >= personResults.length ? 0 : next);
    } else {
      const next = groupIdx + BATCH;
      setGroupIdx(next >= groupResults.length ? 0 : next);
    }
  };

  const handleStartChat = async (match: DiscoveryResult) => {
    if (!user) return;
    setConnectingTo(match.userId);
    try {
      const chatId = await createDirectChat(user.uid, match.userId, 'algorithm');
      router.push(`/chat/${chatId}` as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to start chat.');
    } finally {
      setConnectingTo(null);
    }
  };

  const openGroupDetail = (group: GroupDiscoveryResult) => {
    router.push({
      pathname: '/chat/group_detail',
      params: { data: JSON.stringify(group) },
    } as any);
  };

  const isLoading = activeTab === 'Individual' ? loadingPerson : loadingGroup;
  const hasResults = activeTab === 'Individual' ? personResults.length > 0 : groupResults.length > 0;
  const currentVisible = activeTab === 'Individual' ? visiblePersons : visibleGroups;

  const getGroupPreviewMembers = (group: GroupDiscoveryResult) =>
    (group.members && group.members.length > 0)
      ? group.members
      : (group.memberPhotos || []).map((photo, index) => ({
          uid: `fallback-${group.chatId}-${index}`,
          displayName: group.memberNames?.[index] || 'Member',
          profilePhoto: photo,
        }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Smart Match</Text>
        <View className="w-10" />
      </View>

      {/* Segmented Control */}
      <View className="px-4 pt-4 pb-2">
        <SegmentedControl options={['Individual', 'Group']} value={activeTab} onChange={setActiveTab} />
      </View>

      {!matchingEnabled ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-4">
            <Ionicons name="eye-off-outline" size={32} color="#1B1C62" />
          </View>
          <Text className="text-[18px] font-bold text-black text-center mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Smart Match is off
          </Text>
          <Text className="text-[14px] text-[#8E8E93] text-center mb-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            Turn on matching in your profile settings to discover people and groups.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(app)/profile/edit')}
            className="bg-[#1B1C62] px-5 py-3 rounded-full"
          >
            <Text className="text-white text-[14px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Go to profile settings
            </Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B1C62" />
          <Text className="text-[15px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {activeTab === 'Individual' ? 'Finding people...' : 'Finding groups...'}
          </Text>
        </View>
      ) : !hasResults ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-4">
            <Ionicons name={activeTab === 'Individual' ? 'person-outline' : 'people-outline'} size={32} color="#1B1C62" />
          </View>
          <Text className="text-[18px] font-bold text-black text-center mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            No {activeTab === 'Individual' ? 'people' : 'groups'} found
          </Text>
          <Text className="text-[14px] text-[#8E8E93] text-center" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {activeTab === 'Individual'
              ? 'Check back later: new users join regularly.'
              : 'No groups are currently listed for discovery.'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-4">
            {activeTab === 'Individual'
              ? visiblePersons.map((match) => (
                <View key={match.userId} className="bg-white border border-[#E5E5EA] rounded-xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="bg-[#F2F2F7] px-3 py-1 rounded-full">
                      <Text className="text-[12px] text-[#4A4A4A] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                        {match.role === 'alumni' ? 'Alumni' : 'Student'}
                      </Text>
                    </View>
                    <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                      <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{match.score}% Match</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-4">
                    <Image source={match.profilePhoto ? { uri: match.profilePhoto } : DEFAULT_AVATAR} className="w-14 h-14 rounded-full bg-gray-200" />
                    <View className="flex-1 ml-4 justify-center">
                      <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{match.displayName}</Text>
                      <Text className="text-[14px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{match.programme || match.role}</Text>
                    </View>
                  </View>

                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Why you matched:</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {match.reasons.map((reason, i) => (
                      <View key={i} className="bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#E8ECEF] flex-row items-center">
                        <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                        <Text className="text-[13px] text-[#4A4A4A] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-[#1B1C62] py-3 rounded-xl items-center justify-center"
                      onPress={() => handleStartChat(match)}
                      disabled={connectingTo === match.userId}
                    >
                      {connectingTo === match.userId ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="text-white font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Start Chat</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 border border-[#1B1C62] py-3 rounded-xl items-center justify-center"
                      onPress={() => router.push(`/profile/view/${match.userId}` as any)}
                    >
                      <Text className="text-[#1B1C62] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
              : visibleGroups.map((group) => (
                <View key={group.chatId} className="bg-white border border-[#E5E5EA] rounded-xl p-4 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 }}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="bg-[#F2F2F7] px-3 py-1 rounded-full">
                      <Text className="text-[12px] text-[#4A4A4A] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                        {group.memberCount}{group.maxCapacity ? `/${group.maxCapacity}` : ''} Member{group.memberCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                      <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.score}% Match</Text>
                    </View>
                  </View>

                  <Text className="text-[18px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.name}</Text>
                  <Text className="text-[13px] text-[#8E8E93] mb-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                    Owner: {group.ownerName}
                  </Text>

                  <View className="flex-row mb-3 pl-1">
                    {getGroupPreviewMembers(group).slice(0, 4).map((member, i) => (
                      <Image
                        key={member.uid}
                        source={member.profilePhoto ? { uri: member.profilePhoto } : DEFAULT_AVATAR}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                        style={{ zIndex: 4 - i, marginLeft: i > 0 ? -12 : 0 }}
                      />
                    ))}
                    {group.memberCount > 4 && (
                      <View className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F2F7] items-center justify-center" style={{ marginLeft: -12 }}>
                        <Text className="text-[11px] text-[#4A4A4A] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>+{group.memberCount - 4}</Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Why you matched:</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {group.reasons.map((reason, i) => (
                      <View key={i} className="bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#E8ECEF] flex-row items-center">
                        <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                        <Text className="text-[13px] text-[#4A4A4A] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity className="w-full border border-[#1B1C62] py-3 rounded-xl items-center justify-center" onPress={() => openGroupDetail(group)}>
                    <Text className="text-[#1B1C62] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View Group</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Refresh Button */}
          {currentVisible.length > 0 && (
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 mb-6 mx-5 bg-[#F6F6F6] rounded-xl"
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={18} color="#1B1C62" />
              <Text className="text-[15px] font-bold text-[#1B1C62] ml-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                Show More
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
