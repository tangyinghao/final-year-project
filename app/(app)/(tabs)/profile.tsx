import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const MENU_ITEMS = [
  { icon: 'map-outline', title: 'Personal Footprint Map', route: '/profile/footprint' },
  { icon: 'notifications-outline', title: 'Notifications', route: '/notifications' },
  { icon: 'help-circle-outline', title: 'Help & Support', route: '/profile/help' },
];

export default function ProfileScreen() {
  const router = useRouter();
  
  const handleLogout = () => {
    // For testing, just go back to login 
    router.replace('/logIn');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="items-center justify-center px-4 pb-6">
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <TouchableOpacity 
          className="flex-row items-center px-4 py-4 mb-4 active:bg-gray-50 border-b border-[#E5E5EA]"
          // @ts-ignore
          onPress={() => router.push('/profile/edit')} // Adjust if edit page is nested or flat
        >
          <Image
            source={{ uri: 'https://i.pravatar.cc/200?u=user' }}
            className="w-20 h-20 rounded-full bg-gray-200"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-[22px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Jane Doe</Text>
            <View className="bg-[#1B1C62] self-start px-3 py-1 rounded-full">
              <Text className="text-white text-[12px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Alumni</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
        </TouchableOpacity>

        {/* Menu List */}
        <View className="px-4">
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity 
                className="flex-row items-center py-4 active:bg-gray-50"
                // @ts-ignore
                onPress={() => router.push(item.route as any)}
              >
                <View className="w-8 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={24} color="#1B1C62" />
                </View>
                <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && (
                <View className="h-[1px] bg-[#E5E5EA] ml-11" />
              )}
            </React.Fragment>
          ))}
          <View className="h-[1px] bg-[#E5E5EA] ml-11" />
          
          <View className="flex-row items-center py-4 active:bg-gray-50 pr-2">
            <View className="w-8 items-center justify-center mr-3">
              <Ionicons name="information-circle-outline" size={24} color="#1B1C62" />
            </View>
            <Text className="flex-1 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              About MSCircle
            </Text>
            <Text className="text-[14px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-10 mb-8">
          <TouchableOpacity 
            className="w-full py-3 items-center justify-center rounded-xl border border-[#D71440]"
            onPress={handleLogout}
          >
            <Text className="text-[#D71440] font-bold text-[16px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
