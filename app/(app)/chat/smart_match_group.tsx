import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const MATCHED_GROUPS = [
  {
    id: 'g1',
    name: 'Academic/SCSE Study Group',
    matchScore: '92%',
    members: [
      { id: 1, name: 'Marcus Chen', role: 'Software Eng @ Grab', avatar: 'https://i.pravatar.cc/150?u=marcus' },
      { id: 2, name: 'Sarah Lim', role: 'CS Year 3 student', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      { id: 3, name: 'Dr. Michael Tan', role: 'Alumni | Data Scientist', avatar: 'https://i.pravatar.cc/150?u=michael' },
      { id: 4, name: 'You', role: 'MSc EEE', avatar: 'https://i.pravatar.cc/150?u=you' },
    ],
    reasons: ['All interested in AI/ML', 'All from SCSE / EEE', 'Similar graduation years'],
  },
  {
    id: 'g2',
    name: 'AI/ML Research Circle',
    matchScore: '87%',
    members: [
      { id: 5, name: 'Priya Nair', role: 'PhD Candidate @ NTU', avatar: 'https://i.pravatar.cc/150?u=priya' },
      { id: 6, name: 'Wei Jun', role: 'ML Engineer @ Shopee', avatar: 'https://i.pravatar.cc/150?u=weijun' },
      { id: 7, name: 'Rachel Ong', role: 'CS Year 4 student', avatar: 'https://i.pravatar.cc/150?u=rachel' },
      { id: 8, name: 'Alex Tan', role: 'Alumni | AI Researcher', avatar: 'https://i.pravatar.cc/150?u=alex' },
      { id: 4, name: 'You', role: 'MSc EEE', avatar: 'https://i.pravatar.cc/150?u=you' },
    ],
    reasons: ['All researching deep learning', 'Active in NTU AI Lab', 'Shared publication interests'],
  },
  {
    id: 'g3',
    name: 'Badminton & Networking',
    matchScore: '78%',
    members: [
      { id: 9, name: 'James Sin', role: 'EEE Year 2 student', avatar: 'https://i.pravatar.cc/150?u=james' },
      { id: 10, name: 'Ivy Xu', role: 'Alumni | Product Manager', avatar: 'https://i.pravatar.cc/150?u=ivy' },
      { id: 4, name: 'You', role: 'MSc EEE', avatar: 'https://i.pravatar.cc/150?u=you' },
    ],
    reasons: ['All play badminton weekly', 'All from EEE', 'Looking to network'],
  },
];

type MatchedGroup = typeof MATCHED_GROUPS[0];

export default function SmartMatchGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedGroup, setSelectedGroup] = useState<MatchedGroup | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const animateDetailIn = () => {
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(300);
    sheetScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const openGroupDetail = (group: MatchedGroup) => {
    setSelectedGroup(group);
    setDetailVisible(true);
    animateDetailIn();
  };

  const closeGroupDetail = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 0.95, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setDetailVisible(false);
      setSelectedGroup(null);
    });
  };

  const handleJoinGroup = () => {
    const group = selectedGroup;
    setShowConfirmModal(false);
    setSelectedGroup(null);
    if (group) {
      router.push(`/chat/${group.id}?name=${encodeURIComponent(group.name)}&isGroup=true` as any);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Group Match
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="items-center justify-center pt-8 pb-4">
          <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-3">
            <Ionicons name="people" size={32} color="#1B1C62" />
          </View>
          <Text className="text-[20px] font-bold text-black text-center px-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            We found {MATCHED_GROUPS.length} groups for you!
          </Text>
        </View>

        {/* Group Cards */}
        <View className="px-5 pt-2">
          {MATCHED_GROUPS.map((group) => (
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
                  <Image
                    key={member.id}
                    source={{ uri: member.avatar }}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    style={{ zIndex: group.members.length - i, marginLeft: i > 0 ? -12 : 0 }}
                  />
                ))}
                {group.members.length > 4 && (
                  <View className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F2F7] items-center justify-center" style={{ marginLeft: -12 }}>
                    <Text className="text-[11px] text-[#4A4A4A] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>+{group.members.length - 4}</Text>
                  </View>
                )}
              </View>

              <Text className="text-[13px] text-[#8E8E93] mb-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{group.reasons[0]}</Text>

              <TouchableOpacity
                className="w-full border border-[#1B1C62] py-3 rounded-xl items-center justify-center"
                onPress={() => openGroupDetail(group)}
              >
                <Text className="text-[#1B1C62] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View Group</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* TODO: Backend — Replace Alert with API call (POST /match/group) to fetch new group suggestions based on user preferences */}
        <TouchableOpacity
          className="items-center py-4 mb-4"
          onPress={() => Alert.alert('Refreshing...', 'Searching for new cohorts.')}
        >
          <Text className="text-[15px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Find More Groups</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Group Detail Bottom Sheet */}
      <Modal visible={detailVisible} transparent animationType="none" onRequestClose={closeGroupDetail}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: overlayOpacity,
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeGroupDetail} />
          </Animated.View>
          <Animated.View style={{ maxHeight: '80%', transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }] }}>
            <View className="bg-white rounded-t-2xl px-5 pb-8 pt-3">
              {/* Drag Handle */}
              <View className="w-10 h-1 bg-[#E5E5EA] rounded-full self-center mb-4" />

              {selectedGroup && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Group Header */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                      <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{selectedGroup.matchScore} Match</Text>
                    </View>
                    <TouchableOpacity onPress={closeGroupDetail} className="w-8 h-8 items-center justify-center">
                      <Ionicons name="close" size={22} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-[22px] font-bold text-black mb-5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{selectedGroup.name}</Text>

                  {/* Full Member List */}
                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-3 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Members ({selectedGroup.members.length})</Text>
                  <View className="mb-5">
                    {selectedGroup.members.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        className="flex-row items-center py-3 border-b border-[#F2F2F7]"
                        onPress={() => {
                          if (member.name !== 'You') {
                            closeGroupDetail();
                            router.push(`/profile/view/${member.id}` as any);
                          }
                        }}
                        disabled={member.name === 'You'}
                      >
                        <Image source={{ uri: member.avatar }} className="w-11 h-11 rounded-full bg-gray-200" />
                        <View className="flex-1 ml-3 justify-center">
                          <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                            {member.name}
                            {member.name === 'You' && <Text className="text-[#8E8E93] font-normal"> (you)</Text>}
                          </Text>
                          <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{member.role}</Text>
                        </View>
                        {member.name !== 'You' && (
                          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Match Reasons */}
                  <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Why you matched</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {selectedGroup.reasons.map((reason, i) => (
                      <View key={i} className="bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#E8ECEF] flex-row items-center">
                        <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                        <Text className="text-[13px] text-[#4A4A4A] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Join Button */}
                  <TouchableOpacity
                    className="w-full bg-[#1B1C62] py-3.5 rounded-xl items-center justify-center mb-2"
                    onPress={() => {
                      setDetailVisible(false);
                      setShowConfirmModal(true);
                    }}
                  >
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
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Join Study Group?
            </Text>
            <Text className="text-[15px] text-[#666666] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              You'll be added to {selectedGroup?.name}. Other members will be notified when they join. You can leave the group anytime.
            </Text>

            <View className="w-full flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center"
                onPress={() => {
                  setShowConfirmModal(false);
                  if (selectedGroup) {
                    setDetailVisible(true);
                    animateDetailIn();
                  }
                }}
              >
                <Text className="text-[16px] font-bold text-[#666666]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center"
                onPress={handleJoinGroup}
              >
                <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
