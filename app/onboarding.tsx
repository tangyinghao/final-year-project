import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator,
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

  const [bio, setBio] = useState('')
  const [major, setMajor] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
                    Programme / Major
                  </Text>
                  <TextInput
                    className="border border-border-default rounded-xl px-4 py-3 text-[16px] text-black bg-white"
                    style={{ fontFamily: 'PlusJakartaSans-Regular' }}
                    placeholder="e.g. Computer Science"
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
