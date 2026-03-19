import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or bullying',
  'Inappropriate content',
  'Pretending to be someone else',
  'Self-harm or suicidal intent',
  'Other'
];

export default function ReportUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmitReport = () => {
    // In production, this would send an API request to the backend
    Alert.alert(
      "Report Submitted",
      "Thank you for letting us know. We've received your report and our Admin team will review it shortly. Your privacy is protected.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-16 h-10 items-center justify-center -ml-2">
          <Text className="text-[16px] text-gray-500" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Report User
        </Text>
        <TouchableOpacity 
          className="w-16 h-10 items-center justify-center -mr-2"
          disabled={!selectedReason}
          onPress={handleSubmitReport}
        >
          <Text className={`text-[16px] font-bold ${selectedReason ? 'text-[#D71440]' : 'text-gray-300'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Submit
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-6 pb-2">
            <Text className="text-[20px] font-bold text-black mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Why are you reporting this user?
            </Text>
            <Text className="text-[15px] text-[#666666] leading-6 mb-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Your report is anonymous, except if you're reporting an intellectual property infringement. 
              The user will not be notified that you reported them.
            </Text>

            <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              Select a Reason
            </Text>
            <View className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden mb-6">
              {REPORT_REASONS.map((reason, index) => (
                <TouchableOpacity 
                  key={index} 
                  className={`flex-row items-center justify-between px-4 py-4 ${index !== REPORT_REASONS.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text className={`text-[16px] ${selectedReason === reason ? 'text-black' : 'text-[#4A4A4A]'}`} style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                  {selectedReason === reason && <Ionicons name="checkmark" size={20} color="#D71440" />}
                </TouchableOpacity>
              ))}
            </View>

            {selectedReason && (
              <View className="animate-fade-in">
                <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  Additional Details (Optional)
                </Text>
                <View className="bg-white rounded-xl border border-[#E5E5EA] p-4 mb-8 h-32">
                  <TextInput
                    className="flex-1 text-[16px] text-black"
                    style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                    placeholder="Provide more context to help us understand..."
                    placeholderTextColor="#C7C7CC"
                    multiline
                    textAlignVertical="top"
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                  />
                </View>
              </View>
            )}

            <View className="flex-row items-start bg-[#F6F6F6] p-4 rounded-xl mb-10">
              <Ionicons name="shield-checkmark" size={20} color="#8E8E93" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-[13px] text-[#666666] ml-3 leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                If someone is in immediate danger, call local emergency services. Do not wait for us to review this report.
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
