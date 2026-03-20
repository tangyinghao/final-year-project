import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, Pressable } from 'react-native';
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
  const [saving, setSaving] = useState(false);
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
      await updateUserProfile(user.uid, {
        displayName: name.trim(),
        bio: bio.trim(),
        programme: major.trim(),
        graduationYear: gradYear ? parseInt(gradYear) : null,
        profilePhoto: profilePhotoUrl,
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

          <Text className="px-4 text-[13px] text-[#8E8E93] uppercase mb-2" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>NTU Academic Info</Text>
          <View className="bg-white border-y border-[#E5E5EA] mb-8">
            <View className="flex-row items-center px-4 py-3 border-b border-[#E5E5EA]">
              <Text className="w-24 text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Major</Text>
              <TextInput
                className="flex-1 text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, paddingLeft: 8, includeFontPadding: false }}
                value={major}
                onChangeText={setMajor}
                placeholder="e.g. Computer Science"
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
