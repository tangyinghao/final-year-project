import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CHECK_INS = [
  { id: '1', loc: 'The Hive', time: '2 days ago', icon: 'business-outline' },
  { id: '2', loc: 'North Spine Plaza', time: '5 days ago', icon: 'restaurant-outline' },
  { id: '3', loc: 'Nanyang Auditorium', time: 'Last week', icon: 'school-outline' },
  { id: '4', loc: 'Sports & Recreation Centre', time: 'Last week', icon: 'fitness-outline' },
];

export default function FootprintMapScreen() {
  const router = useRouter();

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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stylized Map View */}
        <View className="w-full h-[320px] bg-[#EBF4FE] items-center justify-center relative">
          <Ionicons name="map" size={120} color="#C4DDFB" />
          <Text className="text-[#8E8E93] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>NTU Campus Map Placeholder</Text>
          
          {/* Pins representing check-ins */}
          <View className="absolute top-[30%] left-[40%] items-center">
            <Ionicons name="location" size={32} color="#D71440" />
            <Text className="text-[10px] font-bold text-[#1B1C62] bg-white px-1 mt-1 rounded shadow-sm" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>The Hive</Text>
          </View>
          <View className="absolute top-[60%] left-[60%] items-center">
            <Ionicons name="location" size={32} color="#D71440" />
            <Text className="text-[10px] font-bold text-[#1B1C62] bg-white px-1 mt-1 rounded shadow-sm" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>North Spine</Text>
          </View>
          
          {/* Dotted path */}
          <View className="absolute top-[45%] left-[48%] w-[12%] h-[15%] border-l-2 border-b-2 border-dashed border-[#1B1C62]/40" />
        </View>

        {/* Floating Stats Card */}
        <View className="px-4 -mt-8 mb-6">
          <View className="bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-[#E5E5EA]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-[14px] text-[#8E8E93] mb-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Total Zones Unlocked</Text>
                <Text className="text-[24px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>4 <Text className="text-[16px] text-[#8E8E93]">/ 12</Text></Text>
              </View>
              <View className="w-12 h-12 bg-[#F6F6F6] rounded-full items-center justify-center">
                <Ionicons name="trophy" size={24} color="#D71440" />
              </View>
            </View>
            <View className="h-[6px] bg-[#E5E5EA] rounded-full w-full overflow-hidden mb-4">
              <View className="h-full bg-[#1B1C62] rounded-full" style={{ width: '33%' }} />
            </View>
            <View className="flex-row items-center">
              <Text className="text-[14px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Current Rank: </Text>
              <Text className="text-[14px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Campus Explorer</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity List */}
        <View className="px-4 pb-12">
          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Recent Check-ins</Text>
          
          {CHECK_INS.map((item, index) => (
            <View key={item.id} className="flex-row items-start mb-6">
              <View className="w-10 h-10 rounded-full bg-[#F6F6F6] items-center justify-center border border-[#E5E5EA] mr-4 z-10">
                <Ionicons name={item.icon as any} size={20} color="#1B1C62" />
              </View>
              <View className="flex-1 pt-1 justify-center">
                <Text className="text-[16px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Checked in at {item.loc}</Text>
                <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.time}</Text>
              </View>
              
              {/* Vertical line connecting timeline items */}
              {index < CHECK_INS.length - 1 && (
                <View className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-[#E5E5EA]" />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
