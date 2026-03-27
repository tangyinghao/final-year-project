import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/authContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import { getMentorship, requestMentorship } from '@/services/careerService';
import { getUsersByIds } from '@/services/userService';
import { Mentorship, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function MentorDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const mentorshipId = id as string;
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(mentorshipId);
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [mentorProfile, setMentorProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await getMentorship(mentorshipId);
      if (m) {
        setMentorship(m);
        const profiles = await getUsersByIds([m.mentorId]);
        if (profiles.length > 0) setMentorProfile(profiles[0]);
      }
      setLoading(false);
    })();
  }, [mentorshipId]);

  const handleRequestMentorship = async () => {
    if (!user || !mentorship) return;
    setRequesting(true);
    try {
      await requestMentorship(mentorship.id, user.uid, user.displayName);
      setHasRequested(true);
      Alert.alert('Request Sent', 'The mentor will be notified of your request.');
    } catch (e) {
      Alert.alert('Error', 'Failed to send request.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#1B1C62" />
      </SafeAreaView>
    );
  }

  if (!mentorship) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Mentorship not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Mentor Profile
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => toggleSave(mentorshipId, 'mentorship')}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? "#FFD700" : "#1B1C62"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mentor Info Header */}
        <View className="items-center pt-8 pb-6 px-4 bg-[#F6F6F6] border-b border-[#E5E5EA]">
          <Image
            source={mentorProfile?.profilePhoto ? { uri: mentorProfile.profilePhoto } : DEFAULT_AVATAR}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-sm"
          />
          <Text className="text-[24px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{mentorship.mentorName}</Text>
          <Text className="text-[16px] text-[#666666] mb-3 text-center" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{mentorship.title}{mentorship.company ? ` at ${mentorship.company}` : ''}</Text>

          {mentorProfile?.programme && (
            <View className="flex-row bg-[#EBF4FE] px-3 py-1.5 rounded-full items-center">
              <Ionicons name="school" size={16} color="#1B1C62" />
              <Text className="text-[#1B1C62] text-[13px] font-bold ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {mentorProfile.programme}{mentorProfile.graduationYear ? ` Class of ${mentorProfile.graduationYear}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Details Section */}
        <View className="px-5 pt-6 pb-20">
          {mentorship.description ? (
            <>
              <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About</Text>
              <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                {mentorship.description}
              </Text>
            </>
          ) : null}

          {mentorship.expertise.length > 0 && (
            <>
              <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Mentorship Focus</Text>
              <View className="flex-row flex-wrap mb-8">
                {mentorship.expertise.map(tag => (
                  <View key={tag} className="bg-[#F6F6F6] border border-[#E5E5EA] px-4 py-2 rounded-full mr-3 mb-3">
                    <Text className="text-[14px] text-[#333333]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {mentorship.availability ? (
            <>
              <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Availability</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={20} color="#8E8E93" />
                <Text className="text-[15px] text-[#333333] ml-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{mentorship.availability}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="px-5 py-4 pb-2 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center justify-center ${hasRequested ? 'bg-gray-300' : 'bg-[#1B1C62]'}`}
          onPress={handleRequestMentorship}
          disabled={hasRequested || requesting}
        >
          {requesting ? <ActivityIndicator color="white" /> : (
            <Text className={`${hasRequested ? 'text-gray-500' : 'text-white'} text-[16px] font-bold`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              {hasRequested ? 'Request Sent' : 'Request Mentorship'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
