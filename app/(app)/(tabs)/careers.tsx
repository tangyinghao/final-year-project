import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSavedItems } from '../../utils/useSavedItems';

const TAGS = ['All', 'Saved', 'Engineering', 'Data', 'Design', 'Marketing'];

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Tech Corp Singapore',
    location: 'Singapore, On-site',
    poster: 'Ivy Xu',
    tags: ['Full-time', 'Engineering'],
  },
  {
    id: '2',
    title: 'Data Analyst Intern',
    company: 'Fintech Startup',
    location: 'Remote',
    poster: 'James Sin',
    tags: ['Internship', 'Data'],
  },
  {
    id: '3',
    title: 'Product Manager',
    company: 'Global Innovations',
    location: 'Singapore, Hybrid',
    poster: 'Alice Chen',
    tags: ['Full-time', 'Product'],
  },
];

const MOCK_MENTORS = [
  {
    id: 'm1',
    title: 'Software Engineering Guidance',
    company: 'Grab, Meta',
    location: 'Singapore, Remote',
    poster: 'Alumni Marcus Chen',
    tags: ['Mentorship', 'Engineering'],
  },
  {
    id: 'm2',
    title: 'Product Management Coaching',
    company: 'Shopee',
    location: 'Hybrid',
    poster: 'Alumni Alice Lee',
    tags: ['Mentorship', 'Product', 'Design'],
  },
];

export default function CareersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Jobs');
  const [activeTag, setActiveTag] = useState('All');
  const { savedItems, toggleSave } = useSavedItems();

  const currentData = activeTab === 'Jobs' ? MOCK_JOBS : MOCK_MENTORS;
  const filteredData = activeTag === 'Saved' 
    ? currentData.filter(item => savedItems.includes(item.id))
    : currentData.filter(item => activeTag === 'All' || item.tags.includes(activeTag));

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4">
        <View className="w-8 h-8" />
        <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Careers</Text>
        <TouchableOpacity 
          className="w-8 h-8 items-center justify-center rounded-full bg-[#1B1C62]"
          onPress={() => router.push('/careers/jobs/submit')}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View className="px-4 mb-4">
        <View className="flex-row rounded-lg border border-[#1B1C62] overflow-hidden">
          <TouchableOpacity 
            className={`flex-1 py-2 items-center justify-center ${activeTab === 'Jobs' ? 'bg-[#1B1C62]' : 'bg-white'}`}
            onPress={() => setActiveTab('Jobs')}
          >
            <Text className={`font-bold text-[14px] ${activeTab === 'Jobs' ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: activeTab === 'Jobs' ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>
              Jobs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 items-center justify-center ${activeTab === 'Mentorship' ? 'bg-[#1B1C62]' : 'bg-white'}`}
            onPress={() => setActiveTab('Mentorship')}
          >
            <Text className={`font-bold text-[14px] ${activeTab === 'Mentorship' ? 'text-white' : 'text-[#1B1C62]'}`} style={{ fontFamily: activeTab === 'Mentorship' ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>
              Mentorship
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags Filter */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {TAGS.map((tag, index) => (
            <TouchableOpacity 
              key={tag}
              onPress={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full mr-2 ${
                activeTag === tag 
                  ? (tag === 'Saved' ? 'bg-[#FFD700]' : 'bg-[#1B1C62]') 
                  : 'bg-[#F6F6F6]'
              }`}
            >
              <Text className={`text-[13px] ${
                activeTag === tag 
                  ? (tag === 'Saved' ? 'text-black font-bold' : 'text-white font-bold') 
                  : 'text-[#8E8E93]'
              }`} style={{ fontFamily: activeTag === tag ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-Medium' }}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-8" />
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm border border-[#E5E5EA]"
            onPress={() => {
              if (activeTab === 'Mentorship') {
                router.push(`/careers/mentor/${item.id}` as any);
              } else {
                router.push(`/careers/jobs/${item.id}` as any);
              }
            }}
          >
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-[16px] font-bold text-black flex-1 pr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.title}</Text>
              <TouchableOpacity onPress={() => toggleSave(item.id)} className="p-1 -mr-2 -mt-1">
                <Ionicons 
                  name={savedItems.includes(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={savedItems.includes(item.id) ? "#FFD700" : "#1B1C62"} 
                />
              </TouchableOpacity>
            </View>
            <Text className="text-[14px] text-[#666666] mb-1 leading-5" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{item.company}</Text>
            <Text className="text-[13px] text-[#8E8E93] mb-3" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.location} • Posted by {item.poster}</Text>
            
            <View className="flex-row mt-1 flex-wrap">
              {item.tags.map(tag => (
                <View key={tag} className="bg-[#F6F6F6] px-3 py-1 rounded-sm mr-2 mb-2">
                  <Text className="text-[12px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
