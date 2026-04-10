import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import {
  subscribeToMyInboundRequests,
  subscribeToMyOutboundRequests,
  respondToChatRequest,
} from '@/services/discoveryService';
import { ChatRequest } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';
import { getUsersByIds } from '@/services/userService';
import { UserProfile } from '@/types';

type Tab = 'inbound' | 'outbound';

export default function RequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('inbound');
  const [inbound, setInbound] = useState<ChatRequest[]>([]);
  const [outbound, setOutbound] = useState<ChatRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub1 = subscribeToMyInboundRequests(user.uid, async (reqs) => {
      setInbound(reqs);
      setLoading(false);
      // Fetch profiles for senders
      const uids = reqs.map((r) => r.senderId).filter((uid) => !profiles[uid]);
      if (uids.length > 0) {
        const fetched = await getUsersByIds(uids);
        setProfiles((prev) => {
          const next = { ...prev };
          fetched.forEach((p) => { next[p.uid] = p; });
          return next;
        });
      }
    });

    const unsub2 = subscribeToMyOutboundRequests(user.uid, async (reqs) => {
      setOutbound(reqs);
      // Fetch profiles for recipients
      const uids = reqs.map((r) => r.recipientId).filter((uid) => !profiles[uid]);
      if (uids.length > 0) {
        const fetched = await getUsersByIds(uids);
        setProfiles((prev) => {
          const next = { ...prev };
          fetched.forEach((p) => { next[p.uid] = p; });
          return next;
        });
      }
    });

    return () => { unsub1(); unsub2(); };
  }, [user?.uid]);

  const handleRespond = async (requestId: string, action: 'accept' | 'decline' | 'cancel') => {
    setRespondingTo(requestId);
    try {
      const chatId = await respondToChatRequest(requestId, action);
      if (action === 'accept' && chatId) {
        const req = inbound.find((r) => r.id === requestId);
        const name = req?.senderName || 'Chat';
        router.push(`/chat/${chatId}?name=${encodeURIComponent(name)}` as any);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to respond.');
    } finally {
      setRespondingTo(null);
    }
  };

  const requests = tab === 'inbound' ? inbound : outbound;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Requests</Text>
        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-[#E5E5EA]">
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${tab === 'inbound' ? 'border-b-2 border-[#1B1C62]' : ''}`}
          onPress={() => setTab('inbound')}
        >
          <Text className={`text-[15px] font-medium ${tab === 'inbound' ? 'text-[#1B1C62]' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            Received {inbound.length > 0 ? `(${inbound.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${tab === 'outbound' ? 'border-b-2 border-[#1B1C62]' : ''}`}
          onPress={() => setTab('outbound')}
        >
          <Text className={`text-[15px] font-medium ${tab === 'outbound' ? 'text-[#1B1C62]' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            Sent {outbound.length > 0 ? `(${outbound.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B1C62" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="mail-outline" size={48} color="#C7C7CC" />
          <Text className="text-[16px] text-[#8E8E93] text-center mt-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {tab === 'inbound' ? 'No pending requests received.' : 'No pending requests sent.'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-4">
            {requests.map((req) => {
              const otherUid = tab === 'inbound' ? req.senderId : req.recipientId;
              const otherName = tab === 'inbound' ? req.senderName : req.recipientName;
              const profile = profiles[otherUid];
              const isResponding = respondingTo === req.id;

              return (
                <View key={req.id} className="bg-white border border-[#E5E5EA] rounded-xl p-4 mb-3">
                  <TouchableOpacity
                    className="flex-row items-center mb-3"
                    onPress={() => router.push(`/profile/view/${otherUid}` as any)}
                  >
                    <Image
                      source={profile?.profilePhoto ? { uri: profile.profilePhoto } : DEFAULT_AVATAR}
                      className="w-12 h-12 rounded-full bg-gray-200"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{otherName}</Text>
                      <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                        {profile?.programme || profile?.role || ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                  </TouchableOpacity>

                  {req.introNote && (
                    <View className="bg-[#F6F6F6] rounded-lg px-3 py-2.5 mb-3">
                      <Text className="text-[14px] text-[#4A4A4A] italic" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                        "{req.introNote}"
                      </Text>
                    </View>
                  )}

                  {tab === 'inbound' ? (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className="flex-1 bg-[#1B1C62] py-2.5 rounded-xl items-center"
                        onPress={() => handleRespond(req.id, 'accept')}
                        disabled={isResponding}
                      >
                        {isResponding ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text className="text-white font-bold text-[14px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Accept</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 border border-[#E5E5EA] py-2.5 rounded-xl items-center"
                        onPress={() => handleRespond(req.id, 'decline')}
                        disabled={isResponding}
                      >
                        <Text className="text-[#666] font-bold text-[14px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className="w-full border border-[#D71440] py-2.5 rounded-xl items-center"
                      onPress={() => handleRespond(req.id, 'cancel')}
                      disabled={isResponding}
                    >
                      {isResponding ? (
                        <ActivityIndicator color="#D71440" size="small" />
                      ) : (
                        <Text className="text-[#D71440] font-bold text-[14px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel Request</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
