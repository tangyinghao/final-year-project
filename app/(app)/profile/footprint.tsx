import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/authContext';
import { getCheckins } from '@/services/footprintService';
import { FootprintCheckin } from '@/types';

const { width } = Dimensions.get('window');

const TOTAL_ZONES = 12;

const ZONE_ICONS: Record<string, string> = {
  'the-hive': 'business-outline',
  'north-spine': 'restaurant-outline',
  'nanyang-auditorium': 'school-outline',
  'src': 'fitness-outline',
  'canteen-2': 'restaurant-outline',
  'library': 'library-outline',
};

const getRank = (count: number) => {
  if (count >= 10) return 'Campus Legend';
  if (count >= 7) return 'Campus Veteran';
  if (count >= 4) return 'Campus Explorer';
  if (count >= 1) return 'Campus Newcomer';
  return 'Not Started';
};

const formatTime = (checkin: FootprintCheckin) => {
  if (!checkin.checkedInAt) return '';
  const date = checkin.checkedInAt.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return 'Last week';
};

export default function FootprintMapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<FootprintCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const data = await getCheckins(user.uid);
      setCheckins(data);
      setLoading(false);
    })();
  }, [user?.uid]);

  const progressPct = Math.round((checkins.length / TOTAL_ZONES) * 100);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Footprint Map
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Stylized Map View */}
          <View className="w-full h-[320px] bg-[#EBF4FE] items-center justify-center relative">
            <Ionicons name="map" size={120} color="#C4DDFB" />
            <Text className="text-[#8E8E93] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>NTU Campus Map Placeholder</Text>

            {/* Dynamic pins from check-ins */}
            {checkins.slice(0, 2).map((c, i) => (
              <View key={c.zoneId} className="absolute items-center" style={{ top: i === 0 ? '30%' : '60%', left: i === 0 ? '40%' : '60%' }}>
                <Ionicons name="location" size={32} color="#D71440" />
                <Text className="text-[10px] font-bold text-[#1B1C62] bg-white px-1 mt-1 rounded shadow-sm" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{c.zoneName}</Text>
              </View>
            ))}

            {checkins.length >= 2 && (
              <View className="absolute top-[45%] left-[48%] w-[12%] h-[15%] border-l-2 border-b-2 border-dashed border-[#1B1C62]/40" />
            )}
          </View>

          {/* Floating Stats Card */}
          <View className="px-4 -mt-8 mb-6">
            <View className="bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-[#E5E5EA]">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[14px] text-[#8E8E93] mb-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Total Zones Unlocked</Text>
                  <Text className="text-[24px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{checkins.length} <Text className="text-[16px] text-[#8E8E93]">/ {TOTAL_ZONES}</Text></Text>
                </View>
                <View className="w-12 h-12 bg-[#F6F6F6] rounded-full items-center justify-center">
                  <Ionicons name="trophy" size={24} color="#D71440" />
                </View>
              </View>
              <View className="h-[6px] bg-[#E5E5EA] rounded-full w-full overflow-hidden mb-4">
                <View className="h-full bg-[#1B1C62] rounded-full" style={{ width: `${progressPct}%` }} />
              </View>
              <View className="flex-row items-center">
                <Text className="text-[14px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Current Rank: </Text>
                <Text className="text-[14px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{getRank(checkins.length)}</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity List */}
          <View className="px-4 pb-12">
            <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Recent Check-ins</Text>

            {checkins.length === 0 ? (
              <Text className="text-[15px] text-[#8E8E93] text-center mt-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>No check-ins yet. Visit campus zones to get started!</Text>
            ) : (
              checkins.map((item, index) => (
                <View key={item.zoneId} className="flex-row items-start mb-6">
                  <View className="w-10 h-10 rounded-full bg-[#F6F6F6] items-center justify-center border border-[#E5E5EA] mr-4 z-10">
                    <Ionicons name={(ZONE_ICONS[item.zoneId] || 'location-outline') as any} size={20} color="#1B1C62" />
                  </View>
                  <View className="flex-1 pt-1 justify-center">
                    <Text className="text-[16px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Checked in at {item.zoneName}</Text>
                    <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{formatTime(item)}</Text>
                  </View>

                  {/* Vertical line connecting timeline items */}
                  {index < checkins.length - 1 && (
                    <View className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-[#E5E5EA]" />
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
