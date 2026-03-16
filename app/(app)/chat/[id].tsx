import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const MOCK_MESSAGES = [
  { id: '1', text: 'Come join us for badminton tomorrow!', isSender: false, time: '12:39 PM' },
  { id: '2', text: 'Sure! Who else is coming?', isSender: true, time: '12:40 PM' },
  { id: '3', text: 'James, Yutong and I! See you!', isSender: false, time: '12:41 PM' },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {name || 'Ivy Xu'}
        </Text>
        <View className="w-10" /> {/* Balance for center alignment */}
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
                  source={{ uri: 'https://i.pravatar.cc/150?u=ivy' }}
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
                  source={{ uri: 'https://i.pravatar.cc/150?u=current_user' }}
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
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
