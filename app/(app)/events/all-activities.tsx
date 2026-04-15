import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { EventListCard } from '@/components/events/EventListCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { getApprovedUserEvents } from '@/services/eventService';
import { getUsersByIds } from '@/services/userService';
import { AppEvent } from '@/types';
import { Theme } from '@/constants/theme';

export default function AllActivitiesScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendeePhotos, setAttendeePhotos] = useState<Record<string, string | null>>({});

  useEffect(() => {
    (async () => {
      const userCreated = await getApprovedUserEvents();
      setEvents(userCreated);

      const allUids = [...new Set(userCreated.flatMap((e) => e.attendees || []))];
      if (allUids.length > 0) {
        const profiles = await getUsersByIds(allUids);
        const photoMap: Record<string, string | null> = {};
        profiles.forEach((p) => { photoMap[p.uid] = p.profilePhoto; });
        setAttendeePhotos(photoMap);
      }

      setLoading(false);
    })();
  }, []);

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="All Activities" onLeftPress={() => router.back()} className="pb-4" />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.brand.primary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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
