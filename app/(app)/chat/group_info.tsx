import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/authContext';
import { getChat, getChatParticipantIds, uploadGroupPhoto, removeGroupPhoto, renameGroupChat, updateGroupListing } from '@/services/chatService';
import { leaveGroup } from '@/services/discoveryService';
import { getUsersByIds } from '@/services/userService';
import { UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function GroupInfoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { chatId } = useLocalSearchParams();
  const id = chatId as string;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('Group Chat');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [chatOwner, setChatOwner] = useState<string | null>(null);
  const [listed, setListed] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [capacityDraft, setCapacityDraft] = useState('');
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isOwner = user?.uid === chatOwner;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [chat, participantIds] = await Promise.all([
        getChat(id),
        getChatParticipantIds(id),
      ]);
      if (chat?.groupPhoto) setGroupPhoto(chat.groupPhoto);
      if (chat?.name) setGroupName(chat.name);
      setChatOwner(chat?.owner || null);
      setListed(chat?.listed === true);
      setMaxCapacity(chat?.maxCapacity ?? null);
      setCapacityDraft(chat?.maxCapacity ? String(chat.maxCapacity) : '');

      const profiles = await getUsersByIds(participantIds);
      setMembers(profiles);
      setLoading(false);
    })();
  }, [id]);

  const handleRenameGroup = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === groupName) {
      setEditingName(false);
      return;
    }
    await renameGroupChat(id, trimmed);
    setGroupName(trimmed);
    setEditingName(false);
  };

  const handleToggleListed = async (value: boolean) => {
    setListed(value);
    const cap = capacityDraft.trim() ? parseInt(capacityDraft.trim(), 10) : null;
    const validCap = cap && cap > 0 ? cap : null;
    await updateGroupListing(id, value, validCap);
  };

  const handleSaveCapacity = async () => {
    const cap = capacityDraft.trim() ? parseInt(capacityDraft.trim(), 10) : null;
    const validCap = cap && cap > 0 ? cap : null;
    setMaxCapacity(validCap);
    await updateGroupListing(id, listed, validCap);
  };

  const handleRemoveMember = (member: UserProfile) => {
    Alert.alert('Remove Member', `Remove ${member.displayName} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(id, member.uid);
            setMembers((prev) => prev.filter((m) => m.uid !== member.uid));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to remove member.');
          }
        },
      },
    ]);
  };

  const handlePickGroupPhoto = async () => {
    setShowPhotoMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadGroupPhoto(id, result.assets[0].uri);
      setGroupPhoto(url);
    } catch {
      Alert.alert('Error', 'Failed to upload group photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveGroupPhoto = async () => {
    setShowPhotoMenu(false);
    setUploadingPhoto(true);
    try {
      await removeGroupPhoto(id);
      setGroupPhoto(null);
    } catch {
      Alert.alert('Error', 'Failed to remove group photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#1B1C62" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Group Info</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Group Photo & Name */}
        <View className="items-center pt-8 pb-4">
          <View>
            <Image
              source={groupPhoto ? { uri: groupPhoto } : DEFAULT_AVATAR}
              className="w-24 h-24 rounded-full bg-gray-200"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1B1C62] items-center justify-center border-2 border-white"
              onPress={() => setShowPhotoMenu(!showPhotoMenu)}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="pencil" size={14} color="white" />
              )}
            </TouchableOpacity>
          </View>
          {showPhotoMenu && (
            <View className="bg-white rounded-xl border border-[#E5E5EA] mt-2 overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}>
              <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={handlePickGroupPhoto}>
                <Ionicons name="image-outline" size={18} color="#1B1C62" />
                <Text className="text-[14px] text-black ml-3" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {groupPhoto ? 'Change Photo' : 'Choose Photo'}
                </Text>
              </TouchableOpacity>
              {groupPhoto && (
                <>
                  <View style={{ height: 1, backgroundColor: '#E5E5EA', marginHorizontal: 12 }} />
                  <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={handleRemoveGroupPhoto}>
                    <Ionicons name="trash-outline" size={18} color="#D71440" />
                    <Text className="text-[14px] text-[#D71440] ml-3" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Remove Photo</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View className="mt-4 px-5 w-full">
            {editingName ? (
              <View className="flex-row items-center justify-center">
                <TextInput
                  className="text-[22px] font-bold text-black border-b border-[#1B1C62] py-1 text-center flex-1"
                  style={{ fontFamily: 'PlusJakartaSans-Bold' }}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  autoFocus
                  maxLength={50}
                  onSubmitEditing={handleRenameGroup}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={handleRenameGroup} className="ml-2 w-8 h-8 items-center justify-center">
                  <Ionicons name="checkmark" size={22} color="#1B1C62" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="items-center" onPress={() => { setNameDraft(groupName); setEditingName(true); }}>
                <View className="flex-row items-center">
                  <Text className="text-[22px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{groupName}</Text>
                  <Ionicons name="pencil-outline" size={16} color="#8E8E93" style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            )}
            <Text className="text-[14px] text-[#8E8E93] text-center mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              {members.length} members
            </Text>
          </View>
        </View>

        {/* Smart Match Listing: owner only */}
        {isOwner && (
          <View className="mx-5 mb-4 border border-border-info bg-surface-info rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="sparkles" size={16} color="#1B1C62" />
              <Text className="text-[15px] font-bold text-ntu-primary ml-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                Smart Match Discovery
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-[15px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>List in Discovery</Text>
                <Text className="text-[12px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  Allow others to find and join this group
                </Text>
              </View>
              <Switch
                value={listed}
                onValueChange={handleToggleListed}
                trackColor={{ false: '#E5E5EA', true: '#1B1C62' }}
                thumbColor="white"
              />
            </View>
            {listed && (
              <View className="flex-row items-center">
                <Text className="text-[14px] text-black mr-3" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Max members:</Text>
                <TextInput
                  className="border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[14px] text-black w-16 text-center"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  value={capacityDraft}
                  onChangeText={setCapacityDraft}
                  onBlur={handleSaveCapacity}
                  keyboardType="number-pad"
                  placeholder="∞"
                  placeholderTextColor="#C7C7CC"
                  maxLength={3}
                />
              </View>
            )}
          </View>
        )}

        {/* Members */}
        <View className="px-5">
          <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            Members ({members.length})
          </Text>
          {members.map((member) => {
            const isYou = member.uid === user?.uid;
            const isMemberOwner = member.uid === chatOwner;
            return (
              <TouchableOpacity
                key={member.uid}
                className="flex-row items-center py-3 border-b border-[#F2F2F7]"
                onPress={() => {
                  if (!isYou) {
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
                  <View className="flex-row items-center">
                    <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                      {member.displayName}
                      {isYou && <Text className="text-[#8E8E93] font-normal"> (you)</Text>}
                    </Text>
                    {isMemberOwner && (
                      <View className="bg-[#EBF4FE] px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-[11px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Owner</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                    {member.programme || member.role}
                  </Text>
                </View>
                {!isYou && isOwner && (
                  <TouchableOpacity
                    className="w-8 h-8 items-center justify-center mr-1"
                    onPress={(e) => { e.stopPropagation(); handleRemoveMember(member); }}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color="#D71440" />
                  </TouchableOpacity>
                )}
                {!isYou && <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Leave Group */}
        <View className="px-5 pt-6 pb-8">
          <TouchableOpacity
            className="w-full border border-[#D71440] py-3 rounded-xl items-center justify-center"
            onPress={() => {
              Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Leave',
                  style: 'destructive',
                  onPress: () => {
                    router.dismissAll();
                    leaveGroup(id);
                  },
                },
              ]);
            }}
          >
            <Text className="text-[#D71440] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
