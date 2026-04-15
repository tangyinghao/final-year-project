import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SegmentedControl } from '@/components/careers/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/authContext';
import { 
  getUserJobs, 
  getJobApplications, 
  getUserMentorships, 
  getMentorshipRequests, 
  updateMentorshipRequestStatus,
  updateJobApplicationStatus
} from '@/services/careerService';
import { Job, Mentorship, JobApplication, MentorshipRequest } from '@/types';
import { Theme } from '@/constants/theme';

export default function ManageCareersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Jobs');
  
  const [loading, setLoading] = useState(true);
  
  // Job Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{ [jobId: string]: JobApplication[] }>({});
  
  // Mentorship Data
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [requests, setRequests] = useState<{ [mentorshipId: string]: MentorshipRequest[] }>({});

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch Jobs and their applications
      const userJobs = await getUserJobs(user.uid);
      setJobs(userJobs);
      const appsMap: { [jobId: string]: JobApplication[] } = {};
      for (const job of userJobs) {
        appsMap[job.id] = await getJobApplications(job.id);
      }
      setApplications(appsMap);

      // Fetch Mentorships and their requests
      const userMentorships = await getUserMentorships(user.uid);
      setMentorships(userMentorships);
      const reqsMap: { [mentorshipId: string]: MentorshipRequest[] } = {};
      for (const mentorship of userMentorships) {
        reqsMap[mentorship.id] = await getMentorshipRequests(mentorship.id);
      }
      setRequests(reqsMap);
    } catch (e) {
      console.error('Error fetching manage data', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCV = async (cvUrl: string | null) => {
    if (!cvUrl) {
      Alert.alert('No CV', 'This applicant did not provide a CV.');
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(cvUrl);
    } catch (e) {
      Alert.alert('Error', 'Could not open CV document.');
    }
  };

  const handleMentorshipAction = async (mentorshipId: string, requesterId: string, status: 'accepted' | 'declined') => {
    try {
      await updateMentorshipRequestStatus(mentorshipId, requesterId, status);
      setRequests((prev) => {
        const newMap = { ...prev };
        newMap[mentorshipId] = newMap[mentorshipId].map((r) =>
          r.requesterId === requesterId ? { ...r, status } : r
        );
        return newMap;
      });
      Alert.alert('Success', `Request has been ${status}.`);
    } catch (e: any) {
      console.error('[manage] mentorship action failed', { mentorshipId, requesterId, status, code: e?.code, message: e?.message, e });
      Alert.alert('Error', `Failed to update request.\n\n${e?.code || ''} ${e?.message || ''}`);
    }
  };

  const handleJobAction = async (jobId: string, applicantId: string, status: 'accepted' | 'declined') => {
    try {
      await updateJobApplicationStatus(jobId, applicantId, status);
      setApplications((prev) => {
        const newMap = { ...prev };
        newMap[jobId] = newMap[jobId].map((a) =>
          a.applicantId === applicantId ? { ...a, status } : a
        );
        return newMap;
      });
      Alert.alert('Success', `Application has been ${status}.`);
    } catch (e: any) {
      console.error('[manage] job action failed', { jobId, applicantId, status, code: e?.code, message: e?.message, e });
      Alert.alert('Error', `Failed to update application.\n\n${e?.code || ''} ${e?.message || ''}`);
    }
  };

  const renderJobApplications = () => {
    const allApps: { jobTitle: string; jobId: string; app: JobApplication }[] = [];
    jobs.forEach((j) => {
      if (applications[j.id]) {
        applications[j.id].forEach((app) => allApps.push({ jobTitle: j.title, jobId: j.id, app }));
      }
    });

    if (allApps.length === 0) {
      return (
        <EmptyState 
          iconName="document-text-outline" 
          message={jobs.length === 0 ? "You haven't posted any jobs." : "No applications received."}
        />
      );
    }

    return (
      <FlatList
        data={allApps}
        keyExtractor={(item) => `${item.jobTitle}-${item.app.applicantId}`}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-4 border border-[#E5E5EA] shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <TouchableOpacity onPress={() => router.push(`/profile/view/${item.app.applicantId}` as any)}>
                  <Text className="text-[16px] font-bold text-[#1B1C62] underline" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                    {item.app.applicantName}
                  </Text>
                </TouchableOpacity>
                <Text className="text-[13px] text-[#8E8E93] mt-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  Applied for {item.jobTitle}
                </Text>
              </View>
              <Text className="text-[12px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                {item.app.appliedAt?.toDate().toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleOpenCV(item.app.cvUrl)}
              className="flex-row items-center mt-3 bg-[#EBF4FE] self-start py-2 px-3 rounded-lg border border-[#D0E6FC]"
            >
              <Ionicons name="document-text" size={16} color="#1B1C62" />
              <Text className="text-[13px] font-bold text-[#1B1C62] ml-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {item.app.cvUrl ? 'View CV Document' : 'No CV Provided'}
              </Text>
            </TouchableOpacity>

            {(!item.app.status || item.app.status === 'pending') ? (
              <View className="flex-row items-center mt-4 gap-3">
                <TouchableOpacity
                  onPress={() => handleJobAction(item.jobId, item.app.applicantId, 'declined')}
                  className="flex-1 py-2.5 rounded-lg border border-[#FF3B30] items-center justify-center bg-white"
                >
                  <Text className="text-[#FF3B30] text-[14px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleJobAction(item.jobId, item.app.applicantId, 'accepted')}
                  className="flex-1 py-2.5 rounded-lg items-center justify-center bg-[#1B1C62]"
                >
                  <Text className="text-white text-[14px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Accept</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className={`mt-4 self-start flex-row items-center px-3 py-1.5 rounded-full ${item.app.status === 'accepted' ? 'bg-[#E8F5E9]' : 'bg-[#FDECEA]'}`}>
                <Ionicons
                  name={item.app.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={item.app.status === 'accepted' ? '#34C759' : '#FF3B30'}
                />
                <Text className={`text-[13px] font-bold ml-1.5 ${item.app.status === 'accepted' ? 'text-[#1B8A3A]' : 'text-[#C62828]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {item.app.status === 'accepted' ? 'Accepted' : 'Declined'}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    );
  };

  const renderMentorshipRequests = () => {
    const allReqs: { mentorshipTitle: string; mentorshipId: string; req: MentorshipRequest }[] = [];
    mentorships.forEach((m) => {
      if (requests[m.id]) {
        requests[m.id].forEach((req) => allReqs.push({ mentorshipTitle: m.title, mentorshipId: m.id, req }));
      }
    });

    if (allReqs.length === 0) {
      return (
        <EmptyState 
          iconName="people-outline" 
          message={mentorships.length === 0 ? "You don't have a mentorship profile." : "No requests received."}
        />
      );
    }

    return (
      <FlatList
        data={allReqs}
        keyExtractor={(item) => `${item.mentorshipId}-${item.req.requesterId}`}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-4 border border-[#E5E5EA] shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <TouchableOpacity onPress={() => router.push(`/profile/view/${item.req.requesterId}` as any)}>
                  <Text className="text-[16px] font-bold text-[#1B1C62] underline" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                    {item.req.requesterName}
                  </Text>
                </TouchableOpacity>
                <Text className="text-[13px] text-[#8E8E93] mt-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  Requested {item.req.requestedAt?.toDate().toLocaleDateString()}
                </Text>
              </View>
            </View>
            {item.req.message ? (
              <Text className="text-[14px] text-[#4A4A4A] mt-2 mb-3 bg-[#F6F6F6] p-3 rounded-lg" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                "{item.req.message}"
              </Text>
            ) : (
              <View className="h-2" />
            )}
            
            {item.req.status === 'pending' ? (
              <View className="flex-row items-center mt-2 gap-3">
                <TouchableOpacity
                  onPress={() => handleMentorshipAction(item.mentorshipId, item.req.requesterId, 'declined')}
                  className="flex-1 py-2.5 rounded-lg border border-[#FF3B30] items-center justify-center bg-white"
                >
                  <Text className="text-[#FF3B30] text-[14px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMentorshipAction(item.mentorshipId, item.req.requesterId, 'accepted')}
                  className="flex-1 py-2.5 rounded-lg items-center justify-center bg-[#1B1C62]"
                >
                  <Text className="text-white text-[14px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Accept</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className={`mt-2 self-start flex-row items-center px-3 py-1.5 rounded-full ${item.req.status === 'accepted' ? 'bg-[#E8F5E9]' : 'bg-[#FDECEA]'}`}>
                <Ionicons
                  name={item.req.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={item.req.status === 'accepted' ? '#34C759' : '#FF3B30'}
                />
                <Text className={`text-[13px] font-bold ml-1.5 ${item.req.status === 'accepted' ? 'text-[#1B8A3A]' : 'text-[#C62828]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {item.req.status === 'accepted' ? 'Accepted' : 'Declined'}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />
      <ScreenHeader 
        title="Requests"
        leftIconName="chevron-back"
        onLeftPress={() => router.back()}
        showBorder 
      />

      <View className="px-5 py-4 bg-white border-b border-[#E5E5EA]">
        <SegmentedControl 
          options={['Jobs', 'Mentorship']} 
          value={activeTab} 
          onChange={setActiveTab} 
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.brand.primary} />
      ) : activeTab === 'Jobs' ? (
        renderJobApplications()
      ) : (
        renderMentorshipRequests()
      )}
    </SafeAreaView>
  );
}
