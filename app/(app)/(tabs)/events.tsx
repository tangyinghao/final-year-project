import React from 'react';
import { View, Text, FlatList, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Badminton Session',
    description: 'Weekly casual badminton session for EEE students.',
    time: 'Just now',
    attendeeCount: 12,
  },
  {
    id: '2',
    title: 'AI Machine Learning Workshop',
    description: 'Guest speaker on latest trends in deep learning.',
    time: '2h ago',
    attendeeCount: 45,
  },
  {
    id: '3',
    title: 'Friday Networking Night',
    description: 'Meet alumni and expand your professional network.',
    time: '5h ago',
    attendeeCount: 80,
  },
];

export default function EventsScreen() {
  const router = useRouter();
  
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

      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="mb-4">
            {/* Carousel Banner */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-6 pt-2">
              <View
                style={{ width: width - 32 }}
                className="h-[160px] bg-[#DFF0FF] rounded-2xl overflow-hidden relative mr-4 justify-between p-5"
              >
                <View className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full z-10">
                  <Text className="text-white text-[10px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>1/4</Text>
                </View>
                <View className="flex-row justify-between items-start">
                  <Text className="text-[#1B1C62] font-black text-xs uppercase" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Featured Event</Text>
                </View>
                <View>
                  <Text className="text-[#1B1C62] text-[22px] font-bold leading-7 shadow-sm" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                    NTU Alumni{'\n'}Homecoming 2025
                  </Text>
                  <Text className="text-[#1B1C62]/80 text-[13px] mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Join us this December</Text>
                </View>
              </View>
            </ScrollView>

            {/* Map Card */}
            <TouchableOpacity 
              className="mx-4 bg-[#1B1C62] rounded-xl px-5 py-6 items-center shadow-lg shadow-blue-900/40 relative overflow-hidden mb-6"
              // @ts-ignore
              onPress={() => router.push('/profile/footprint')}
            >
              <Ionicons name="map-outline" size={80} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: -10, top: -10 }} />
              <Ionicons name="location" size={24} color="#FFFFFF" style={{ marginBottom: 8 }} />
              <Text className="text-white text-[18px] font-bold text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>My Footprint Map</Text>
              <Text className="text-white/80 text-[13px] text-center mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Campus Explorer • 4/12 Zones</Text>
            </TouchableOpacity>

            {/* List Header */}
            <View className="px-4 mb-3">
              <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Latest Activities</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm border border-[#E5E5EA]"
            // @ts-ignore
            onPress={() => router.push(`/events/${item.id}?title=${encodeURIComponent(item.title)}&time=${encodeURIComponent(item.time)}&attendees=${item.attendeeCount}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-[16px] font-bold text-black flex-1 mr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
            </View>
            <Text className="text-[14px] text-[#666666] mb-3 leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              {item.description}
            </Text>
            <View className="flex-row justify-between items-end mt-1">
              <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.time}</Text>
              <View className="flex-row">
                {[...Array(3)].map((_, i) => (
                  <View key={i} className={`w-6 h-6 rounded-full bg-[#1B1C62] border-2 border-white items-center justify-center ${i > 0 ? '-ml-2' : ''}`}>
                    <Text className="text-white text-[10px] font-bold">
                      {['A', 'J', 'S'][i]}
                    </Text>
                  </View>
                ))}
                <View className="min-w-[24px] h-6 rounded-full bg-gray-100 border-2 border-white -ml-2 items-center justify-center px-1">
                  <Text className="text-[10px] text-[#8E8E93] font-bold text-center">+{item.attendeeCount}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
