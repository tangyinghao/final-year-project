import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const MOCK_GROUP_MEMBERS = [
  { id: 1, name: 'Marcus Chen', role: 'Software Eng @ Grab', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: 2, name: 'Sarah Lim', role: 'CS Year 3 student', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 3, name: 'Dr. Michael Tan', role: 'Alumni | Data Scientist', avatar: 'https://i.pravatar.cc/150?u=michael' },
  { id: 4, name: 'You', role: 'MSc EEE', avatar: 'https://i.pravatar.cc/150?u=you' },
];

const MOCK_MESSAGES = [
  { id: '1', text: 'Come join us for badminton tomorrow!', isSender: false, time: '12:39 PM' },
  { id: '2', text: 'Sure! Who else is coming?', isSender: true, time: '12:40 PM' },
  { id: '3', text: 'James, Yutong and I! See you!', isSender: false, time: '12:41 PM' },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id, name, avatar, isGroup } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const openGroupInfo = () => {
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(300);
    sheetScale.setValue(0.95);
    setShowGroupInfo(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeGroupInfo = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 0.95, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowGroupInfo(false));
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, { id: Date.now().toString(), text: inputText, isSender: true, time: 'Just now' }]);
      setInputText('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center mx-4"
          onPress={() => {
            if (isGroup === 'true') {
              openGroupInfo();
            } else {
              router.push(`/profile/view/${id}` as any);
            }
          }}
        >
          <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {name || 'Ivy Xu'}
          </Text>
          {isGroup === 'true' && (
            <Text className="text-[11px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Tap for group info</Text>
          )}
        </TouchableOpacity>
        {/* Balance for center alignment */}
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Timestamp */}
          <Text className="text-center text-[11px] text-[#8E8E93] mb-6" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            30 Sep 2025 12:39PM
          </Text>

          {/* Messages */}
          {MOCK_MESSAGES.map((msg) => (
            <View key={msg.id} className={`flex-row mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
              {!msg.isSender && (
                <Image
                  source={{ uri: typeof avatar === 'string' ? avatar : 'https://i.pravatar.cc/150?u=ivy' }}
                  className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                />
              )}

              <View
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.isSender ? 'bg-[#DFF0FF] rounded-br-sm' : 'bg-white rounded-bl-sm border border-[#E5E5EA]'
                }`}
              >
                <Text
                  className={`text-[15px] leading-5 ${msg.isSender ? 'text-[#1B1C62]' : 'text-black'}`}
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                >
                  {msg.text}
                </Text>
              </View>

              {msg.isSender && (
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?u=you' }}
                  className="w-8 h-8 rounded-full ml-2 self-end mb-1"
                />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="bg-white border-t border-[#E5E5EA] px-4 py-3 pb-8">
          <View className="flex-row items-end bg-[#F6F6F6] rounded-3xl p-1 pr-2">
            <TextInput
              className="flex-1 px-4 pt-3 pb-3 max-h-[100px] text-[16px] text-black"
              style={{ fontFamily: 'PlusJakartaSans-Regular' }}
              placeholder="Message"
              placeholderTextColor="#8E8E93"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              className={`w-9 h-9 rounded-full items-center justify-center mb-1 ${inputText.trim() ? 'bg-[#1B1C62]' : 'bg-[#E5E5EA]'}`}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <Modal visible={showGroupInfo} transparent animationType="none" onRequestClose={closeGroupInfo}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: overlayOpacity,
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeGroupInfo} />
          </Animated.View>
          <Animated.View style={{ maxHeight: '70%', transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }] }}>
            <View className="bg-white rounded-t-2xl px-5 pb-8 pt-3">
              <View className="w-10 h-1 bg-[#E5E5EA] rounded-full self-center mb-4" />

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{name}</Text>
                <TouchableOpacity onPress={closeGroupInfo} className="w-8 h-8 items-center justify-center">
                  <Ionicons name="close" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <Text className="text-[13px] text-[#8E8E93] uppercase mb-3 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Members ({MOCK_GROUP_MEMBERS.length})</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {MOCK_GROUP_MEMBERS.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    className="flex-row items-center py-3 border-b border-[#F2F2F7]"
                    onPress={() => {
                      if (member.name !== 'You') {
                        closeGroupInfo();
                        router.push(`/profile/view/${member.id}` as any);
                      }
                    }}
                    disabled={member.name === 'You'}
                  >
                    <Image source={{ uri: member.avatar }} className="w-11 h-11 rounded-full bg-gray-200" />
                    <View className="flex-1 ml-3 justify-center">
                      <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                        {member.name}
                        {member.name === 'You' && <Text className="text-[#8E8E93] font-normal"> (you)</Text>}
                      </Text>
                      <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{member.role}</Text>
                    </View>
                    {member.name !== 'You' && (
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                className="w-full border border-[#D71440] py-3 rounded-xl items-center justify-center mt-4"
                onPress={() => {
                  setShowGroupInfo(false);
                  router.back();
                }}
              >
                <Text className="text-[#D71440] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Leave Group</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
