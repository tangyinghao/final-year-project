import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Animated, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { getMatchResults } from '@/services/matchingService';
import { getUsersByIds } from '@/services/userService';
import { createGroupChat } from '@/services/chatService';
import { MatchResult, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

interface EnrichedGroup {
  id: string;
  name: string;
  matchScore: string;
  members: UserProfile[];
  reasons: string[];
  userIds: string[];
}

export default function SmartMatchGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { interests, groupSize } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<EnrichedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroup | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [joining, setJoining] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const runGroupMatching = async () => {
    if (!user) return;
    setLoading(true);
    const interestList = interests ? (interests as string).split(',') : user.interests;
    const size = groupSize ? parseInt(groupSize as string) : 5;

    const response = await getMatchResults({
      mode: 'group',
      currentUserId: user.uid,
      preferences: { interests: interestList, groupSize: size, programme: user.programme, graduationYear: user.graduationYear },
    });

    const allUids = new Set<string>();
    response.matches.forEach((m) => m.userIds.forEach((uid) => allUids.add(uid)));
    const profiles = await getUsersByIds(Array.from(allUids));
    const profileMap: Record<string, UserProfile> = {};
    profiles.forEach((p) => { profileMap[p.uid] = p; });
    // Add current user to map
    profileMap[user.uid] = user as UserProfile;

    const enriched: EnrichedGroup[] = response.matches.map((m, idx) => ({
      id: `group-${idx}`,
      name: m.explanation[0] || `Study Group ${idx + 1}`,
      matchScore: `${m.score}%`,
      members: m.userIds.map((uid) => profileMap[uid]).filter(Boolean),
      reasons: m.explanation,
      userIds: m.userIds,
    }));

    setGroups(enriched);
    setLoading(false);
  };

  useEffect(() => { runGroupMatching(); }, [user?.uid]);

  const animateDetailIn = () => {
    overlayOpacity.setValue(0); sheetTranslateY.setValue(300); sheetScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const openGroupDetail = (group: EnrichedGroup) => { setSelectedGroup(group); setDetailVisible(true); animateDetailIn(); };

  const closeGroupDetail = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 0.95, duration: 250, useNativeDriver: true }),
    ]).start(() => { setDetailVisible(false); setSelectedGroup(null); });
  };

  const handleJoinGroup = async () => {
    if (!selectedGroup || !user) return;
    setJoining(true);
    const otherIds = selectedGroup.userIds.filter((uid) => uid !== user.uid);
    const chatId = await createGroupChat(user.uid, otherIds, selectedGroup.name, 'algorithm');
    setJoining(false);
    setShowConfirmModal(false);
    setSelectedGroup(null);
    router.push(`/chat/${chatId}?name=${encodeURIComponent(selectedGroup.name)}&isGroup=true` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#1B1C62" />
        <Text className="text-[15px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Finding groups...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Group Match</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center pt-8 pb-4">
          <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-3">
            <Ionicons name="people" size={32} color="#1B1C62" />
          </View>
          <Text className="text-[20px] font-bold text-black text-center px-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {groups.length > 0 ? `We found ${groups.length} groups for you!` : 'No groups found'}
          </Text>
        </View>

        <View className="px-5 pt-2">
          {groups.map((group) => (
            <View key={group.id} className="bg-white border border-[#E5E5EA] rounded-xl p-4 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-[#F2F2F7] px-3 py-1 rounded-full">
                  <Text className="text-[12px] text-[#4A4A4A] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{group.members.length} Members</Text>
                </View>
                <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                  <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.matchScore} Match</Text>
                </View>
              </View>

              <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{group.name}</Text>

              <View className="flex-row mb-3 pl-1">
                {group.members.slice(0, 4).map((member, i) => (
                  <Image key={member.uid} source={member.profilePhoto ? { uri: member.profilePhoto } : DEFAULT_AVATAR}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    style={{ zIndex: group.members.length - i, marginLeft: i > 0 ? -12 : 0 }} />
                ))}
                {group.members.length > 4 && (
                  <View className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F2F7] items-center justify-center" style={{ marginLeft: -12 }}>
                    <Text className="text-[11px] text-[#4A4A4A] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>+{group.members.length - 4}</Text>
                  </View>
                )}
              </View>

              <Text className="text-[13px] text-[#8E8E93] mb-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{group.reasons[0]}</Text>

              <TouchableOpacity className="w-full border border-[#1B1C62] py-3 rounded-xl items-center justify-center" onPress={() => openGroupDetail(group)}>
                <Text className="text-[#1B1C62] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View Group</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity className="items-center py-4 mb-4" onPress={runGroupMatching}>
          <Text className="text-[15px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Find More Groups</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Group Detail Bottom Sheet */}
      <Modal visible={detailVisible} transparent animationType="none" onRequestClose={closeGroupDetail}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayOpacity }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeGroupDetail} />
          </Animated.View>
          <Animated.View style={{ maxHeight: '80%', transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }] }}>
            <View className="bg-white rounded-t-2xl px-5 pb-8 pt-3">
              <View className="w-10 h-1 bg-[#E5E5EA] rounded-full self-center mb-4" />
              {selectedGroup && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                      <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{selectedGroup.matchScore} Match</Text>
                    </View>
                    <TouchableOpacity onPress={closeGroupDetail} className="w-8 h-8 items-center justify-center">
                      <Ionicons name="close" size={22} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-[22px] font-bold text-black mb-5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{selectedGroup.name}</Text>

                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-3 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Members ({selectedGroup.members.length})</Text>
                  <View className="mb-5">
                    {selectedGroup.members.map((member) => {
                      const isYou = member.uid === user?.uid;
                      return (
                        <TouchableOpacity key={member.uid} className="flex-row items-center py-3 border-b border-[#F2F2F7]"
                          onPress={() => { if (!isYou) { closeGroupDetail(); router.push(`/profile/view/${member.uid}` as any); } }} disabled={isYou}>
                          <Image source={member.profilePhoto ? { uri: member.profilePhoto } : DEFAULT_AVATAR} className="w-11 h-11 rounded-full bg-gray-200" />
                          <View className="flex-1 ml-3 justify-center">
                            <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                              {member.displayName}{isYou && <Text className="text-[#8E8E93] font-normal"> (you)</Text>}
                            </Text>
                            <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{member.programme || member.role}</Text>
                          </View>
                          {!isYou && <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Why you matched</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {selectedGroup.reasons.map((reason, i) => (
                      <View key={i} className="bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#E8ECEF] flex-row items-center">
                        <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                        <Text className="text-[13px] text-[#4A4A4A] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity className="w-full bg-[#1B1C62] py-3.5 rounded-xl items-center justify-center mb-2"
                    onPress={() => { setDetailVisible(false); setShowConfirmModal(true); }}>
                    <Text className="text-white font-bold text-[16px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join This Group</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full max-w-[340px] rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-4">
              <Ionicons name="people" size={32} color="#1B1C62" />
            </View>
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join Study Group?</Text>
            <Text className="text-[15px] text-[#666666] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              You'll be added to {selectedGroup?.name}. A group chat will be created.
            </Text>
            <View className="w-full flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center"
                onPress={() => { setShowConfirmModal(false); if (selectedGroup) { setDetailVisible(true); animateDetailIn(); } }}>
                <Text className="text-[16px] font-bold text-[#666666]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center" onPress={handleJoinGroup} disabled={joining}>
                {joining ? <ActivityIndicator color="white" /> : (
                  <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
