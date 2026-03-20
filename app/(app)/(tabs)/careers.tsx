import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { CareerCard } from '@/components/careers/CareerCard';
import { FilterChipRow } from '@/components/careers/FilterChipRow';
import { SegmentedControl } from '@/components/careers/SegmentedControl';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSavedItems } from '@/hooks/useSavedItems';
import { getApprovedJobs, getApprovedMentorships } from '@/services/careerService';
import { Job, Mentorship } from '@/types';
import { Theme } from '@/constants/theme';

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
    ? currentData.filter((item) => savedItems.includes(item.id))
    : currentData.filter((item) => activeTag === 'All' || item.tags.includes(activeTag));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Careers" rightIconName="add" onRightPress={() => router.push('/careers/jobs/submit')} className="pb-4" />

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
          renderItem={({ item }) => (
            <CareerCard
              title={item.title}
              company={item.company}
              meta={`${item.location}${item.poster ? ` • Posted by ${item.poster}` : ''}`}
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
