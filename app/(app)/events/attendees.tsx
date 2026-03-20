import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEvent } from '@/services/eventService';
import { getUsersByIds } from '@/services/userService';
import { UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function AttendeesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = id as string;

  const [attendees, setAttendees] = useState<UserProfile[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const event = await getEvent(eventId);
      if (event) {
        setMaxCapacity(event.maxCapacity);
        if (event.attendees.length > 0) {
          const profiles = await getUsersByIds(event.attendees);
          setAttendees(profiles);
        }
      }
      setLoading(false);
    })();
  }, [eventId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Attendees ({attendees.length}{maxCapacity ? `/${maxCapacity}` : ''})
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : attendees.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>No attendees yet.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="pt-2">
            {attendees.map((profile) => (
              <TouchableOpacity
                key={profile.uid}
                className="flex-row items-center px-5 py-3 border-b border-[#E5E5EA] active:bg-gray-50"
                onPress={() => router.push(`/profile/view/${profile.uid}` as any)}
              >
                <Image source={profile.profilePhoto ? { uri: profile.profilePhoto } : DEFAULT_AVATAR} className="w-12 h-12 rounded-full bg-gray-200" />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{profile.displayName}</Text>
                  <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{profile.programme || profile.role}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
