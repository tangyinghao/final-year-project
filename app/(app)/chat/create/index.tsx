import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { getAllActiveUsers, searchUsers } from '@/services/userService';
import { createDirectChat, createGroupChat } from '@/services/chatService';
import { UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function CreateChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const users = await getAllActiveUsers(user.uid);
      setContacts(users);
      setLoading(false);
    })();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !searchQuery.trim()) return;
    const timeout = setTimeout(async () => {
      const results = await searchUsers(searchQuery.trim(), user.uid);
      setContacts(results);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, user?.uid]);

  const toggleUserSelection = (u: UserProfile) => {
    if (selectedUsers.some((s) => s.uid === u.uid)) {
      setSelectedUsers(selectedUsers.filter((s) => s.uid !== u.uid));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0 || !user) return;
    setCreating(true);
    try {
      let chatId: string;
      if (selectedUsers.length === 1) {
        chatId = await createDirectChat(user.uid, selectedUsers[0].uid);
      } else {
        const name = selectedUsers.map((u) => u.displayName.split(' ')[0]).join(', ');
        chatId = await createGroupChat(
          user.uid,
          selectedUsers.map((u) => u.uid),
          name
        );
      }
      router.replace(
        `/chat/${chatId}?name=${encodeURIComponent(
          selectedUsers.length === 1
            ? selectedUsers[0].displayName
            : selectedUsers.map((u) => u.displayName.split(' ')[0]).join(', ')
        )}${selectedUsers.length > 1 ? '&isGroup=true' : ''}` as any
      );
    } catch (e) {
      console.error('Failed to create chat:', e);
    } finally {
      setCreating(false);
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
          disabled={selectedUsers.length === 0 || creating}
          className="w-16 h-10 items-center justify-center -mr-2"
        >
          {creating ? (
            <ActivityIndicator size="small" color="#1B1C62" />
          ) : (
            <Text
              className={`text-[16px] font-bold ${selectedUsers.length > 0 ? 'text-[#1B1C62]' : 'text-gray-400'}`}
              style={{ fontFamily: 'PlusJakartaSans-Bold' }}
            >
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search / Recipient Area */}
        <View className="px-5 pt-4 pb-2 border-b border-[#E5E5EA]">
          <View className="flex-row items-center flex-wrap gap-2 mb-1">
            <Text className="text-[16px] text-[#8E8E93] mr-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>To:</Text>

            {selectedUsers.map((u) => (
              <View key={u.uid} className="flex-row items-center bg-[#EBF4FE] px-3 py-1.5 rounded-full border border-[#D0E6FC] mb-1">
                <Text className="text-[14px] text-[#1B1C62] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{u.displayName}</Text>
                <TouchableOpacity onPress={() => toggleUserSelection(u)} className="ml-1 items-center justify-center">
                  <Ionicons name="close-circle" size={16} color="#1B1C62" />
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              className="flex-1 text-[16px] text-black py-1 mb-1"
              style={{ fontFamily: 'PlusJakartaSans-Regular' }}
              placeholder={selectedUsers.length === 0 ? 'Search contacts...' : ''}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Algorithm Matching Banner */}
        <TouchableOpacity
          className="m-5 p-4 bg-[#EBF4FE] rounded-xl flex-row items-center justify-between border border-[#D0E6FC]"
          onPress={() => router.push('/chat/smart_match_settings')}
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

        {/* Contacts */}
        <View className="pt-2">
          <Text className="px-5 text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            {searchQuery ? 'Results' : 'Suggested Contacts'}
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#1B1C62" />
          ) : (
            contacts.map((u) => {
              const isSelected = selectedUsers.some((s) => s.uid === u.uid);
              return (
                <TouchableOpacity
                  key={u.uid}
                  className="flex-row items-center px-5 py-3 border-b border-[#E5E5EA] active:bg-gray-50"
                  onPress={() => toggleUserSelection(u)}
                >
                  <Image
                    source={u.profilePhoto ? { uri: u.profilePhoto } : DEFAULT_AVATAR}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{u.displayName}</Text>
                    <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      {u.role === 'alumni' ? `Alumni${u.programme ? ` | ${u.programme}` : ''}` : u.programme || u.role}
                    </Text>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#1B1C62] border-[#1B1C62]' : 'border-[#C7C7CC]'}`}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {!loading && contacts.length === 0 && (
            <View className="items-center pt-10">
              <Text className="text-[15px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                No contacts found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
