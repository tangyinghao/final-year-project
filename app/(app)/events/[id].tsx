import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const router = useRouter();
  const { id, title, time, attendees } = useLocalSearchParams();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  const attendeeBaseCount = parseInt(attendees as string) || 12;
  const currentCount = hasJoined ? attendeeBaseCount + 1 : attendeeBaseCount;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header fixed at top */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Event Detail
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="w-full h-56 bg-blue-100 flex items-center justify-center relative overflow-hidden">
           <Ionicons name="image-outline" size={48} color="#90cdf4" />
           <Text className="text-[#3182ce] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Placeholder Image</Text>
        </View>

        {/* Info Section */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-[26px] font-bold text-black mb-4 leading-8" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {title || 'Badminton Session'}
          </Text>

          <View className="flex-row items-center mb-3">
            <View className="w-8 items-center"><Ionicons name="calendar" size={20} color="#8E8E93" /></View>
            <Text className="text-[15px] text-[#333333] ml-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              Saturday, 12 Oct 2025 • {time || '2:00 PM - 4:00 PM'}
            </Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-8 items-center"><Ionicons name="location" size={20} color="#8E8E93" /></View>
            <Text className="text-[15px] text-[#333333] ml-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              NTU Sports Hall, Court 3
            </Text>
          </View>

          <View className="flex-row items-center mb-6 py-3 border-y border-[#E5E5EA]">
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=ivy' }} className="w-10 h-10 rounded-full" />
            <View className="ml-3">
              <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Organized by</Text>
              <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Ivy Xu</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-[17px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About the Event</Text>
          <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            Join us for a casual weekend badminton session! All skill levels are welcome. Please bring your own rackets if possible. We have booked courts 3 and 4 for 2 hours.
          </Text>

          {/* Attendees */}
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-[17px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Attendees ({currentCount}/20)</Text>
            {/* @ts-ignore */}
            <TouchableOpacity onPress={() => router.push({ pathname: '/events/attendees', params: { id } })}>
              <Text className="text-[14px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {[...Array(8)].map((_, i) => (
              <View 
                key={i} 
                className="w-12 h-12 rounded-full mr-3 border border-[#E5E5EA] bg-[#1B1C62] items-center justify-center"
              >
                <Text className="text-white text-[18px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {['A', 'J', 'S', 'M', 'T', 'K', 'L', 'P'][i]}
                </Text>
              </View>
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
              You are about to join the Badminton Session. The organizer will be notified.
            </Text>
            <View className="flex-row w-full gap-3">
              <TouchableOpacity 
                className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center justify-center"
                onPress={() => setShowJoinDialog(false)}
              >
                <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center justify-center"
                onPress={() => {
                  setShowJoinDialog(false);
                  setHasJoined(true);
                  alert("Successfully joined event!");
                }}
              >
                <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
