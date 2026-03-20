import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/authContext';
import { getEvent, joinEvent } from '@/services/eventService';
import { getUsersByIds } from '@/services/userService';
import { AppEvent, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function EventDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const eventId = id as string;

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
  const [attendeeProfiles, setAttendeeProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    (async () => {
      const ev = await getEvent(eventId);
      if (ev) {
        setEvent(ev);
        setHasJoined(ev.attendees.includes(user?.uid || ''));
        const creatorProfiles = await getUsersByIds([ev.createdBy]);
        if (creatorProfiles.length > 0) setCreatorProfile(creatorProfiles[0]);
        if (ev.attendees.length > 0) {
          const aProfiles = await getUsersByIds(ev.attendees);
          setAttendeeProfiles(aProfiles);
        }
      }
      setLoading(false);
    })();
  }, [eventId, user?.uid]);

  const handleJoin = async () => {
    if (!user || !event) return;
    setJoining(true);
    await joinEvent(eventId, user.uid);
    setHasJoined(true);
    setEvent({ ...event, attendeeCount: event.attendeeCount + 1, attendees: [...event.attendees, user.uid] });
    setJoining(false);
    setShowJoinDialog(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#1B1C62" />
      </SafeAreaView>
    );
  }

  const eventDate = event?.date?.toDate();
  const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const timeStr = eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Event Detail</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full h-56 bg-blue-100 flex items-center justify-center relative overflow-hidden">
          {event?.coverImage ? (
            <Image source={{ uri: event.coverImage }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color="#90cdf4" />
              <Text className="text-[#3182ce] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Event Image</Text>
            </>
          )}
        </View>

        <View className="px-5 pt-6 pb-4">
          <Text className="text-[26px] font-bold text-black mb-4 leading-8" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {event?.title}
          </Text>

          <View className="flex-row items-center mb-3">
            <View className="w-8 items-center"><Ionicons name="calendar" size={20} color="#8E8E93" /></View>
            <Text className="text-[15px] text-[#333333] ml-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{dateStr} {timeStr && `\u2022 ${timeStr}`}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-8 items-center"><Ionicons name="location" size={20} color="#8E8E93" /></View>
            <Text className="text-[15px] text-[#333333] ml-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{event?.location}</Text>
          </View>

          <View className="flex-row items-center mb-6 py-3 border-y border-[#E5E5EA]">
            <Image
              source={creatorProfile?.profilePhoto ? { uri: creatorProfile.profilePhoto } : DEFAULT_AVATAR}
              className="w-10 h-10 rounded-full"
            />
            <View className="ml-3">
              <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Organized by</Text>
              <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {event?.creatorName || creatorProfile?.displayName || 'Organizer'}
              </Text>
            </View>
          </View>

          <Text className="text-[17px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About the Event</Text>
          <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {event?.description}
          </Text>

          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-[17px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Attendees ({event?.attendeeCount || 0}{event?.maxCapacity ? `/${event.maxCapacity}` : ''})
            </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/events/attendees', params: { id: eventId } } as any)}>
              <Text className="text-[14px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {attendeeProfiles.slice(0, 8).map((profile) => (
              <TouchableOpacity key={profile.uid} onPress={() => router.push(`/profile/view/${profile.uid}` as any)} className="items-center mr-3">
                <Image
                  source={profile.profilePhoto ? { uri: profile.profilePhoto } : DEFAULT_AVATAR}
                  className="w-12 h-12 rounded-full border border-[#E5E5EA] bg-gray-200"
                />
                <Text className="text-[11px] text-[#8E8E93] mt-1 max-w-[50px] text-center" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  {profile.displayName.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View className="px-5 py-4 pb-8 bg-white border-t border-[#E5E5EA] shadow-xl">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center justify-center ${hasJoined ? 'bg-gray-300' : 'bg-[#1B1C62]'}`}
          onPress={() => !hasJoined && setShowJoinDialog(true)}
          disabled={hasJoined}
        >
          <Text className={`${hasJoined ? 'text-gray-500' : 'text-white'} text-[16px] font-bold`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {hasJoined ? 'Joined Event' : 'Join Event'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Join Event Dialog */}
      <Modal visible={showJoinDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar-outline" size={32} color="#1B1C62" />
            </View>
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Join Event?</Text>
            <Text className="text-[15px] text-[#8E8E93] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              You are about to join {event?.title}. The organizer will be notified.
            </Text>
            <View className="flex-row w-full gap-3">
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center justify-center" onPress={() => setShowJoinDialog(false)}>
                <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center justify-center" onPress={handleJoin} disabled={joining}>
                {joining ? <ActivityIndicator color="white" /> : (
                  <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
