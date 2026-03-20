import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getApprovedOfficialEvents, getApprovedUserEvents } from '@/services/eventService';
import { AppEvent } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
  const router = useRouter();
  const [officialEvents, setOfficialEvents] = useState<AppEvent[]>([]);
  const [userEvents, setUserEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [official, userCreated] = await Promise.all([
        getApprovedOfficialEvents(),
        getApprovedUserEvents(),
      ]);
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

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4">
        <View className="w-8" />
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Events</Text>
        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          onPress={() => router.push('/events/create')}
        >
          <Ionicons name="add" size={28} color="#1B1C62" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : (
        <FlatList
          data={userEvents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View className="mb-4">
              {/* Carousel Banner for Official Events */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-6 pt-2">
                {officialEvents.length > 0 ? (
                  officialEvents.map((event, idx) => (
                    <TouchableOpacity
                      key={event.id}
                      style={{ width: width - 32 }}
                      className="h-[160px] bg-[#DFF0FF] rounded-2xl overflow-hidden relative mr-4"
                      onPress={() => router.push(`/events/${event.id}` as any)}
                    >
                      {event.coverImage && (
                        <Image source={{ uri: event.coverImage }} className="absolute w-full h-full" resizeMode="cover" />
                      )}
                      {event.coverImage && (
                        <View className="absolute w-full h-full bg-black/40" />
                      )}
                      <View className="flex-1 justify-between p-5 z-10">
                        <View className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full z-10">
                          <Text className="text-white text-[10px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                            {idx + 1}/{officialEvents.length}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-start">
                          <Text className={`font-black text-xs uppercase ${event.coverImage ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Featured Event</Text>
                        </View>
                        <View>
                          <Text className={`text-[22px] font-bold leading-7 ${event.coverImage ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                            {event.title}
                          </Text>
                          <Text className={`text-[13px] mt-1 ${event.coverImage ? 'text-white/80' : 'text-[#1B1C62]/80'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                            {event.location}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={{ width: width - 32 }}
                    className="h-[160px] bg-[#DFF0FF] rounded-2xl overflow-hidden relative mr-4 justify-between p-5"
                  >
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[#1B1C62] font-black text-xs uppercase" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Featured Event</Text>
                    </View>
                    <View>
                      <Text className="text-[#1B1C62] text-[22px] font-bold leading-7" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                        NTU Alumni{'\n'}Homecoming 2025
                      </Text>
                      <Text className="text-[#1B1C62]/80 text-[13px] mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Coming soon</Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* List Header */}
              <View className="px-4 mb-3">
                <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Latest Activities</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm border border-[#E5E5EA]"
              onPress={() => router.push(`/events/${item.id}` as any)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-[16px] font-bold text-black flex-1 mr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
              </View>
              <Text className="text-[14px] text-[#666666] mb-3 leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                {item.description}
              </Text>
              <View className="flex-row justify-between items-end mt-1">
                <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{formatEventTime(item)}</Text>
                <View className="flex-row items-center">
                  {item.attendees.slice(0, 3).map((uid, i) => (
                    <Image
                      key={uid}
                      source={DEFAULT_AVATAR}
                      className={`w-6 h-6 rounded-full border-2 border-white bg-gray-200 ${i > 0 ? '-ml-2' : ''}`}
                    />
                  ))}
                  {item.attendeeCount > 3 && (
                    <View className="min-w-[24px] h-6 rounded-full bg-gray-100 border-2 border-white -ml-2 items-center justify-center px-1">
                      <Text className="text-[10px] text-[#8E8E93] font-bold text-center">+{item.attendeeCount - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center pt-10">
              <Ionicons name="calendar-outline" size={48} color="#C7C7CC" />
              <Text className="text-[16px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                No events yet.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
