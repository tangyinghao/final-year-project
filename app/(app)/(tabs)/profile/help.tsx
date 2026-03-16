import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const FAQ_ITEMS = [
  { question: 'How to create an event?', answer: 'Navigate to the Events tab and tap the + icon in the top right corner. Fill in the event details and submit it for admin approval.' },
  { question: 'What is Smart Match?', answer: 'Smart Match is our algorithm that pairs you with other NTU students and alumni based on shared interests, program, and graduation year.' },
  { question: 'How to report a user?', answer: 'You can report a user by tapping the 3-dots icon on their profile or chat message, and selecting "Report". Admin will review it shortly.' },
  { question: 'Resetting account data', answer: 'To reset your account data or request deletion, please use the Contact Us button to send a formal request to the admins.' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const handleReportIssue = () => {
    Linking.openURL('mailto:support@mscircle.com?subject=Report%20an%20Issue');
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:contact@mscircle.com?subject=Contact%20MSCircle%20Support');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Help & Support
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row items-center bg-[#F6F6F6] rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-black"
              style={{ fontFamily: 'PlusJakartaSans-Regular', height: 24 }}
              placeholder="Search for help..."
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Quick Links Grouped List */}
        <View className="px-5 mb-8">
          <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>FAQs</Text>
          <View className="bg-white border-t border-[#E5E5EA]">
            {FAQ_ITEMS.map((item, index) => (
              <View key={index} className="border-b border-[#E5E5EA]">
                <TouchableOpacity 
                  className="flex-row items-center justify-between py-4"
                  onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <Text className="text-[16px] text-black pr-4 flex-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.question}</Text>
                  <Ionicons name={expandedFaq === index ? "chevron-up" : "chevron-down"} size={18} color="#C7C7CC" />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View className="pb-4 pr-4">
                    <Text className="text-[14px] text-[#666666] leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="px-5 mb-12">
          <Text className="text-[14px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Other Resources</Text>
          <View className="bg-white border border-[#E5E5EA] rounded-xl overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center justify-between p-4 border-b border-[#E5E5EA]"
              onPress={() => setShowGuidelines(true)}
            >
              <Text className="text-[16px] text-black font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Community Guidelines</Text>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-row items-center justify-between p-4"
              onPress={handleReportIssue}
            >
              <Text className="text-[16px] text-[#D71440] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Report an Issue</Text>
              <Ionicons name="alert-circle-outline" size={18} color="#D71440" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Us Section */}
        <View className="px-5 pb-20 items-center">
            <Text className="text-[17px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Still need help?</Text>
            <Text className="text-[14px] text-[#8E8E93] text-center mb-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>We're here to assist you anytime.</Text>
            <TouchableOpacity 
              className="w-full bg-[#1B1C62] py-4 rounded-xl items-center justify-center flex-row"
              onPress={handleContactUs}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text className="text-white text-[16px] font-bold ml-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Contact Us</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Guidelines Modal */}
      <Modal visible={showGuidelines} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-5 py-4 mt-4 border-b border-[#E5E5EA]">
            <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Community Guidelines</Text>
            <TouchableOpacity onPress={() => setShowGuidelines(false)} className="w-10 h-10 items-end justify-center">
              <Ionicons name="close" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-5 py-6" showsVerticalScrollIndicator={false}>
            <Text className="text-[16px] text-black leading-6 mb-4" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              1. Be respectful to all members. Harassment, hate speech, or discrimination will not be tolerated.
            </Text>
            <Text className="text-[16px] text-black leading-6 mb-4" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              2. Keep content relevant to NTU EEE academics, careers, and networking.
            </Text>
            <Text className="text-[16px] text-black leading-6 mb-4" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              3. Do not spam chat channels with unsolicited promotions or irrelevant links.
            </Text>
            <Text className="text-[16px] text-black leading-6 mb-12" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              4. Admins reserve the right to suspend accounts violating these guidelines.
            </Text>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
