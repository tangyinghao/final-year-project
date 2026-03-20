import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const GROUP_SIZES = ['3 Users', '5 Users', '8 Users'];

const INTEREST_TAGS = [
  { id: '1', label: 'Academic/SCSE', icon: 'school' },
  { id: '2', label: 'Badminton', icon: 'tennisball' },
  { id: '3', label: 'AI/ML', icon: 'hardware-chip' },
  { id: '4', label: 'Startup', icon: 'briefcase' },
  { id: '5', label: 'Design', icon: 'color-palette' },
];

export default function SmartMatchSettingsScreen() {
  const router = useRouter();
  const [matchMode, setMatchMode] = useState<'individual' | 'group'>('individual');
  const [selectedGroupSize, setSelectedGroupSize] = useState('5 Users');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['1', '3']);
  const insets = useSafeAreaInsets();

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleStartMatching = () => {
    const interestLabels = selectedInterests
      .map((id) => INTEREST_TAGS.find((t) => t.id === id)?.label)
      .filter(Boolean)
      .join(',');
    const groupSize = parseInt(selectedGroupSize) || 5;

    if (matchMode === 'group') {
      router.push(`/chat/smart_match_group?interests=${encodeURIComponent(interestLabels)}&groupSize=${groupSize}` as any);
    } else {
      router.push(`/chat/smart_match?interests=${encodeURIComponent(interestLabels)}` as any);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-16 h-10 items-center justify-center -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Smart Match</Text>
        <View className="w-16 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5 pb-6">
          <View className="flex-row bg-[#F6F6F6] rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-2 items-center justify-center rounded-lg ${matchMode === 'individual' ? 'bg-white' : ''}`}
              style={matchMode === 'individual' ? { shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1 } : undefined}
              onPress={() => setMatchMode('individual')}
            >
              <Text className={`text-[15px] font-bold ${matchMode === 'individual' ? 'text-black' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Individual Match</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 items-center justify-center rounded-lg ${matchMode === 'group' ? 'bg-white' : ''}`}
              style={matchMode === 'group' ? { shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1 } : undefined}
              onPress={() => setMatchMode('group')}
            >
              <Text className={`text-[15px] font-bold ${matchMode === 'group' ? 'text-black' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Group Match</Text>
            </TouchableOpacity>
          </View>
        </View>

        {matchMode === 'group' && (
          <View className="px-5 pb-8">
            <Text className="text-[16px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Group Size</Text>
            <View className="flex-row gap-3">
              {GROUP_SIZES.map(size => (
                <TouchableOpacity key={size}
                  className={`flex-1 py-3 items-center justify-center rounded-xl border ${selectedGroupSize === size ? 'bg-[#1B1C62] border-[#1B1C62]' : 'bg-white border-[#E5E5EA]'}`}
                  onPress={() => setSelectedGroupSize(size)}>
                  <Text className={`text-[15px] font-bold ${selectedGroupSize === size ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="px-5 pb-20">
          <Text className="text-[16px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Focus on interests</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {INTEREST_TAGS.map(tag => {
              const isSelected = selectedInterests.includes(tag.id);
              return (
                <TouchableOpacity key={tag.id}
                  className={`flex-row items-center px-4 py-2.5 rounded-full border ${isSelected ? 'bg-[#1B1C62] border-[#1B1C62]' : 'bg-[#F6F6F6] border-[#F6F6F6]'}`}
                  onPress={() => toggleInterest(tag.id)}>
                  <Ionicons name={tag.icon as any} size={16} color={isSelected ? 'white' : '#8E8E93'} />
                  <Text className={`ml-2 text-[14px] font-medium ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="px-5 py-4 pb-8 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity className="w-full h-14 bg-[#1B1C62] rounded-xl flex-row items-center justify-center" onPress={handleStartMatching}>
          <Text className="text-white text-[16px] font-bold mr-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Start Matching</Text>
          <Ionicons name="flash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
