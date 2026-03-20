import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { createJob, createMentorship } from '@/services/careerService';

export default function SubmitListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [availability, setAvailability] = useState('');
  const [listingType, setListingType] = useState<'Job' | 'Mentorship'>('Job');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const titleRef = React.useRef<TextInput>(null);
  const descRef = React.useRef<TextInput>(null);

  const addTag = () => {
    const newTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const addExpertise = () => {
    const newItems = expertiseInput
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e && !expertise.includes(e));
    if (newItems.length > 0) {
      setExpertise([...expertise, ...newItems]);
    }
    setExpertiseInput('');
  };

  const removeExpertise = (item: string) => setExpertise(expertise.filter((e) => e !== item));

  const handleSubmit = () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    if (!company.trim()) {
      Alert.alert('Required', 'Please enter a company name.');
      return;
    }
    if (!description.trim()) {
      descRef.current?.focus();
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      if (listingType === 'Job') {
        await createJob(user.uid, user.displayName, {
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          location: location.trim(),
          tags,
        });
      } else {
        await createMentorship(user.uid, user.displayName, {
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          expertise,
          availability: availability.trim(),
          location: location.trim(),
          tags,
        });
      }
      setShowConfirmModal(false);
      Alert.alert('Submitted', 'Your listing has been submitted for review.');
      router.back();
    } catch (e) {
      setShowConfirmModal(false);
      Alert.alert('Error', 'Failed to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-16 h-10 items-center justify-center -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          New Listing
        </Text>
        <TouchableOpacity 
          className="w-16 h-10 items-center justify-center -mr-2"
          onPress={handleSubmit}
        >
          <Text className={`text-[16px] font-bold ${title.trim() && company.trim() && description.trim() ? 'text-[#1B1C62]' : 'text-gray-300'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Submit
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F7F7F7]"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Post Type */}
          <View className="mt-5 px-5">
            <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 ml-1 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Listing Type</Text>
            <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
              <TouchableOpacity 
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-[#E5E5EA]"
                onPress={() => setListingType('Job')}
              >
                <Text className={`text-[16px] ${listingType === 'Job' ? 'text-black' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Job Opportunity</Text>
                {listingType === 'Job' ? (
                  <Ionicons name="checkmark-circle" size={22} color="#1B1C62" />
                ) : (
                  <View className="w-5 h-5 rounded-full border border-[#D0D0D0]" />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center justify-between px-4 py-3.5"
                onPress={() => setListingType('Mentorship')}
              >
                <Text className={`text-[16px] ${listingType === 'Mentorship' ? 'text-black' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Mentorship Application</Text>
                {listingType === 'Mentorship' ? (
                  <Ionicons name="checkmark-circle" size={22} color="#1B1C62" />
                ) : (
                  <View className="w-5 h-5 rounded-full border border-[#D0D0D0]" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <View className="mt-5 px-5">
            <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 ml-1 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Details</Text>
            <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
              <View className="px-4 py-3 border-b border-[#E5E5EA]">
                <TextInput
                  ref={titleRef}
                  className="text-[17px] text-black font-bold"
                  style={{ fontFamily: 'PlusJakartaSans-Bold' }}
                  placeholder={listingType === 'Job' ? 'Job Title (e.g. Software Engineer)' : 'Title (e.g. Career Mentor)'}
                  placeholderTextColor="#C7C7CC"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View className="px-4 py-3 border-b border-[#E5E5EA]">
                <TextInput
                  className="text-[16px] text-black"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  placeholder="Company Name"
                  placeholderTextColor="#C7C7CC"
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
              <View className="px-4 py-3 border-b border-[#E5E5EA]">
                <TextInput
                  className="text-[16px] text-black"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  placeholder="Location (e.g. Singapore, Remote)"
                  placeholderTextColor="#C7C7CC"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              <View className="px-4 py-3 h-36">
                <TextInput
                  ref={descRef}
                  className="flex-1 text-[16px] text-black"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  placeholder={listingType === 'Job' ? 'Requirements, responsibilities, benefits...' : 'Describe what you can offer as a mentor...'}
                  placeholderTextColor="#C7C7CC"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>
          </View>

          {/* Tags */}
          <View className="mt-5 px-5">
            <View className="flex-row items-center justify-between mb-2 ml-1">
              <Text className="text-[14px] text-[#8E8E93] uppercase font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Tags</Text>
              <Text className="text-[12px] text-[#AEAEB2]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Separate with commas</Text>
            </View>
            <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
              <View className="flex-row items-center px-4 py-3">
                <TextInput
                  className="flex-1 text-[16px] text-black"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  placeholder="e.g. Full-Time, React, Remote"
                  placeholderTextColor="#C7C7CC"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addTag} className="ml-2 px-3 py-1.5 bg-[#1B1C62] rounded-lg">
                  <Text className="text-white text-[13px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <TouchableOpacity key={tag} onPress={() => removeTag(tag)} className="flex-row items-center bg-[#EBF4FE] px-3 py-1.5 rounded-full">
                    <Text className="text-[13px] text-[#1B1C62] mr-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
                    <Ionicons name="close-circle" size={16} color="#1B1C62" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Mentorship-specific fields */}
          {listingType === 'Mentorship' && (
            <>
              <View className="mt-5 px-5">
                <View className="flex-row items-center justify-between mb-2 ml-1">
                  <Text className="text-[14px] text-[#8E8E93] uppercase font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Expertise Areas</Text>
                  <Text className="text-[12px] text-[#AEAEB2]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Separate with commas</Text>
                </View>
                <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
                  <View className="flex-row items-center px-4 py-3">
                    <TextInput
                      className="flex-1 text-[16px] text-black"
                      style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                      placeholder="e.g. Resume Review, Career Planning"
                      placeholderTextColor="#C7C7CC"
                      value={expertiseInput}
                      onChangeText={setExpertiseInput}
                      onSubmitEditing={addExpertise}
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={addExpertise} className="ml-2 px-3 py-1.5 bg-[#1B1C62] rounded-lg">
                      <Text className="text-white text-[13px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {expertise.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {expertise.map((item) => (
                      <TouchableOpacity key={item} onPress={() => removeExpertise(item)} className="flex-row items-center bg-[#EBF4FE] px-3 py-1.5 rounded-full">
                        <Text className="text-[13px] text-[#1B1C62] mr-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{item}</Text>
                        <Ionicons name="close-circle" size={16} color="#1B1C62" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View className="mt-5 px-5">
                <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 ml-1 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Availability</Text>
                <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
                  <View className="px-4 py-3">
                    <TextInput
                      className="text-[16px] text-black"
                      style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                      placeholder="e.g. Weekday evenings, 2 hours/week"
                      placeholderTextColor="#C7C7CC"
                      value={availability}
                      onChangeText={setAvailability}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          <Text className="px-6 mt-3 text-[13px] text-[#8E8E93] leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            All listings submitted by Alumni will be reviewed by an Administrator before appearing on the public Careers board.
          </Text>

          <View className="h-10" />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full max-w-[340px] rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-4">
              <Ionicons name="paper-plane" size={32} color="#1B1C62" />
            </View>
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Submit for Review?
            </Text>
            <Text className="text-[15px] text-[#666666] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Your {listingType.toLowerCase()} listing will be sent to administrators for approval before it becomes publicly visible on the Careers board.
            </Text>
            
            <View className="w-full flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center"
                onPress={() => setShowConfirmModal(false)}
              >
                <Text className="text-[16px] font-bold text-[#666666]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center"
                onPress={confirmSubmit}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="white" /> : (
                  <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
