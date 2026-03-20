import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAuth } from '@/context/authContext';
import { getJob, applyToJob } from '@/services/careerService';
import { getUsersByIds } from '@/services/userService';
import { Job, UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function JobDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { jobId } = useLocalSearchParams();
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(jobId as string);

  const [job, setJob] = useState<Job | null>(null);
  const [poster, setPoster] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    (async () => {
      const j = await getJob(jobId as string);
      if (j) {
        setJob(j);
        const profiles = await getUsersByIds([j.postedBy]);
        if (profiles.length > 0) setPoster(profiles[0]);
      }
      setLoading(false);
    })();
  }, [jobId]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    try {
      await applyToJob(job.id, user.uid, user.displayName);
      setHasApplied(true);
      Alert.alert('Application Submitted', 'Your profile has been sent to the employer.');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#1B1C62" />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Job not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Job Detail
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => toggleSave(jobId as string)}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? "#FFD700" : "#1B1C62"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View className="bg-white px-5 py-6 border-b border-[#E5E5EA]">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center mr-4">
              <Text className="text-[24px] font-bold text-[#1B1C62]">{job.company.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{job.title}</Text>
              <Text className="text-[16px] text-[#4A4A4A] mt-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{job.company} • {job.location}</Text>
            </View>
          </View>

          {job.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {job.tags.map((tag) => (
                <View key={tag} className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-full">
                  <Text className="text-[13px] text-[#4A4A4A]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row items-center bg-[#EBF4FE] rounded-lg p-3 border border-[#D0E6FC]">
            <Image source={poster?.profilePhoto ? { uri: poster.profilePhoto } : DEFAULT_AVATAR} className="w-8 h-8 rounded-full bg-gray-200 mr-3" />
            <Text className="flex-1 text-[14px] text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Posted by <Text style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{job.posterName || poster?.displayName || 'Alumni'}</Text>{poster?.programme ? ` (${poster.programme}${poster.graduationYear ? ` '${String(poster.graduationYear).slice(-2)}` : ''})` : ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="bg-white mt-2 px-5 py-5 border-y border-[#E5E5EA]">
          <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Description</Text>
          <Text className="text-[15px] text-[#4A4A4A] leading-6 mb-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            {job.description}
          </Text>
        </View>

      </ScrollView>

      {/* Action Bar */}
      <View className="px-5 py-4 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity
          className={`w-full h-14 rounded-xl flex-row items-center justify-center ${hasApplied ? 'bg-gray-300' : 'bg-[#1B1C62]'}`}
          onPress={handleApply}
          disabled={hasApplied || applying}
        >
          {applying ? <ActivityIndicator color="white" /> : (
            <>
              <Text className={`${hasApplied ? 'text-gray-500' : 'text-white'} text-[16px] font-bold mr-2`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Text>
              {!hasApplied && <Ionicons name="paper-plane-outline" size={20} color="white" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
