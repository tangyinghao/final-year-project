import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { RecipientChip } from '@/components/chat/RecipientChip';
import { SelectableUserRow } from '@/components/chat/SelectableUserRow';
import { SmartMatchBanner } from '@/components/chat/SmartMatchBanner';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useAuth } from '@/context/authContext';
import { getAllActiveUsers, searchUsers } from '@/services/userService';
import { createDirectChat, createGroupChat } from '@/services/chatService';
import { UserProfile } from '@/types';
import { Theme } from '@/constants/theme';

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
        chatId = await createGroupChat(user.uid, selectedUsers.map((u) => u.uid), name);
      }
      router.replace(`/chat/${chatId}?name=${encodeURIComponent(selectedUsers.length === 1 ? selectedUsers[0].displayName : selectedUsers.map((u) => u.displayName.split(' ')[0]).join(', '))}${selectedUsers.length > 1 ? '&isGroup=true' : ''}` as any);
    } catch (e) {
      console.error('Failed to create chat:', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader
        title="New Message"
        leftLabel="Cancel"
        onLeftPress={() => router.back()}
        rightLabel="Create"
        onRightPress={handleCreateChat}
        rightDisabled={selectedUsers.length === 0 || creating}
        rightLoading={creating}
        showBorder
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="border-b border-border-default px-5 pb-2 pt-4">
          <View className="mb-1 flex-row flex-wrap items-center gap-2">
            <Text className="mr-1 text-[16px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>To:</Text>
            {selectedUsers.map((u) => (
              <RecipientChip key={u.uid} label={u.displayName} onRemove={() => toggleUserSelection(u)} />
            ))}
            <TextInput
              className="mb-1 flex-1 py-1 text-[16px] text-black"
              style={{ fontFamily: 'PlusJakartaSans-Regular' }}
              placeholder={selectedUsers.length === 0 ? 'Search contacts...' : ''}
              placeholderTextColor={Theme.colors.input.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <SmartMatchBanner
          title="Smart Match"
          description="Find an Alumni Mentor or Study Buddy using our matching algorithm."
          onPress={() => router.push('/chat/smart_match_settings')}
        />

        <View className="pt-2">
          <SectionLabel label={searchQuery ? 'Results' : 'Suggested Contacts'} className="px-5 mb-2" />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={Theme.colors.brand.primary} />
          ) : (
            contacts.map((u) => {
              const isSelected = selectedUsers.some((s) => s.uid === u.uid);
              return (
                <SelectableUserRow
                  key={u.uid}
                  name={u.displayName}
                  avatar={u.profilePhoto}
                  subtitle={u.role === 'alumni' ? `Alumni${u.programme ? ` | ${u.programme}` : ''}` : u.programme || u.role}
                  selected={isSelected}
                  onPress={() => toggleUserSelection(u)}
                />
              );
            })
          )}

          {!loading && contacts.length === 0 ? (
            <View className="items-center pt-10">
              <Text className="text-[15px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                No contacts found.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
