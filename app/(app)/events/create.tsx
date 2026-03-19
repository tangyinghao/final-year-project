import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const titleRef = React.useRef<TextInput>(null);
  const locationRef = React.useRef<TextInput>(null);
  const descRef = React.useRef<TextInput>(null);
  const capacityRef = React.useRef<TextInput>(null);

  const handlePost = () => {
    if (!title.trim()) return titleRef.current?.focus();
    if (!location.trim()) return locationRef.current?.focus();
    if (!description.trim()) return descRef.current?.focus();
    if (!capacity.trim()) return capacityRef.current?.focus();
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
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-2 -ml-2">
          <Text className="text-[16px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          New Event
        </Text>
        <TouchableOpacity 
          className="px-2 py-2 -mr-2"
          onPress={handlePost}
        >
          <Text className="text-[16px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Title Input */}
          <View className="px-5 pt-6 pb-2">
            <TextInput
              ref={titleRef}
              className="text-[28px] font-bold text-black"
              style={{ fontFamily: 'PlusJakartaSans-Bold' }}
              placeholder="Event Title..."
              placeholderTextColor="#C7C7CC"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Media Upload */}
          <View className="px-5 py-4">
            <TouchableOpacity className="w-full h-[140px] rounded-xl border-2 border-dashed border-[#C7C7CC] bg-[#F6F6F6] items-center justify-center">
              <Ionicons name="camera-outline" size={32} color="#8E8E93" />
              <Text className="text-[15px] text-[#8E8E93] mt-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Add Cover Image</Text>
            </TouchableOpacity>
          </View>

          {/* Date & Time Rows */}
          <View className="mt-4 px-5">
            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Date</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="compact"
                  themeVariant="light"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) setDate(selectedDate);
                  }}
                  accentColor="#1B1C62"
                />
              ) : (
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                    <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{date.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Time</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="compact"
                  themeVariant="light"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) setDate(selectedDate);
                  }}
                  accentColor="#1B1C62"
                />
              ) : (
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <View className="flex-row items-center bg-[#F6F6F6] px-3 py-1.5 rounded-lg">
                    <Text className="text-[15px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Android native dialog pickers */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={(_event: any, selectedDate?: Date) => {
                  setShowTimePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Location */}
          <View className="px-5 mt-6 mb-4">
            <View className="flex-row items-center bg-[#F6F6F6] rounded-xl px-4 py-3">
              <Ionicons name="location-outline" size={24} color="#8E8E93" />
              <TextInput
                ref={locationRef}
                className="flex-1 ml-3 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', height: 24 }}
                placeholder="Add Location"
                placeholderTextColor="#8E8E93"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Description */}
          <View className="px-5 mb-4">
            <View className="bg-[#F6F6F6] rounded-xl px-4 py-3 min-h-[120px]">
              <TextInput
                ref={descRef}
                className="flex-1 text-[16px] text-black"
                style={{ fontFamily: 'PlusJakartaSans-Regular', textAlignVertical: 'top' }}
                placeholder="What is this event about?"
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Capacity */}
          <View className="px-5 mb-10">
            <View className="flex-row items-center justify-between py-4 border-y border-[#E5E5EA]">
              <Text className="text-[17px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Max capacity</Text>
              <View className="flex-row items-center">
                <TextInput
                  ref={capacityRef}
                  className="bg-[#F6F6F6] rounded-lg px-3 py-1.5 w-16 text-center text-[15px] text-black font-medium"
                  style={{ fontFamily: 'PlusJakartaSans-Medium' }}
                  placeholder="20"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="number-pad"
                  value={capacity}
                  onChangeText={setCapacity}
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
            <Text className="text-[20px] font-bold text-black mb-2 text-center" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Submit for Review?
            </Text>
            <Text className="text-[15px] text-[#666666] text-center mb-6 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
              Your event will be sent to administrators for approval before it becomes publicly visible on the Events board.
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
