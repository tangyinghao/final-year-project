import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function EditProfileScreen() {
  const router = useRouter();
  
  // Mock initial state
  const [name, setName] = useState('Jane Doe');
  const [bio, setBio] = useState('Senior Data Scientist at Google. Passionate about AI and data pipelines. Looking to mentor students.');
  const [gradYear, setGradYear] = useState('2018');
  const [major, setMajor] = useState('Computer Science');

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F6]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-2 -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Edit Profile
        </Text>
        <TouchableOpacity className="px-2 py-2 -mr-2">
          <Text className="text-[16px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Avatar Edit */}
          <View className="items-center py-8 bg-white mb-2">
            <View className="relative">
              <Image
                source={{ uri: 'https://i.pravatar.cc/300?u=sarah' }}
                className="w-28 h-28 rounded-full shadow-sm"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-[#1B1C62] w-9 h-9 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-[14px] font-bold text-[#1B1C62] mt-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Change Profile Photo</Text>
          </View>

          {/* Form Fields Section 1 */}
          <View className="bg-white border-y border-[#E5E5EA] mb-6">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E5E5EA]">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Name</Text>
              <TextInput
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
              />
            </View>
            <View className="flex-row items-start px-4 py-3">
              <Text className="w-24 text-[16px] text-black pt-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Bio</Text>
              <TextInput
                className="flex-1 text-[16px] text-black leading-5 min-h-[80px]"
                style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top' }}
                value={bio}
                onChangeText={setBio}
                placeholder="Write a short bio..."
                multiline
              />
            </View>
          </View>

          {/* Form Fields Section 2 */}
          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>NTU Academic Info</Text>
          <View className="bg-white border-y border-[#E5E5EA] mb-8">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E5E5EA]">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Major</Text>
              <TextInput
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                value={major}
                onChangeText={setMajor}
                placeholder='e.g. Computer Science'
              />
            </View>
            <View className="flex-row items-center px-4 py-3">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Class of</Text>
              <TextInput
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                value={gradYear}
                onChangeText={setGradYear}
                keyboardType="numeric"
                placeholder='e.g. 2024'
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
