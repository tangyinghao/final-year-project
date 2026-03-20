import React, { useEffect, useState } from 'react';
import { FlatList, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { useAuth } from '@/context/authContext';
import { subscribeToChats } from '@/services/chatService';
import { getUsersByIds } from '@/services/userService';
import { Chat, UserProfile } from '@/types';

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
      return { name: other?.displayName || 'User', avatar: other?.profilePhoto || null, isGroup: false };
    }
    return { name: chat.name || (chat.type === 'cohort' ? `Class of ${chat.cohortYear}` : 'Group Chat'), avatar: null, isGroup: true };
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

  useEffect(() => {
    let total = 0;
    chats.forEach((chat) => {
      const count = (chat as any).unreadCount?.[user?.uid || ''] || 0;
      total += count;
    });
    Notifications.setBadgeCountAsync(total).catch(() => {});
  }, [chats, user?.uid]);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const display = getChatDisplay(chat);
    const lower = searchQuery.toLowerCase();
    return display.name.toLowerCase().includes(lower) || (chat.lastMessage?.text || '').toLowerCase().includes(lower);
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Chats" rightIconName="add" onRightPress={() => router.push('/chat/create')} className="pb-2" />
      <View className="px-4 py-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} className={Platform.OS === 'ios' ? '' : 'py-2'} />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const display = getChatDisplay(item);
          const lastText = item.lastMessage
            ? (item.type !== 'direct' && item.lastMessage.senderName ? `${item.lastMessage.senderName}: ${item.lastMessage.text}` : item.lastMessage.text)
            : 'No messages yet';
          const unreadNum: number = (item as any).unreadCount?.[user?.uid || ''] || 0;

          return (
            <ChatListItem
              name={display.name}
              avatar={display.avatar}
              time={formatTime(item)}
              lastText={lastText}
              unreadCount={unreadNum}
              onPress={() => router.push(`/chat/${item.id}?name=${encodeURIComponent(display.name)}${display.avatar ? `&avatar=${encodeURIComponent(display.avatar)}` : ''}${display.isGroup ? '&isGroup=true' : ''}` as any)}
            />
          );
        }}
        ItemSeparatorComponent={() => <View className="ml-[84px] mr-4 h-px bg-border-default" />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<EmptyState iconName="chatbubbles-outline" message="No chats yet. Start a conversation!" className="pt-20" />}
      />
    </SafeAreaView>
  );
}
