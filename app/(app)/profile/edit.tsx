import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/authContext';
import { updateUserProfile, uploadProfilePhoto } from '@/services/userService';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUserProfile } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gradYear, setGradYear] = useState(user?.graduationYear?.toString() || '');
  const [major, setMajor] = useState(user?.programme || '');
  const [languages, setLanguages] = useState<string[]>(user?.languages || []);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [matchingEnabled, setMatchingEnabled] = useState(user?.matchingEnabled ?? false);
  const [saving, setSaving] = useState(false);

  const LANGUAGE_SUGGESTIONS = ['English', 'Mandarin', 'Malay', 'Tamil', 'Hindi'];
  const INTEREST_SUGGESTIONS = [
    'Signal Processing', 'Machine Learning', 'IoT', 'Power Systems',
    'Renewable Energy', '5G', 'IC Design', 'VLSI', 'ASIC', 'Communications',
    'RF Design', 'Computer Control', 'Automation', 'Microelectronics',
    'Semiconductors', 'Green Electronics', 'Robotics', 'Networking',
    'Mentoring', 'EVs', 'Battery', 'Antenna Design', 'Sensors', 'FPGA',
    'Firmware', 'Audio', 'Radar', 'RTOS',
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const majorRef = useRef<TextInput>(null);

  const hasPhoto = !photoRemoved && (photoUri || user?.profilePhoto);
  const editBtnRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoRemoved(false);
    }
  };

  const handlePhotoEdit = useCallback(() => {
    if (showPhotoSheet) {
      setShowPhotoSheet(false);
      return;
    }
    editBtnRef.current?.measureInWindow((x, y, _w, height) => {
      setMenuPos({ top: y + height + 6, left: x - 130 });
      setShowPhotoSheet(true);
    });
  }, [showPhotoSheet]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let profilePhotoUrl = user.profilePhoto;
      if (photoRemoved) {
        profilePhotoUrl = null;
      } else if (photoUri) {
        profilePhotoUrl = await uploadProfilePhoto(user.uid, photoUri);
      }
      if (gradYear) {
        const y = parseInt(gradYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(y) || y < 1991 || y > currentYear + 6) {
          Alert.alert('Invalid Year', `Please enter a valid graduation year (1991–${currentYear + 6}).`);
          setSaving(false);
          return;
        }
      }
      await updateUserProfile(user.uid, {
        displayName: name.trim(),
        bio: bio.trim(),
        programme: major.trim(),
        graduationYear: gradYear ? parseInt(gradYear) : null,
        profilePhoto: profilePhotoUrl,
        languages,
        interests,
        matchingEnabled,
      });
      await refreshUserProfile();
      Alert.alert('Profile Saved', 'Your profile details have been updated.');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F6]">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-2 -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Edit Profile</Text>
        <TouchableOpacity className="px-2 py-2 -mr-2" onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#1B1C62" /> : (
            <Text className="text-[16px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center py-8 bg-white mb-2">
            <TouchableOpacity onPress={handlePhotoEdit} activeOpacity={0.7}>
              <Image source={hasPhoto ? { uri: (photoUri || user?.profilePhoto)! } : DEFAULT_AVATAR} className="w-28 h-28 rounded-full shadow-sm" />
              <View ref={editBtnRef} className="absolute bottom-0 right-0 bg-[#1B1C62] w-9 h-9 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="pencil" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-white border-y border-[#E5E5EA] mb-6">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E5E5EA]">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Name</Text>
              <TextInput className="flex-1 text-[16px] text-black pl-2" style={{ fontFamily: 'PlusJakartaSans-Regular' }} value={name} onChangeText={setName} placeholder="Your Name" />
            </View>
            <View className="flex-row items-start px-4 py-3">
              <Text className="w-24 text-[16px] text-black pt-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Bio</Text>
              <TextInput className="flex-1 text-[16px] text-black leading-5 min-h-[80px] pl-2" style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top' }} value={bio} onChangeText={setBio} placeholder="Write a short bio..." multiline />
            </View>
          </View>

          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>MSc EEE Info</Text>
          <View className="bg-white border-y border-[#E5E5EA] mb-8">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E5E5EA]">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Pathway</Text>
              <TextInput
                className="flex-1 text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, paddingLeft: 8, includeFontPadding: false }}
                value={major}
                onChangeText={setMajor}
                placeholder="e.g. Signal Processing & Machine Learning"
                selection={undefined}
                onLayout={(e) => {
                  // Force scroll to start on Android so first letter isn't clipped
                  if (Platform.OS === 'android') {
                    majorRef.current?.setNativeProps({ selection: { start: 0, end: 0 } });
                    setTimeout(() => majorRef.current?.setNativeProps({ selection: undefined }), 50);
                  }
                }}
                ref={majorRef}
              />
            </View>
            <View className="flex-row items-center px-4 py-3">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Class of</Text>
              <TextInput className="flex-1 text-[16px] text-black pl-2" style={{ fontFamily: 'PlusJakartaSans-Regular' }} value={gradYear} onChangeText={setGradYear} keyboardType="numeric" placeholder="e.g. 2024" />
            </View>
          </View>

          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Languages</Text>
          <View className="bg-white border-y border-[#E5E5EA] mb-6 px-4 py-3">
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGE_SUGGESTIONS.map((lang) => {
                const isSelected = languages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-[#1B1C62] border-[#1B1C62]' : 'bg-[#F6F6F6] border-[#F6F6F6]'}`}
                    onPress={() => toggleLanguage(lang)}
                  >
                    <Text className={`text-[14px] ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Interests</Text>
          <View className="bg-white border-y border-[#E5E5EA] mb-6 px-4 py-3">
            <View className="flex-row flex-wrap gap-2">
              {INTEREST_SUGGESTIONS.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-[#1B1C62] border-[#1B1C62]' : 'bg-[#F6F6F6] border-[#F6F6F6]'}`}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text className={`text-[14px] ${isSelected ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{interest}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Smart Match</Text>
          <View className="bg-surface-info border-y border-border-info mb-8 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={16} color="#1B1C62" />
                  <Text className="text-[16px] text-ntu-primary ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Enable Discovery</Text>
                </View>
                <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Let others discover you based on your profile.</Text>
              </View>
              <Switch
                value={matchingEnabled}
                onValueChange={setMatchingEnabled}
                trackColor={{ false: '#E5E5EA', true: '#1B1C62' }}
                thumbColor="white"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo options popover */}
      {showPhotoSheet && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
            onPress={() => setShowPhotoSheet(false)}
          />
          <View
            style={{
              position: 'absolute',
              top: menuPos.top,
              left: menuPos.left,
              width: 175,
              zIndex: 100,
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E5EA',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => { setShowPhotoSheet(false); pickPhoto(); }}
            >
              <Ionicons name="image-outline" size={18} color="#1B1C62" />
              <Text className="text-[14px] text-black ml-3" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                {hasPhoto ? 'Change Photo' : 'Choose Photo'}
              </Text>
            </TouchableOpacity>
            {hasPhoto && (
              <>
                <View style={{ height: 1, backgroundColor: '#E5E5EA', marginHorizontal: 12 }} />
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3"
                  onPress={() => { setShowPhotoSheet(false); setPhotoUri(null); setPhotoRemoved(true); }}
                >
                  <Ionicons name="trash-outline" size={18} color="#D71440" />
                  <Text className="text-[14px] text-[#D71440] ml-3" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
