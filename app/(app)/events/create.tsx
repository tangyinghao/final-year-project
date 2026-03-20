import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/authContext';
import { createUserEvent, uploadEventImage } from '@/services/eventService';

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImageUri(result.assets[0].uri);
    }
  };

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const titleRef = React.useRef<TextInput>(null);
  const locationRef = React.useRef<TextInput>(null);
  const descRef = React.useRef<TextInput>(null);
  const capacityRef = React.useRef<TextInput>(null);

  const handlePost = () => {
    const e = new Set<string>();
    if (!title.trim()) e.add('title');
    if (!location.trim()) e.add('location');
    if (!description.trim()) e.add('description');
    if (!capacity.trim()) e.add('capacity');
    setErrors(e);
    if (e.size > 0) {
      const first = e.has('title') ? titleRef : e.has('location') ? locationRef : e.has('description') ? descRef : capacityRef;
      setTimeout(() => first.current?.focus(), 100);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const eventId = await createUserEvent(user.uid, user.displayName, {
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim(),
        maxCapacity: capacity ? parseInt(capacity) : null,
      });
      if (coverImageUri) {
        const imageUrl = await uploadEventImage(eventId, coverImageUri);
        // Update the event doc with the uploaded image URL
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/config/firebaseConfig');
        await updateDoc(doc(db, 'events', eventId), { coverImage: imageUrl });
      }
      setShowConfirmModal(false);
      router.back();
    } catch (e) {
      console.error('Failed to create event:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-2 -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          New Event
        </Text>
        <TouchableOpacity className="px-2 py-2 -mr-2" onPress={handlePost}>
          <Text className="text-[16px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className={`px-5 pt-6 pb-2 ${errors.has('title') ? 'border-b-2 border-red-400' : ''}`}>
            <TextInput
              ref={titleRef}
              className="text-[28px] font-bold text-black"
              style={{ fontFamily: 'PlusJakartaSans-Bold' }}
              placeholder="Event Title..."
              placeholderTextColor={errors.has('title') ? '#F87171' : '#C7C7CC'}
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors((prev) => { const n = new Set(prev); n.delete('title'); return n; }); }}
            />
          </View>

          <View className="px-5 py-4">
            <TouchableOpacity
              className="w-full h-[140px] rounded-xl overflow-hidden border-2 border-dashed border-[#C7C7CC] bg-[#F6F6F6] items-center justify-center"
              onPress={pickCoverImage}
            >
              {coverImageUri ? (
                <Image source={{ uri: coverImageUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color="#8E8E93" />
                  <Text className="text-[15px] text-[#8E8E93] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Add Cover Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-4 px-5">
            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Date</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker value={date} mode="date" display="compact" themeVariant="light" onChange={(_event: any, selectedDate?: Date) => { if (selectedDate) setDate(selectedDate); }} accentColor="#1B1C62" />
              ) : (
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                    <Text className="text-[15px] font-medium text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{date.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Time</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker value={date} mode="time" display="compact" themeVariant="light" onChange={(_event: any, selectedDate?: Date) => { if (selectedDate) setDate(selectedDate); }} accentColor="#1B1C62" />
              ) : (
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                    <Text className="text-[15px] font-medium text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker value={date} mode="date" display="default" onChange={(_event: any, selectedDate?: Date) => { setShowDatePicker(false); if (selectedDate) setDate(selectedDate); }} />
            )}
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker value={date} mode="time" display="default" onChange={(_event: any, selectedDate?: Date) => { setShowTimePicker(false); if (selectedDate) setDate(selectedDate); }} />
            )}
          </View>

          <View className="px-5 mt-6 mb-4">
            <View className={`flex-row items-center bg-[#F6F6F6] rounded-xl px-4 py-3 ${errors.has('location') ? 'border-2 border-red-400' : ''}`}>
              <Ionicons name="location-outline" size={24} color={errors.has('location') ? '#F87171' : '#8E8E93'} />
              <TextInput
                ref={locationRef}
                className="flex-1 ml-3 text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16 }}
                placeholder="Add Location"
                placeholderTextColor={errors.has('location') ? '#F87171' : '#8E8E93'}
                value={location}
                onChangeText={(t) => { setLocation(t); setErrors((prev) => { const n = new Set(prev); n.delete('location'); return n; }); }}
              />
            </View>
          </View>

          <View className="px-5 mb-4">
            <View className={`bg-[#F6F6F6] rounded-xl px-4 py-3 min-h-[120px] ${errors.has('description') ? 'border-2 border-red-400' : ''}`}>
              <TextInput
                ref={descRef}
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top' }}
                placeholder="What is this event about?"
                placeholderTextColor={errors.has('description') ? '#F87171' : '#8E8E93'}
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={(t) => { setDescription(t); setErrors((prev) => { const n = new Set(prev); n.delete('description'); return n; }); }}
              />
            </View>
          </View>

          <View className="px-5 mb-10">
            <View className="flex-row items-center justify-between py-4 border-y border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Max capacity</Text>
              <View className="flex-row items-center">
                <TextInput
                  ref={capacityRef}
                  className={`bg-[#F6F6F6] rounded-lg px-3 py-1.5 w-16 text-center text-[15px] text-black font-medium ${errors.has('capacity') ? 'border-2 border-red-400' : ''}`}
                  style={{ fontFamily: 'PlusJakartaSans-Medium' }}
                  placeholder="20"
                  placeholderTextColor={errors.has('capacity') ? '#F87171' : '#C7C7CC'}
                  keyboardType="number-pad"
                  value={capacity}
                  onChangeText={(t) => { setCapacity(t); setErrors((prev) => { const n = new Set(prev); n.delete('capacity'); return n; }); }}
                />
                <Text className="text-[15px] text-[#8E8E93] ml-2" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>people</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full max-w-[340px] rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar" size={32} color="#1B1C62" />
            </View>
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Submit for Review?</Text>
            <Text className="text-[15px] text-[#666666] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Your event will be sent to administrators for approval before it becomes publicly visible on the Events board.
            </Text>
            <View className="w-full flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl border border-[#E5E5EA] items-center" onPress={() => setShowConfirmModal(false)}>
                <Text className="text-[16px] font-bold text-[#666666]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-[#1B1C62] items-center" onPress={confirmSubmit} disabled={submitting}>
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
