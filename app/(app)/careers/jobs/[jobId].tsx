import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAuth } from '@/context/authContext';
import { getJob, applyToJob, uploadCV } from '@/services/careerService';
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
  const [cvFile, setCvFile] = useState<{ uri: string; name: string } | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

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

  const handlePickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setCvFile({ uri: result.assets[0].uri, name: result.assets[0].name });
    }
  };

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    try {
      let cvUrl: string | null = null;
      if (cvFile) {
        setUploadingCv(true);
        cvUrl = await uploadCV(user.uid, cvFile.uri, cvFile.name);
        setUploadingCv(false);
      }
      await applyToJob(job.id, user.uid, user.displayName, cvUrl);
      setHasApplied(true);
      setShowApplyDialog(false);
      Alert.alert('Application Submitted', 'Your profile has been sent to the employer.');
    } catch (e: any) {
      console.error('[jobApply] failed', { jobId: job?.id, uid: user?.uid, code: e?.code, message: e?.message, e });
      Alert.alert('Error', `Failed to submit application.\n\n${e?.code || ''} ${e?.message || ''}`);
    } finally {
      setApplying(false);
      setUploadingCv(false);
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
    <SafeAreaView className="flex-1 bg-white">
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

      <ScrollView className="flex-1 bg-[#F7F7F7]" showsVerticalScrollIndicator={false}>
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

        {/* CV Upload Section */}
        {!hasApplied && (
          <View className="bg-white mt-2 px-5 py-5 border-y border-[#E5E5EA]">
            <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Attach CV (Required)</Text>
            {cvFile ? (
              <View className="flex-row items-center bg-[#F6F6F6] rounded-xl py-3 px-4 border border-[#D0E6FC]">
                <Ionicons name="document-outline" size={20} color="#1B1C62" />
                <Text className="text-[14px] text-[#4A4A4A] ml-3 flex-1" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {cvFile.name}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" style={{ marginRight: 8 }} />
                <TouchableOpacity onPress={() => setCvFile(null)}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-center py-4 rounded-xl border border-dashed border-[#1B1C62]"
                onPress={handlePickCV}
              >
                <Ionicons name="cloud-upload-outline" size={22} color="#1B1C62" />
                <Text className="text-[15px] text-[#1B1C62] ml-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Upload PDF or Document</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>

      {/* Action Bar */}
      <View className="px-5 py-4 pb-2 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity
          className={`w-full h-14 rounded-xl flex-row items-center justify-center ${hasApplied ? 'bg-gray-300' : 'bg-[#1B1C62]'}`}
          onPress={() => setShowApplyDialog(true)}
          disabled={hasApplied}
        >
          <Text className={`${hasApplied ? 'text-gray-500' : 'text-white'} text-[16px] font-bold mr-2`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {hasApplied ? 'Applied' : 'Apply Now'}
          </Text>
          {!hasApplied && <Ionicons name="paper-plane-outline" size={20} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Apply Dialog */}
      <Modal visible={showApplyDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="document-text-outline" size={32} color="#1B1C62" />
            </View>
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Apply to {job.title}</Text>
            <Text className="text-[15px] text-[#8E8E93] text-center mb-5 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              A CV is required to submit your application. The employer will be notified.
            </Text>

            {/* CV Upload */}
            <TouchableOpacity
              className="w-full h-12 rounded-xl flex-row items-center justify-center border border-dashed border-[#1B1C62] mb-3"
              onPress={handlePickCV}
            >
              <Ionicons name="document-attach-outline" size={20} color="#1B1C62" />
              <Text className="text-[#1B1C62] text-[15px] font-bold ml-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {cvFile ? 'Change CV' : 'Upload CV'}
              </Text>
            </TouchableOpacity>

            {cvFile && (
              <View className="flex-row items-center w-full mb-4 px-1 bg-[#F6F6F6] rounded-lg py-2.5 px-3">
                <Ionicons name="document-text" size={18} color="#1B1C62" />
                <Text className="text-[13px] text-[#4A4A4A] ml-2 flex-1" numberOfLines={1} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {cvFile.name}
                </Text>
                <TouchableOpacity onPress={() => setCvFile(null)}>
                  <Ionicons name="close-circle" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row w-full gap-3 mt-1">
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center justify-center" onPress={() => { setShowApplyDialog(false); setCvFile(null); }}>
                <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${!cvFile ? 'bg-[#1B1C62]/40' : 'bg-[#1B1C62]'}`}
                onPress={handleApply}
                disabled={applying || !cvFile}
              >
                {applying ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    {uploadingCv && <Text className="text-white text-[12px] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Uploading...</Text>}
                  </View>
                ) : (
                  <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
