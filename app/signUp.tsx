import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import NTULogo from '../assets/images/NTULogo.svg'

export default function logIn() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <View style={{paddingHorizontal: wp(6)}} className="flex-1 items-center justify-start pt-24">
          <View style={{width: '100%', maxWidth: 420}} className="gap-4">
            <View className="items-center">
              <NTULogo width={wp(70)} height={hp(18)} />
            </View>

            <View className="gap-6">
              <View className="gap-4">
                <View className="gap-1">
                  <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                    Email Address
                  </Text>
                  <View
                    style={{
                      height: hp(6),
                      shadowColor: '#000',
                      shadowOpacity: 0.04,
                      shadowOffset: {width: 0, height: 3},
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                    className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                  >
                    <TextInput
                      style={{fontSize: hp(2)}}
                      className="flex-1 text-neutral-900"
                      placeholder="username@e.ntu.edu.sg"
                      placeholderTextColor="#94a3b8" //TODO: add NTU fixed colours and fonts
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="gap-1">
                  <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                    Password
                  </Text>
                  <View
                    style={{
                      height: hp(6),
                      shadowColor: '#000',
                      shadowOpacity: 0.04,
                      shadowOffset: {width: 0, height: 3},
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                    className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                  >
                    <TextInput
                      style={{fontSize: hp(2)}}
                      className="flex-1 text-neutral-900"
                      placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <Pressable style={{height: hp(6)}} className="h-12 items-center justify-center rounded-xl bg-[#121C5D]">
                <Text style={{fontSize: hp(2.1)}} className="text-white font-semibold">
                  Sign Up
                </Text>
              </Pressable>

              <View className="items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Text style={{fontSize: hp(1.6)}} className="text-neutral-600">
                    Already have an account?
                  </Text>
                  <Link href="/logIn" asChild>
                    <Pressable hitSlop={8}>
                      <Text style={{fontSize: hp(1.6)}} className="text-[#121C5D] font-semibold">
                        Log In
                      </Text>
                    </Pressable>
                  </Link>
                </View>

                <Text style={{fontSize: hp(1.6)}} className="text-[#121C5D] font-semibold">
                      Forgot Password?
                </Text>

                {/* <Link href="/register" asChild>
                  <Pressable hitSlop={8}>
                    <Text style={{fontSize: hp(1.8)}} className="text-[#121C5D] font-semibold">
                      Forgot Password?
                    </Text>
                  </Pressable>
                </Link> */}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}
