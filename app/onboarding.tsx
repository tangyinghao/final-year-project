import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '@/context/authContext'
import { updateUserProfile, uploadProfilePhoto } from '@/services/userService'
import { DEFAULT_AVATAR } from '@/constants/images'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'

export default function OnboardingScreen() {
  const { user, refreshUserProfile } = useAuth()

  const [bio, setBio] = useState(user?.bio || '')
  const [major, setMajor] = useState(user?.programme || '')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [languages, setLanguages] = useState<string[]>(user?.languages?.length ? user.languages : ['English'])
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [matchingEnabled, setMatchingEnabled] = useState(user?.matchingEnabled ?? true)
  const [saving, setSaving] = useState(false)

  const LANGUAGE_SUGGESTIONS = ['English', 'Mandarin', 'Malay', 'Tamil', 'Hindi']
  const INTEREST_SUGGESTIONS = [
    'Signal Processing', 'Machine Learning', 'IoT', 'Power Systems',
    'Renewable Energy', '5G', 'IC Design', 'VLSI', 'ASIC', 'Communications',
    'RF Design', 'Computer Control', 'Automation', 'Microelectronics',
    'Semiconductors', 'Green Electronics', 'Robotics', 'Networking',
    'Mentoring', 'EVs', 'Battery', 'Antenna Design', 'Sensors', 'FPGA',
    'Firmware', 'Audio', 'Radar', 'RTOS',
  ]

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  const handleContinue = async () => {
    if (!user) return
    setSaving(true)
    try {
      let profilePhotoUrl = user.profilePhoto
      if (photoUri) {
        profilePhotoUrl = await uploadProfilePhoto(user.uid, photoUri)
      }
      await updateUserProfile(user.uid, {
        bio: bio.trim(),
        programme: major.trim(),
        profilePhoto: profilePhotoUrl,
        languages,
        interests,
        matchingEnabled,
        onboarded: true,
      })
      await refreshUserProfile()
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ paddingHorizontal: wp(6) }} className="flex-1 pt-12 pb-8 gap-8">

              {/* Header */}
              <View className="gap-2">
                <Text className="text-[28px] text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  Welcome, {user?.displayName?.split(' ')[0]}!
                </Text>
                <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  Let's set up your profile. You can always update this later.
                </Text>
              </View>

              {/* Profile Photo */}
              <View className="items-center gap-3">
                <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
                  <Image
                    source={photoUri ? { uri: photoUri } : DEFAULT_AVATAR}
                    className="w-28 h-28 rounded-full"
                  />
                  <View className="absolute bottom-0 right-0 bg-ntu-primary w-9 h-9 rounded-full items-center justify-center border-2 border-white">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-[14px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                  Add a profile photo
                </Text>
              </View>

              {/* Fields */}
              <View className="gap-4">
                <View className="gap-1">
                  <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Specialisation Pathway
                  </Text>
                  <TextInput
                    className="border border-border-default rounded-xl px-4 py-3 text-[16px] text-black bg-white"
                    style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                    placeholder="e.g. Signal Processing & Machine Learning"
                    value={major}
                    onChangeText={setMajor}
                  />
                </View>

                <View className="gap-1">
                  <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Bio
                  </Text>
                  <TextInput
                    className="border border-border-default rounded-xl px-4 py-3 text-[16px] text-black bg-white"
                    style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top', minHeight: 100 }}
                    placeholder="Tell others a bit about yourself..."
                    placeholderTextColor="#999"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                  />
                </View>

                <View className="gap-1">
                  <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Languages
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {LANGUAGE_SUGGESTIONS.map((lang) => {
                      const isSelected = languages.includes(lang)
                      return (
                        <TouchableOpacity
                          key={lang}
                          className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-ntu-primary border-ntu-primary' : 'bg-[#F6F6F6] border-[#D9D9D9]'}`}
                          onPress={() => toggleLanguage(lang)}
                        >
                          <Text className={`text-[14px] ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{lang}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>

                <View className="gap-1">
                  <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Interests
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {INTEREST_SUGGESTIONS.map((interest) => {
                      const isSelected = interests.includes(interest)
                      return (
                        <TouchableOpacity
                          key={interest}
                          className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-ntu-primary border-ntu-primary' : 'bg-[#F6F6F6] border-[#D9D9D9]'}`}
                          onPress={() => toggleInterest(interest)}
                        >
                          <Text className={`text-[14px] ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{interest}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>

                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-1 mr-4">
                    <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                      Enable Smart Match
                    </Text>
                    <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      Let others discover you based on your profile.
                    </Text>
                  </View>
                  <Switch
                    value={matchingEnabled}
                    onValueChange={setMatchingEnabled}
                    trackColor={{ false: '#E5E5EA', true: '#1B1C62' }}
                    thumbColor="white"
                  />
                </View>
              </View>

              {/* Spacer to push button down */}
              <View className="flex-1" />

              {/* CTA */}
              <View className="gap-3 pb-2">
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={saving}
                  className="bg-ntu-primary rounded-2xl py-4 items-center justify-center"
                >
                  {saving
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white text-[16px]" style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>Get Started</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={saving}
                  hitSlop={8}
                  className="items-center py-2"
                >
                  <Text className="text-[14px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
