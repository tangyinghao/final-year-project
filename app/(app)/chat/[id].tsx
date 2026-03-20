import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Animated, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/context/authContext';
import { subscribeToMessages, sendMessage as sendChatMessage, sendImageMessage, sendFileMessage, getChatParticipantIds, markChatAsRead } from '@/services/chatService';
import { getUsersByIds } from '@/services/userService';
import { Message, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, name, avatar, isGroup } = useLocalSearchParams();
  const chatId = id as string;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!chatId) return;
    // Mark chat as read when opened
    if (user?.uid) markChatAsRead(chatId, user.uid);
    const unsub = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      // Mark as read whenever new messages arrive
      if (user?.uid) markChatAsRead(chatId, user.uid);
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      const participantIds = await getChatParticipantIds(chatId);
      const profiles = await getUsersByIds(participantIds);
      setMembers(profiles);
    })();
  }, [chatId]);

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

  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user) return;
    const text = inputText.trim();
    setInputText('');
    await sendChatMessage(chatId, user.uid, user.displayName, text);
  };

  const toggleAttachMenu = () => {
    if (!user || sendingAttachment) return;
    setShowAttachMenu((v) => !v);
  };

  const handlePickImage = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('File Too Large', 'Images must be under 10MB.');
      return;
    }
    setPreviewImage(asset.uri);
  };

  const handleConfirmSendImage = async () => {
    if (!user || !previewImage) return;
    setSendingAttachment(true);
    try {
      await sendImageMessage(chatId, user.uid, user.displayName, previewImage);
    } catch {
      Alert.alert('Error', 'Failed to send image.');
    } finally {
      setSendingAttachment(false);
      setPreviewImage(null);
    }
  };

  const handlePickFile = async () => {
    if (!user) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_SIZE) {
      Alert.alert('File Too Large', 'Files must be under 10MB.');
      return;
    }
    setSendingAttachment(true);
    try {
      await sendFileMessage(chatId, user.uid, user.displayName, asset.uri, asset.name);
    } catch {
      Alert.alert('Error', 'Failed to send file.');
    } finally {
      setSendingAttachment(false);
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
              // For direct chats, find the other user's ID
              const otherMember = members.find((m) => m.uid !== user?.uid);
              if (otherMember) router.push(`/profile/view/${otherMember.uid}` as any);
            }
          }}
        >
          <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {name || 'Chat'}
          </Text>
          {isGroup === 'true' && (
            <Text className="text-[11px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Tap for group info</Text>
          )}
        </TouchableOpacity>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView ref={scrollRef} className="flex-1 px-4 pt-4" contentContainerStyle={{paddingBottom: 16}} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => {
            const isSender = msg.senderId === user?.uid;
            const senderProfile = members.find((m) => m.uid === msg.senderId);
            return (
              <View key={msg.id} className={`flex-row mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
                {!isSender && (
                  <Image
                    source={senderProfile?.profilePhoto ? { uri: senderProfile.profilePhoto } : (typeof avatar === 'string' ? { uri: avatar } : DEFAULT_AVATAR)}
                    className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                  />
                )}
                <View
                  className={`max-w-[75%] ${msg.type === 'image' ? 'rounded-2xl overflow-hidden' : `px-4 py-3 rounded-2xl ${
                    isSender ? 'bg-[#DFF0FF] rounded-br-sm' : 'bg-white rounded-bl-sm border border-[#E5E5EA]'
                  }${msg.type === 'file' ? ' px-2 py-2' : ''}`}`}
                >
                  {!isSender && isGroup === 'true' && (
                    <Text className={`text-[11px] text-[#8E8E93] mb-1 ${msg.type === 'image' ? 'px-2 pt-2' : ''}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                      {msg.senderName}
                    </Text>
                  )}
                  {msg.type === 'image' && msg.imageUrl ? (
                    <TouchableOpacity activeOpacity={0.85} onPress={() => setFullViewImage(msg.imageUrl)}>
                      <Image
                        source={{ uri: msg.imageUrl }}
                        style={{ width: 200, height: 200, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : msg.type === 'file' && msg.fileUrl ? (
                    <View className="flex-row items-center px-3 py-2">
                      <Ionicons name="document-text" size={24} color="#1B1C62" />
                      <Text className={`text-[14px] ml-2 flex-1 ${isSender ? 'text-[#1B1C62]' : 'text-black'}`} numberOfLines={2} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                        {msg.fileName || 'File'}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className={`text-[15px] leading-5 ${isSender ? 'text-[#1B1C62]' : 'text-black'}`}
                      style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>
                {isSender && (
                  <Image
                    source={user?.profilePhoto ? { uri: user.profilePhoto } : DEFAULT_AVATAR}
                    className="w-8 h-8 rounded-full ml-2 self-end mb-1"
                  />
                )}
              </View>
            );
          })}

          {messages.length === 0 && (
            <View className="items-center pt-10">
              <Text className="text-[15px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                No messages yet. Say hello!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="bg-white border-t border-[#E5E5EA] px-4 py-3 pb-8">
          {/* Attach popover */}
          {showAttachMenu && (
            <>
              <TouchableOpacity
                style={{ position: 'absolute', top: -1000, left: -1000, right: -1000, bottom: -1000, zIndex: 5 }}
                activeOpacity={1}
                onPress={() => setShowAttachMenu(false)}
              />
              <View style={{ position: 'absolute', bottom: 72, left: 12, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }} className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
                <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={() => { setShowAttachMenu(false); handlePickImage(); }}>
                  <Ionicons name="image-outline" size={20} color="#1B1C62" />
                  <Text className="ml-3 text-[15px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Photo</Text>
                </TouchableOpacity>
                <View className="h-[1px] bg-[#E5E5EA] mx-2" />
                <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={() => { setShowAttachMenu(false); handlePickFile(); }}>
                  <Ionicons name="document-outline" size={20} color="#1B1C62" />
                  <Text className="ml-3 text-[15px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>File</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View className="flex-row items-end">
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center mb-1 mr-2 bg-[#F6F6F6]"
              onPress={toggleAttachMenu}
              disabled={sendingAttachment}
            >
              {sendingAttachment ? (
                <ActivityIndicator size="small" color="#1B1C62" />
              ) : (
                <Ionicons name="add" size={24} color="#1B1C62" />
              )}
            </TouchableOpacity>
            <View className="flex-1 flex-row items-end bg-[#F6F6F6] rounded-3xl p-1 pr-2">
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
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <Ionicons name="arrow-up" size={20} color="white" />
              </TouchableOpacity>
            </View>
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

              <Text className="text-[13px] text-[#8E8E93] uppercase mb-3 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                Members ({members.length})
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {members.map((member) => {
                  const isYou = member.uid === user?.uid;
                  return (
                    <TouchableOpacity
                      key={member.uid}
                      className="flex-row items-center py-3 border-b border-[#F2F2F7]"
                      onPress={() => {
                        if (!isYou) {
                          closeGroupInfo();
                          router.push(`/profile/view/${member.uid}` as any);
                        }
                      }}
                      disabled={isYou}
                    >
                      <Image
                        source={member.profilePhoto ? { uri: member.profilePhoto } : DEFAULT_AVATAR}
                        className="w-11 h-11 rounded-full bg-gray-200"
                      />
                      <View className="flex-1 ml-3 justify-center">
                        <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                          {member.displayName}
                          {isYou && <Text className="text-[#8E8E93] font-normal"> (you)</Text>}
                        </Text>
                        <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                          {member.programme || member.role}
                        </Text>
                      </View>
                      {!isYou && <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />}
                    </TouchableOpacity>
                  );
                })}
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

      {/* Image Preview Before Send */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity className="absolute top-12 right-5 z-10 w-10 h-10 items-center justify-center" onPress={() => setPreviewImage(null)}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={{ width: Dimensions.get('window').width - 40, height: Dimensions.get('window').height * 0.6 }} resizeMode="contain" />
          )}
          <View className="flex-row mt-6 gap-4">
            <TouchableOpacity style={{ width: 120, height: 48 }} className="rounded-xl border border-white/50 items-center justify-center" onPress={() => setPreviewImage(null)}>
              <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 120, height: 48 }} className="rounded-xl bg-[#1B1C62] items-center justify-center" onPress={handleConfirmSendImage} disabled={sendingAttachment}>
              {sendingAttachment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Image Viewer */}
      <Modal visible={!!fullViewImage} transparent animationType="fade">
        <View className="flex-1 bg-black justify-center items-center">
          <TouchableOpacity className="absolute top-12 right-5 z-10 w-10 h-10 items-center justify-center" onPress={() => setFullViewImage(null)}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          {fullViewImage && (
            <Image source={{ uri: fullViewImage }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }} resizeMode="contain" />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}
