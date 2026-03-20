import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { subscribeToChats } from '@/services/chatService';
import { getUsersByIds } from '@/services/userService';
import { Chat, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, UserProfile>>({});
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToChats(user.uid, async (chatList) => {
      setChats(chatList);
      // Fetch participant profiles for direct chats
      const otherUids = new Set<string>();
      chatList.forEach((c) => {
        if (c.type === 'direct') {
          c.participants.forEach((p) => {
            if (p !== user.uid) otherUids.add(p);
          });
        }
      });
      if (otherUids.size > 0) {
        const profiles = await getUsersByIds(Array.from(otherUids));
        const map: Record<string, UserProfile> = {};
        profiles.forEach((p) => { map[p.uid] = p; });
        setParticipantProfiles((prev) => ({ ...prev, ...map }));
      }
    });
    return unsub;
  }, [user?.uid]);

  const getChatDisplay = (chat: Chat) => {
    if (chat.type === 'direct') {
      const otherId = chat.participants.find((p) => p !== user?.uid);
      const other = otherId ? participantProfiles[otherId] : null;
      return {
        name: other?.displayName || 'User',
        avatar: other?.profilePhoto || null,
        isGroup: false,
      };
    }
    return {
      name: chat.name || (chat.type === 'cohort' ? `Class of ${chat.cohortYear}` : 'Group Chat'),
      avatar: null,
      isGroup: true,
    };
  };

  const formatTime = (chat: Chat) => {
    if (!chat.lastMessage?.timestamp) return '';
    const date = chat.lastMessage.timestamp.toDate();
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'Yesterday';
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const display = getChatDisplay(chat);
    const lower = searchQuery.toLowerCase();
    return (
      display.name.toLowerCase().includes(lower) ||
      (chat.lastMessage?.text || '').toLowerCase().includes(lower)
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        <View className="w-8" />
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Chats</Text>
        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          onPress={() => router.push('/chat/create')}
        >
          <Ionicons name="add" size={28} color="#1B1C62" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-[#F6F6F6] rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-2 text-black text-[16px]"
            style={{ fontFamily: 'PlusJakartaSans-Regular', height: Platform.OS === 'ios' ? 24 : 40 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const display = getChatDisplay(item);
          const lastText = item.lastMessage
            ? (item.type !== 'direct' && item.lastMessage.senderName
                ? `${item.lastMessage.senderName}: ${item.lastMessage.text}`
                : item.lastMessage.text)
            : 'No messages yet';

          const isUnread = !!(item as any).unreadBy?.[user?.uid || ''];

          return (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 active:bg-gray-50"
              onPress={() =>
                router.push(
                  `/chat/${item.id}?name=${encodeURIComponent(display.name)}${display.avatar ? `&avatar=${encodeURIComponent(display.avatar)}` : ''}${display.isGroup ? '&isGroup=true' : ''}` as any
                )
              }
            >
              <Image
                source={display.avatar ? { uri: display.avatar } : DEFAULT_AVATAR}
                className="w-[52px] h-[52px] rounded-full bg-gray-200"
              />
              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className={`text-[16px] font-bold ${isUnread ? 'text-black' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                    {display.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className={`text-[13px] ${isUnread ? 'text-[#1B1C62]' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      {formatTime(item)}
                    </Text>
                    {isUnread && (
                      <View className="w-3 h-3 rounded-full bg-[#1B1C62] ml-2" />
                    )}
                  </View>
                </View>
                <Text
                  className={`text-[14px] flex-1 mr-2 ${isUnread ? 'text-black font-semibold' : 'text-[#8E8E93]'}`}
                  numberOfLines={1}
                  style={{ fontFamily: isUnread ? 'PlusJakartaSans-SemiBold' : 'PlusJakartaSans-Regular' }}
                >
                  {lastText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-[1px] bg-[#E5E5EA] ml-[84px] mr-4" />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center justify-center pt-20">
            <Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
            <Text className="text-[16px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              No chats yet. Start a conversation!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
