import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionLabel } from '@/components/ui/SectionLabel';

const FAQ_ITEMS = [
  { question: 'How to create an event?', answer: 'Navigate to the Events tab and tap the + icon in the top right corner. Fill in the event details and submit it for admin approval.' },
  { question: 'What is Smart Match?', answer: 'Smart Match is our algorithm that pairs you with other NTU students and alumni based on shared interests, program, and graduation year.' },
  { question: 'How to report a user?', answer: 'You can report a user by tapping the 3-dots icon on their profile or chat message, and selecting "Report". Admin will review it shortly.' },
  { question: 'Resetting account data', answer: 'To reset your account data or request deletion, please use the Contact Us button to send a formal request to the admins.' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const filteredFaqs = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Help & Support" onLeftPress={() => router.back()} showBorder />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-4 pt-6">
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search for help..." />
        </View>

        <View className="mb-8 px-5">
          <SectionLabel label="FAQs" className="mb-2" />
          <View className="border-t border-border-default bg-white">
            {filteredFaqs.map((item, index) => (
              <View key={index} className="border-b border-border-default">
                <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}>
                  <Text className="flex-1 pr-4 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{item.question}</Text>
                  <Ionicons name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} size={18} color="#C7C7CC" />
                </TouchableOpacity>
                {expandedFaq === index ? (
                  <View className="pb-4 pr-4">
                    <Text className="text-[14px] leading-5 text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{item.answer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="mb-12 px-5">
          <SectionLabel label="Other Resources" className="mb-2" />
          <View className="overflow-hidden rounded-xl border border-border-default bg-white">
            <TouchableOpacity className="flex-row items-center justify-between p-4" onPress={() => setShowGuidelines(true)}>
              <Text className="text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Community Guidelines</Text>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center px-5 pb-20">
          <Text className="mb-1 text-[17px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Still need help?</Text>
          <Text className="mb-5 text-center text-[14px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>We&apos;re here to assist you anytime.</Text>
          <PrimaryButton label="Contact Us" onPress={() => Linking.openURL('mailto:contact@mscircle.com?subject=Contact%20MSCircle%20Support')} />
        </View>
      </ScrollView>

      <Modal visible={showGuidelines} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <ScreenHeader title="Community Guidelines" rightIconName="close" onRightPress={() => setShowGuidelines(false)} showBorder className="mt-4 px-5" />
          <ScrollView className="px-5 py-6" showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-[16px] leading-6 text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              1. Be respectful to all members. Harassment, hate speech, or discrimination will not be tolerated.
            </Text>
            <Text className="mb-4 text-[16px] leading-6 text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              2. Keep content relevant to NTU EEE academics, careers, and networking.
            </Text>
            <Text className="mb-4 text-[16px] leading-6 text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              3. Do not spam chat channels with unsolicited promotions or irrelevant links.
            </Text>
            <Text className="mb-12 text-[16px] leading-6 text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
              4. Admins reserve the right to suspend accounts violating these guidelines.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
