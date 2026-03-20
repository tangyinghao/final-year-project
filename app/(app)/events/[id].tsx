import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DangerOutlineButton } from '@/components/ui/DangerOutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EventMetaRow } from '@/components/events/EventMetaRow';
import { useAuth } from '@/context/authContext';
import { getEvent, joinEvent, leaveEvent } from '@/services/eventService';
import { getUsersByIds } from '@/services/userService';
import { AppEvent, UserProfile } from '@/types';
import { Theme } from '@/constants/theme';

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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  const handleLeave = async () => {
    if (!user || !event) return;
    setLeaving(true);
    await leaveEvent(eventId, user.uid);
    setHasJoined(false);
    setEvent({ ...event, attendeeCount: Math.max(0, event.attendeeCount - 1), attendees: event.attendees.filter((uid) => uid !== user.uid) });
    setAttendeeProfiles(attendeeProfiles.filter((p) => p.uid !== user.uid));
    setLeaving(false);
    setShowLeaveDialog(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={Theme.colors.brand.primary} />
      </SafeAreaView>
    );
  }

  const eventDate = event?.date?.toDate();
  const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const timeStr = eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Event Detail" onLeftPress={() => router.back()} showBorder />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative h-56 w-full items-center justify-center overflow-hidden bg-blue-100">
          {event?.coverImage ? (
            <Image source={{ uri: event.coverImage }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color={Theme.colors.border.info} />
              <Text className="mt-2 text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Event Image</Text>
            </>
          )}
        </View>

        <View className="px-5 pb-4 pt-6">
          <Text className="mb-4 text-[26px] font-bold leading-8 text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {event?.title}
          </Text>

          <EventMetaRow iconName="calendar" label={`${dateStr}${timeStr ? ` • ${timeStr}` : ''}`} />
          <EventMetaRow iconName="location" label={event?.location || ''} />

          <View className="mb-6 flex-row items-center border-y border-border-default py-3">
            <Avatar uri={creatorProfile?.profilePhoto} size={40} />
            <View className="ml-3">
              <Text className="text-[13px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Organized by</Text>
              <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {event?.creatorName || creatorProfile?.displayName || 'Organizer'}
              </Text>
            </View>
          </View>

          <Text className="mb-2 text-[17px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About the Event</Text>
          <Text className="mb-8 text-[15px] leading-6 text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {event?.description}
          </Text>

          <View className="mb-4 flex-row items-end justify-between">
            <Text className="text-[17px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Attendees ({event?.attendeeCount || 0}{event?.maxCapacity ? `/${event.maxCapacity}` : ''})
            </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/events/attendees', params: { id: eventId } } as any)}>
              <Text className="text-[14px] font-bold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {attendeeProfiles.slice(0, 8).map((profile) => (
              <TouchableOpacity key={profile.uid} onPress={() => router.push(`/profile/view/${profile.uid}` as any)} className="mr-3 items-center">
                <Avatar uri={profile.profilePhoto} size={48} className="border border-border-default" />
                <Text className="mt-1 max-w-[50px] text-center text-[11px] text-text-muted" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  {profile.displayName.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View className="border-t border-border-default bg-white px-5 pb-8 pt-4">
        {hasJoined ? (
          <DangerOutlineButton label="Leave Event" onPress={() => setShowLeaveDialog(true)} />
        ) : (
          <PrimaryButton label="Join Event" onPress={() => setShowJoinDialog(true)} />
        )}
      </View>

      <ConfirmModal
        visible={showJoinDialog}
        title="Join Event?"
        message={`You are about to join ${event?.title}. The organizer will be notified.`}
        iconName="calendar-outline"
        tone="primary"
        confirmLabel="Confirm"
        onConfirm={handleJoin}
        onCancel={() => setShowJoinDialog(false)}
        loading={joining}
      />

      <ConfirmModal
        visible={showLeaveDialog}
        title="Leave Event?"
        message={`Are you sure you want to leave ${event?.title}? You can rejoin later.`}
        iconName="exit-outline"
        tone="danger"
        confirmLabel="Leave"
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
        loading={leaving}
      />
    </SafeAreaView>
  );
}
