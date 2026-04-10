import { DEFAULT_AVATAR } from '@/constants/images';
import { useAuth } from '@/context/authContext';
import { getChat, getChatParticipantIds, markChatAsRead, sendMessage as sendChatMessage, sendFileMessage, sendImageMessage, subscribeToMessages } from '@/services/chatService';
import { getUsersByIds } from '@/services/userService';
import { Message, UserProfile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, name, avatar, isGroup } = useLocalSearchParams();
  const chatId = id as string;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>((name as string) || 'Group Chat');
  const scrollRef = useRef<ScrollView>(null);
  const unsubMessagesRef = useRef<(() => void) | null>(null);

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
    unsubMessagesRef.current = unsub;
    return () => { unsub(); unsubMessagesRef.current = null; };
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      const participantIds = await getChatParticipantIds(chatId);
      const profiles = await getUsersByIds(participantIds);
      setMembers(profiles);
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || isGroup !== 'true') return;
    (async () => {
      const chat = await getChat(chatId);
      if (chat?.groupPhoto) setGroupPhoto(chat.groupPhoto);
      if (chat?.name) setGroupName(chat.name);
    })();
  }, [chatId, isGroup]);

  const openGroupInfo = () => {
    router.push({ pathname: '/chat/group_info', params: { chatId } } as any);
  };

  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ uri: string; name: string } | null>(null);
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
    setPreviewFile({ uri: asset.uri, name: asset.name });
  };

  const handleConfirmSendFile = async () => {
    if (!user || !previewFile) return;
    setSendingAttachment(true);
    try {
      await sendFileMessage(chatId, user.uid, user.displayName, previewFile.uri, previewFile.name);
    } catch {
      Alert.alert('Error', 'Failed to send file.');
    } finally {
      setSendingAttachment(false);
      setPreviewFile(null);
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
              const otherMember = members.find((m) => m.uid !== user?.uid);
              if (otherMember) router.push(`/profile/view/${otherMember.uid}` as any);
            }
          }}
        >
          <Text className="text-[18px] font-bold text-black" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {isGroup === 'true' ? groupName : (name || 'Chat')}
          </Text>
          {isGroup === 'true' && (
            <Text className="text-[11px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Tap for group info</Text>
          )}
        </TouchableOpacity>
        {isGroup === 'true' ? (
          <TouchableOpacity onPress={openGroupInfo} className="w-10 h-10 items-center justify-center">
            <Image
              source={groupPhoto ? { uri: groupPhoto } : DEFAULT_AVATAR}
              className="w-9 h-9 rounded-full"
            />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView ref={scrollRef} className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
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
                  className={`max-w-[75%] ${msg.type === 'image' ? 'rounded-2xl overflow-hidden' : `px-4 py-3 rounded-2xl ${isSender ? 'bg-[#DFF0FF] rounded-br-sm' : 'bg-white rounded-bl-sm border border-[#E5E5EA]'
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
                    <TouchableOpacity onPress={() => Linking.openURL(msg.fileUrl!)}>
                      <View className="flex-row items-center">
                        <Ionicons name="document-text" size={24} color="#1B1C62" />
                        <Text className={`text-[14px] ml-2 flex-shrink ${isSender ? 'text-[#1B1C62]' : 'text-black'}`} numberOfLines={2} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                          {msg.fileName || 'File'}
                        </Text>
                        <Ionicons name="download-outline" size={18} color="#8E8E93" style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>
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
        <View className="bg-white border-t border-[#E5E5EA] px-4 py-3 pb-2">
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

      {/* File Confirmation Before Send */}
      <Modal visible={!!previewFile} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity className="absolute top-12 right-5 z-10 w-10 h-10 items-center justify-center" onPress={() => setPreviewFile(null)}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          {previewFile && (
            <View className="items-center px-8">
              <Ionicons name="document-text" size={64} color="white" />
              <Text className="text-white text-[18px] font-bold mt-4 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }} numberOfLines={3}>
                {previewFile.name}
              </Text>
            </View>
          )}
          <View className="flex-row mt-6 gap-4">
            <TouchableOpacity style={{ width: 120, height: 48 }} className="rounded-xl border border-white/50 items-center justify-center" onPress={() => setPreviewFile(null)}>
              <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 120, height: 48 }} className="rounded-xl bg-[#1B1C62] items-center justify-center" onPress={handleConfirmSendFile} disabled={sendingAttachment}>
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
