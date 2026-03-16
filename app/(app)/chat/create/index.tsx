import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const SUGGESTED_CONTACTS = [
  { id: 1, name: 'Marcus Chen', role: 'Software Eng @ Grab', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: 2, name: 'Sarah Lim', role: 'CS Year 3 student', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 3, name: 'Dr. Michael Tan', role: 'Alumni | Data Scientist', avatar: 'https://i.pravatar.cc/150?u=michael' },
];

export default function CreateChatScreen() {
  const router = useRouter();
  
  // Set default selected user to "Marcus Chen" as requested
  const [selectedUsers, setSelectedUsers] = useState<any[]>([SUGGESTED_CONTACTS[0]]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleUserSelection = (user: any) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateChat = () => {
    if (selectedUsers.length > 0) {
      // In production, instantiate Firestore chat thread here
      // For testing, just go to the chat detail screen
      router.push('/chat/detail');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-16 h-10 items-center justify-center -ml-2">
          <Text className="text-[16px] text-gray-500" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Cancel</Text>
        </TouchableOpacity>
        
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          New Message
        </Text>

        <TouchableOpacity 
          onPress={handleCreateChat} 
          disabled={selectedUsers.length === 0}
          className="w-16 h-10 items-center justify-center -mr-2"
        >
          <Text 
            className={`text-[16px] font-bold ${selectedUsers.length > 0 ? 'text-[#1B1C62]' : 'text-gray-400'}`} 
            style={{ fontFamily: 'PlusJakartaSans-Bold' }}
          >
            Create
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search / Recipient Area */}
        <View className="px-5 pt-4 pb-2 border-b border-[#E5E5EA]">
          <View className="flex-row items-center flex-wrap gap-2 mb-1">
            <Text className="text-[16px] text-[#8E8E93] mr-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>To:</Text>
            
            {selectedUsers.length > 0 && selectedUsers.map(user => (
              <View key={user.id} className="flex-row items-center bg-[#EBF4FE] px-3 py-1.5 rounded-full border border-[#D0E6FC] mb-1">
                <Text className="text-[14px] text-[#1B1C62] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{user.name}</Text>
                <TouchableOpacity onPress={() => toggleUserSelection(user)} className="ml-1 items-center justify-center">
                  <Ionicons name="close-circle" size={16} color="#1B1C62" />
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              className="flex-1 text-[16px] text-black py-1 mb-1"
              style={{ fontFamily: 'PlusJakartaSans-Regular' }}
              placeholder={selectedUsers.length === 0 ? "Search contacts..." : ""}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Algorithm Matching Banner */}
        <TouchableOpacity 
          className="m-5 p-4 bg-[#EBF4FE] rounded-xl flex-row items-center justify-between border border-[#D0E6FC]"
          onPress={() => router.push('/chat/smart_match_settings')} // Route to smart match settings screen
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <Ionicons name="sparkles" size={18} color="#1B1C62" />
              <Text className="text-[15px] font-bold text-[#1B1C62] ml-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Smart Match</Text>
            </View>
            <Text className="text-[13px] text-[#4A4A4A]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Find an Alumni Mentor or Study Buddy using our matching algorithm.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1B1C62" />
        </TouchableOpacity>

        {/* Suggested Contacts */}
        <View className="pt-2">
          <Text className="px-5 text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Suggested Contacts</Text>
          {SUGGESTED_CONTACTS.map((user) => {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            return (
              <TouchableOpacity 
                key={user.id} 
                className="flex-row items-center px-5 py-3 border-b border-[#E5E5EA] active:bg-gray-50"
                onPress={() => toggleUserSelection(user)}
              >
                <Image source={{ uri: user.avatar }} className="w-12 h-12 rounded-full bg-gray-200" />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{user.name}</Text>
                  <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{user.role}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#1B1C62] border-[#1B1C62]' : 'border-[#C7C7CC]'}`}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
