import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function SubmitListingScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<'Job' | 'Mentorship'>('Job');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    setShowConfirmModal(false);
    router.back();
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
          disabled={!title.trim() || !description.trim()}
          onPress={handleSubmit}
        >
          <Text className={`text-[16px] font-bold ${title.trim() && description.trim() ? 'text-[#1B1C62]' : 'text-gray-300'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
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
                  className="text-[17px] text-black font-bold"
                  style={{ fontFamily: 'PlusJakartaSans-Bold' }}
                  placeholder="Job Title (e.g. Software Engineer)"
                  placeholderTextColor="#C7C7CC"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View className="px-4 py-3 h-48">
                <TextInput
                  className="flex-1 text-[16px] text-black"
                  style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                  placeholder="Company name, requirements, responsibilities..."
                  placeholderTextColor="#C7C7CC"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>
          </View>

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
              >
                <Text className="text-[16px] font-bold text-white" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
