import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CareerCard } from '@/components/careers/CareerCard';
import { FilterChipRow } from '@/components/careers/FilterChipRow';
import { SegmentedControl } from '@/components/careers/SegmentedControl';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAuth } from '@/context/authContext';
import { getApprovedJobs, getApprovedMentorships } from '@/services/careerService';
import { Job, Mentorship } from '@/types';
import { Theme } from '@/constants/theme';

const TAGS = ['All', 'Saved', 'Communications', 'Computer Control', 'Electronics', 'Power Engineering', 'Signal Processing'];

export default function CareersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Jobs');
  const [activeTag, setActiveTag] = useState('All');
  const { savedItems, toggleSave, refreshSaved } = useSavedItems();

  useFocusEffect(
    useCallback(() => {
      refreshSaved();
    }, [refreshSaved])
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [j, m] = await Promise.all([getApprovedJobs(), getApprovedMentorships()]);
    setJobs(j);
    setMentorships(m);
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const currentData = activeTab === 'Jobs'
    ? jobs.map((j) => ({ id: j.id, title: j.title, company: j.company, location: j.location, poster: j.posterName, tags: j.tags }))
    : mentorships.map((m) => ({ id: m.id, title: m.mentorName, company: m.title, location: m.location, poster: m.company, tags: m.expertise.length > 0 ? m.expertise : m.tags }));

  const filteredData = activeTag === 'Saved'
    ? currentData.filter((item) => savedItems.includes(item.id))
    : currentData.filter((item) => activeTag === 'All' || item.tags.includes(activeTag));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader
        title="Careers"
        className="pb-4"
        rightContent={
          <View className="flex-row items-center gap-1 -mr-2">
            {user?.role === 'alumni' && (
              <TouchableOpacity onPress={() => router.push('/careers/manage' as any)} className="w-10 h-10 items-center justify-center">
                <Ionicons name="folder-open-outline" size={24} color={Theme.colors.brand.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/careers/jobs/submit' as any)} className="w-10 h-10 items-center justify-center">
              <Ionicons name="add" size={28} color={Theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="px-4 pb-4">
        <SegmentedControl options={['Jobs', 'Mentorship']} value={activeTab} onChange={setActiveTab} />
      </View>

      <View className="mb-4">
        <FilterChipRow tags={TAGS} activeTag={activeTag} onChange={setActiveTag} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.brand.primary} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.brand.primary} colors={[Theme.colors.brand.primary]} />}
          renderItem={({ item }) => (
            <CareerCard
              title={item.title}
              company={item.company}
              meta={activeTab === 'Mentorship'
                ? `${item.poster || ''}${item.poster && item.location ? ' • ' : ''}${item.location}`
                : `${item.location}${item.poster ? ` • Posted by ${item.poster}` : ''}`
              }
              tags={item.tags}
              saved={savedItems.includes(item.id)}
              onToggleSave={() => toggleSave(item.id, activeTab === 'Mentorship' ? 'mentorship' : 'job')}
              onPress={() => {
                if (activeTab === 'Mentorship') router.push(`/careers/mentor/${item.id}` as any);
                else router.push(`/careers/jobs/${item.id}` as any);
              }}
            />
          )}
          ListEmptyComponent={<EmptyState iconName="briefcase-outline" message="No listings yet." />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
