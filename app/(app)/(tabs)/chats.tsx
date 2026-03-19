import React from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const MOCK_CHATS = [
  {
    id: '1',
    name: 'Ivy Xu',
    message: 'Come join us for badminton tomorrow!',
    time: '12:39 PM',
    avatar: 'https://i.pravatar.cc/150?u=ivy',
    unread: 2,
  },
  {
    id: 'g1',
    name: 'Academic/SCSE Study Group',
    message: 'Sarah: Great, see everyone Thursday!',
    time: '11:15 AM',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    unread: 1,
    isGroup: true,
  },
  {
    id: '3',
    name: 'Shiva',
    message: 'Looking forward to the hackathon this weekend.',
    time: 'Yesterday',
    avatar: 'https://i.pravatar.cc/150?u=shiva',
    unread: 1,
  },
  {
    id: '4',
    name: 'Yutong',
    message: 'See you there!',
    time: 'Yesterday',
    avatar: 'https://i.pravatar.cc/150?u=yutong',
    unread: 0,
  },
];

export default function ChatsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredChats = MOCK_CHATS.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        {/* Placeholder for balance */}
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
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            // @ts-ignore
            onPress={() => router.push(`/chat/${item.id}?name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar)}${item.isGroup ? '&isGroup=true' : ''}`)}
          >
            <Image
              source={{ uri: item.avatar }}
              className="w-[52px] h-[52px] rounded-full bg-gray-200"
            />
            <View className="flex-1 ml-4 justify-center">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {item.name}
                </Text>
                <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  {item.time}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-[14px] text-[#8E8E93] flex-1 mr-2"
                  numberOfLines={1}
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                >
                  {item.message}
                </Text>
                {item.unread > 0 && (
                  <View className="bg-[#1B1C62] w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-[11px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                      {item.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View className="h-[1px] bg-[#E5E5EA] ml-[84px] mr-4" />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
