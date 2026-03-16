import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-2 -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          New Event
        </Text>
        <TouchableOpacity className="px-2 py-2 -mr-2">
          <Text className="text-[16px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Title Input */}
          <View className="px-5 pt-6 pb-2">
            <TextInput
              className="text-[28px] font-bold text-black"
              style={{ fontFamily: 'PlusJakartaSans-Bold' }}
              placeholder="Event Title..."
              placeholderTextColor="#C7C7CC"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Media Upload */}
          <View className="px-5 py-4">
            <TouchableOpacity className="w-full h-[140px] rounded-xl border-2 border-dashed border-[#C7C7CC] bg-[#F6F6F6] items-center justify-center">
              <Ionicons name="camera-outline" size={32} color="#8E8E93" />
              <Text className="text-[15px] text-[#8E8E93] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Add Cover Image</Text>
            </TouchableOpacity>
          </View>

          {/* Date & Time Rows */}
          <View className="mt-4 px-5">
            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Date</Text>
              <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                <Text className="text-[15px] font-medium text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Today</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Time</Text>
              <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                <Text className="text-[15px] font-medium text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>14:00</Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="px-5 mt-6 mb-4">
            <View className="flex-row items-center bg-[#F6F6F6] rounded-xl px-4 py-3">
              <Ionicons name="location-outline" size={24} color="#8E8E93" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', height: 24 }}
                placeholder="Add Location"
                placeholderTextColor="#8E8E93"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Description */}
          <View className="px-5 mb-4">
            <View className="bg-[#F6F6F6] rounded-xl px-4 py-3 min-h-[120px]">
              <TextInput
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top' }}
                placeholder="What is this event about?"
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Capacity */}
          <View className="px-5 mb-10">
            <View className="flex-row items-center justify-between py-4 border-y border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Max capacity</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="bg-[#F6F6F6] rounded-lg px-3 py-1.5 w-16 text-center text-[15px] text-black font-medium"
                  style={{ fontFamily: 'PlusJakartaSans-Medium' }}
                  placeholder="20"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="number-pad"
                  value={capacity}
                  onChangeText={setCapacity}
                />
                <Text className="text-[15px] text-[#8E8E93] ml-2" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>people</Text>
              </View>
            </View>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
