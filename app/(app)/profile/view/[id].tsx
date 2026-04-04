import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { getUserProfile } from '@/services/userService';
import { createDirectChat } from '@/services/chatService';
import { UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function UserProfileViewScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { id } = useLocalSearchParams();
  const userId = id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getUserProfile(userId);
      setProfile(p);
      setLoading(false);
    })();
  }, [userId]);

  const handleSendMessage = async () => {
    if (!currentUser || !profile) return;
    const chatId = await createDirectChat(currentUser.uid, profile.uid);
    router.push(`/chat/${chatId}?name=${encodeURIComponent(profile.displayName)}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#1B1C62" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Profile</Text>
        <TouchableOpacity onPress={() => router.push(`/profile/report/${userId}?name=${encodeURIComponent(profile?.displayName || '')}` as any)} className="w-10 items-end justify-center">
          <Ionicons name="alert-circle-outline" size={24} color="#D71440" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center pt-8 pb-6 px-4 bg-[#F6F6F6] border-b border-[#E5E5EA]">
          <Image
            source={profile?.profilePhoto ? { uri: profile.profilePhoto } : DEFAULT_AVATAR}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-sm"
          />
          <Text className="text-[24px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {profile?.displayName || 'User'}
          </Text>
          <Text className="text-[16px] text-[#666666] mb-3 text-center" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            {profile?.bio ? profile.bio.substring(0, 60) + (profile.bio.length > 60 ? '...' : '') : ''}
          </Text>

          {profile?.programme && (
            <View className="flex-row bg-[#EBF4FE] px-3 py-1.5 rounded-full items-center">
              <Ionicons name="school" size={16} color="#1B1C62" />
              <Text className="text-[#1B1C62] text-[13px] font-bold ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {profile.programme}{profile.graduationYear ? ` Class of ${profile.graduationYear}` : ''}
              </Text>
            </View>
          )}
        </View>

        <View className="px-5 pt-6 pb-20">
          {profile?.bio ? (
            <>
              <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About</Text>
              <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{profile.bio}</Text>
            </>
          ) : null}

          {profile?.interests && profile.interests.length > 0 && (
            <>
              <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Interests</Text>
              <View className="flex-row flex-wrap mb-8">
                {profile.interests.map((tag) => (
                  <View key={tag} className="bg-[#F6F6F6] border border-[#E5E5EA] px-4 py-2 rounded-full mr-3 mb-3">
                    <Text className="text-[14px] text-[#333333]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View className="px-5 py-4 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity className="w-full bg-[#1B1C62] py-4 rounded-xl items-center justify-center" onPress={handleSendMessage}>
          <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Send a Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
