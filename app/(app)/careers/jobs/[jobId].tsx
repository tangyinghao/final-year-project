import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSavedItems } from '../../../utils/useSavedItems';

export default function JobDetailScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(jobId as string);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Job Detail
        </Text>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center"
          onPress={() => toggleSave(jobId as string)}
        >
          <Ionicons 
            name={saved ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={saved ? "#FFD700" : "#1B1C62"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View className="bg-white px-5 py-6 border-b border-[#E5E5EA]">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center mr-4">
              <Text className="text-[24px] font-bold text-[#1B1C62]">S</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Software Engineer Intern</Text>
              <Text className="text-[16px] text-[#4A4A4A] mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Shopee • Singapore</Text>
            </View>
          </View>
          
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-full">
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text className="ml-1 text-[13px] text-[#4A4A4A]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Full-time</Text>
            </View>
            <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-full">
              <Ionicons name="cash-outline" size={14} color="#8E8E93" />
              <Text className="ml-1 text-[13px] text-[#4A4A4A]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>$1,500 - $2,500/mth</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-[#EBF4FE] rounded-lg p-3 border border-[#D0E6FC]">
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=marcus' }} className="w-8 h-8 rounded-full bg-gray-200 mr-3" />
            <Text className="flex-1 text-[14px] text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Posted by <Text style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Marcus Chen</Text> (SCSE '22)
            </Text>
          </View>
        </View>

        {/* Content Tabs */}
        <View className="bg-white mt-2 px-5 py-5 border-y border-[#E5E5EA]">
          <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Description</Text>
          <Text className="text-[15px] text-[#4A4A4A] leading-6 mb-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            We are looking for a passionate Software Engineer Intern to join our core backend team. You will be responsible for building scalable microservices and optimizing database performance for millions of concurrent users.
          </Text>

          <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Requirements</Text>
          <View className="mb-2 flex-row pr-4">
            <Text className="text-[15px] text-[#4A4A4A] mr-2">•</Text>
            <Text className="text-[15px] text-[#4A4A4A] leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Currently pursuing a Bachelor's/Master's in Computer Science or related fields.</Text>
          </View>
          <View className="mb-2 flex-row pr-4">
            <Text className="text-[15px] text-[#4A4A4A] mr-2">•</Text>
            <Text className="text-[15px] text-[#4A4A4A] leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Strong fundamentals in Go, Java, or C++.</Text>
          </View>
          <View className="mb-2 flex-row pr-4">
            <Text className="text-[15px] text-[#4A4A4A] mr-2">•</Text>
            <Text className="text-[15px] text-[#4A4A4A] leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Familiarity with MySQL, Redis, or Kafka is a plus.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Action Bar */}
      <View className="px-5 py-4 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity 
          className="w-full h-14 bg-[#1B1C62] rounded-xl flex-row items-center justify-center"
          onPress={() => Alert.alert('Application Submitted', 'Your CV and profile have been sent to the employer.')}
        >
          <Text className="text-white text-[16px] font-bold mr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Apply Now</Text>
          <Ionicons name="paper-plane-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
