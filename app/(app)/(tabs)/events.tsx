import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { EventListCard } from '@/components/events/EventListCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { getApprovedOfficialEvents, getApprovedUserEvents } from '@/services/eventService';
import { getUsersByIds } from '@/services/userService';
import { AppEvent } from '@/types';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/authContext';

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [officialEvents, setOfficialEvents] = useState<AppEvent[]>([]);
  const [userEvents, setUserEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendeePhotos, setAttendeePhotos] = useState<Record<string, string | null>>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [official, userCreated] = await Promise.all([getApprovedOfficialEvents(), getApprovedUserEvents()]);
    setOfficialEvents(official);
    setUserEvents(userCreated);

    const allUids = [...new Set([...official, ...userCreated].flatMap((e) => e.attendees || []))];
    if (allUids.length > 0) {
      const profiles = await getUsersByIds(allUids);
      const photoMap: Record<string, string | null> = {};
      profiles.forEach((p) => { photoMap[p.uid] = p.profilePhoto; });
      setAttendeePhotos(photoMap);
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData, user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatEventTime = (event: AppEvent) => {
    const ts = event.createdAt ?? event.date;
    if (!ts) return '';
    const created = ts.toDate();
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMo = Math.floor(diffDays / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;
    const diffYr = Math.floor(diffDays / 365);
    return `${diffYr}y ago`;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Events" rightIconName="add" onRightPress={() => router.push('/events/create')} className="pb-4" />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.brand.primary} />
      ) : (
        <FlatList
          data={userEvents.slice(0, 5)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.brand.primary} colors={[Theme.colors.brand.primary]} />}
          ListHeaderComponent={() => (
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-6 pt-2">
                {officialEvents.length > 0 ? (
                  officialEvents.map((event, idx) => (
                    <FeaturedEventCard
                      key={event.id}
                      title={event.title}
                      location={event.location}
                      indexLabel={`${idx + 1}/${officialEvents.length}`}
                      coverImage={event.coverImage}
                      onPress={() => router.push(`/events/${event.id}` as any)}
                    />
                  ))
                ) : (
                  <FeaturedEventCard title={`NTU Alumni\nHomecoming 2025`} location="Coming soon" />
                )}
              </ScrollView>

              <View className="mb-3 px-4 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  Latest Activities
                </Text>
                {userEvents.length > 5 && (
                  <Text
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'PlusJakartaSans-SemiBold', color: Theme.colors.brand.primary }}
                    onPress={() => router.push('/events/all-activities' as any)}
                  >
                    See All
                  </Text>
                )}
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <EventListCard
              title={item.title}
              description={item.description}
              timeLabel={formatEventTime(item)}
              attendees={(item.attendees || []).map((uid) => ({ id: uid, uri: attendeePhotos[uid] || null }))}
              onPress={() => router.push(`/events/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={<EmptyState iconName="calendar-outline" message="No events yet." />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
