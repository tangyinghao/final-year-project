import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { EventListCard } from '@/components/events/EventListCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { getApprovedOfficialEvents, getApprovedUserEvents } from '@/services/eventService';
import { AppEvent } from '@/types';
import { Theme } from '@/constants/theme';

export default function EventsScreen() {
  const router = useRouter();
  const [officialEvents, setOfficialEvents] = useState<AppEvent[]>([]);
  const [userEvents, setUserEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [official, userCreated] = await Promise.all([getApprovedOfficialEvents(), getApprovedUserEvents()]);
      setOfficialEvents(official);
      setUserEvents(userCreated);
      setLoading(false);
    })();
  }, []);

  const formatEventTime = (event: AppEvent) => {
    if (!event.date) return '';
    const date = event.date.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Events" rightIconName="add" onRightPress={() => router.push('/events/create')} className="pb-4" />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.brand.primary} />
      ) : (
        <FlatList
          data={userEvents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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

              <View className="mb-3 px-4">
                <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  Latest Activities
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <EventListCard
              title={item.title}
              description={item.description}
              timeLabel={formatEventTime(item)}
              attendees={item.attendees.slice(0, 3).map((uid) => ({ id: uid }))}
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
