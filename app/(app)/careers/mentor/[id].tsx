import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSavedItems } from '../../../utils/useSavedItems';

const TAGS = ['Resume Review', 'Mock Interviews', 'Career Guidance'];

export default function MentorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(id as string);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Mentor Profile
        </Text>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center"
          onPress={() => toggleSave(id as string)}
        >
          <Ionicons 
            name={saved ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={saved ? "#FFD700" : "#1B1C62"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mentor Info Header */}
        <View className="items-center pt-8 pb-6 px-4 bg-[#F6F6F6] border-b border-[#E5E5EA]">
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?u=sarah' }}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-sm"
          />
          <Text className="text-[24px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Dr. Sarah Lee</Text>
          <Text className="text-[16px] text-[#666666] mb-3 text-center" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Senior Data Scientist at Google</Text>
          
          <View className="flex-row bg-[#EBF4FE] px-3 py-1.5 rounded-full items-center">
            <Ionicons name="school" size={16} color="#1B1C62" />
            <Text className="text-[#1B1C62] text-[13px] font-bold ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>SCSE Class of 2018</Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="px-5 pt-6 pb-20">
          <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About Me</Text>
          <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            I am passionate about helping students navigate their early careers in tech, specifically in AI and data pipelines. I offer practical advice on technical interviews, resume structuring, and industry expectations. Let's chat if you're interested in the data space!
          </Text>

          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Mentorship Focus</Text>
          <View className="flex-row flex-wrap mb-8">
            {TAGS.map(tag => (
              <View key={tag} className="bg-[#F6F6F6] border border-[#E5E5EA] px-4 py-2 rounded-full mr-3 mb-3">
                <Text className="text-[14px] text-[#333333]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Availability</Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={20} color="#8E8E93" />
            <Text className="text-[15px] text-[#333333] ml-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Available for 30-min Zoom calls</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
            <Text className="text-[15px] text-[#333333] ml-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Usually responds within 2-3 days</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="px-5 py-4 pb-8 bg-white border-t border-[#E5E5EA] shadow-xl">
        <TouchableOpacity 
          className="w-full bg-[#1B1C62] py-4 rounded-xl items-center justify-center"
          onPress={() => Alert.alert('Request Sent', 'The mentor will be notified of your request.')}
        >
          <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Request Mentorship</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
