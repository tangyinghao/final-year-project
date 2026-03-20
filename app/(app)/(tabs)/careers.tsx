import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSavedItems } from '@/hooks/useSavedItems';
import { getApprovedJobs, getApprovedMentorships } from '@/services/careerService';
import { Job, Mentorship } from '@/types';

const TAGS = ['All', 'Saved', 'Engineering', 'Data', 'Design', 'Marketing'];

export default function CareersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Jobs');
  const [activeTag, setActiveTag] = useState('All');
  const { savedItems, toggleSave } = useSavedItems();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [j, m] = await Promise.all([getApprovedJobs(), getApprovedMentorships()]);
      setJobs(j);
      setMentorships(m);
      setLoading(false);
    })();
  }, []);

  const currentData = activeTab === 'Jobs'
    ? jobs.map((j) => ({ id: j.id, title: j.title, company: j.company, location: j.location, poster: j.posterName, tags: j.tags }))
    : mentorships.map((m) => ({ id: m.id, title: m.title, company: m.company, location: m.location, poster: m.mentorName, tags: m.tags }));

  const filteredData = activeTag === 'Saved'
    ? currentData.filter(item => savedItems.includes(item.id))
    : currentData.filter(item => activeTag === 'All' || item.tags.includes(activeTag));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 pb-4">
        <View className="w-8 h-8" />
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Careers</Text>
        <TouchableOpacity className="w-8 h-8 rounded-full items-center justify-center" onPress={() => router.push('/careers/jobs/submit')}>
          <Ionicons name="add" size={28} color="#1B1C62" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View className="px-4 mb-4">
        <View className="flex-row rounded-lg border border-[#1B1C62] overflow-hidden">
          <TouchableOpacity className={`flex-1 py-2 items-center justify-center ${activeTab === 'Jobs' ? 'bg-[#1B1C62]' : 'bg-white'}`} onPress={() => setActiveTab('Jobs')}>
            <Text className={`font-bold text-[14px] ${activeTab === 'Jobs' ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: activeTab === 'Jobs' ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`flex-1 py-2 items-center justify-center ${activeTab === 'Mentorship' ? 'bg-[#1B1C62]' : 'bg-white'}`} onPress={() => setActiveTab('Mentorship')}>
            <Text className={`font-bold text-[14px] ${activeTab === 'Mentorship' ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: activeTab === 'Mentorship' ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>Mentorship</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags Filter */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {TAGS.map((tag) => (
            <TouchableOpacity key={tag} onPress={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full mr-2 ${activeTag === tag ? (tag === 'Saved' ? 'bg-[#FFD700]' : 'bg-[#1B1C62]') : 'bg-[#F6F6F6]'}`}>
              <Text className={`text-[13px] ${activeTag === tag ? (tag === 'Saved' ? 'text-black font-bold' : 'text-white font-bold') : 'text-[#8E8E93]'}`}
                style={{ fontFamily: activeTag === tag ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>{tag}</Text>
            </TouchableOpacity>
          ))}
          <View className="w-8" />
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm border border-[#E5E5EA]"
              onPress={() => {
                if (activeTab === 'Mentorship') router.push(`/careers/mentor/${item.id}` as any);
                else router.push(`/careers/jobs/${item.id}` as any);
              }}
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-[16px] font-bold text-black flex-1 pr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleSave(item.id, activeTab === 'Mentorship' ? 'mentorship' : 'job')} className="p-1 -mr-2 -mt-1">
                  <Ionicons name={savedItems.includes(item.id) ? 'bookmark' : 'bookmark-outline'} size={20} color={savedItems.includes(item.id) ? '#FFD700' : '#1B1C62'} />
                </TouchableOpacity>
              </View>
              <Text className="text-[14px] text-[#666666] mb-1 leading-5" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{item.company}</Text>
              <Text className="text-[13px] text-[#8E8E93] mb-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.location} {item.poster ? `\u2022 Posted by ${item.poster}` : ''}</Text>
              <View className="flex-row mt-1 flex-wrap">
                {item.tags.map((tag: string) => (
                  <View key={tag} className="bg-[#F6F6F6] px-3 py-1 rounded-sm mr-2 mb-2">
                    <Text className="text-[12px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center pt-10">
              <Ionicons name="briefcase-outline" size={48} color="#C7C7CC" />
              <Text className="text-[16px] text-[#8E8E93] mt-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>No listings yet.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
