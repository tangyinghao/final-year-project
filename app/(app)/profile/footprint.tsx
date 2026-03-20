import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useAuth } from '@/context/authContext';
import { getCheckins, checkIn, uncheckIn } from '@/services/footprintService';
import { FootprintCheckin, FootprintMapType } from '@/types';
import { NTU_ZONES, NTU_TOTAL_ZONES, NTU_VIEWBOX } from '@/constants/ntuZones';
import { SG_ZONES, SG_TOTAL_ZONES, SG_VIEWBOX } from '@/constants/sgZones';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getRank = (count: number, total: number) => {
  const pct = count / total;
  if (pct >= 0.8) return 'Legend';
  if (pct >= 0.5) return 'Veteran';
  if (pct >= 0.25) return 'Explorer';
  if (count >= 1) return 'Newcomer';
  return 'Not Started';
};

const formatTime = (checkin: FootprintCheckin) => {
  if (!checkin.checkedInAt) return '';
  const date = checkin.checkedInAt.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
};

export default function FootprintMapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FootprintMapType>('ntu');
  const [ntuCheckins, setNtuCheckins] = useState<FootprintCheckin[]>([]);
  const [sgCheckins, setSgCheckins] = useState<FootprintCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const [ntu, sg] = await Promise.allSettled([
          getCheckins(user.uid, 'ntu'),
          getCheckins(user.uid, 'singapore'),
        ]);
        if (ntu.status === 'fulfilled') setNtuCheckins(ntu.value);
        if (sg.status === 'fulfilled') setSgCheckins(sg.value);
      } catch (e) {
        console.log('Footprint fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const checkins = activeTab === 'ntu' ? ntuCheckins : sgCheckins;
  const zones = activeTab === 'ntu' ? NTU_ZONES : SG_ZONES;
  const totalZones = activeTab === 'ntu' ? NTU_TOTAL_ZONES : SG_TOTAL_ZONES;
  const viewBox = activeTab === 'ntu' ? NTU_VIEWBOX : SG_VIEWBOX;
  const checkedInIds = new Set(checkins.map((c) => c.zoneId));
  const progressPct = Math.round((checkins.length / totalZones) * 100);

  const handleZonePress = async (zoneId: string, zoneName: string) => {
    if (!user?.uid) return;
    if (checkedInIds.has(zoneId)) {
      // Uncheck the zone
      await uncheckIn(user.uid, zoneId);
      if (activeTab === 'ntu') {
        setNtuCheckins(ntuCheckins.filter((c) => c.zoneId !== zoneId));
      } else {
        setSgCheckins(sgCheckins.filter((c) => c.zoneId !== zoneId));
      }
      return;
    }
    await checkIn(user.uid, zoneId, zoneName, activeTab);
    const newCheckin: FootprintCheckin = {
      zoneId,
      zoneName,
      mapType: activeTab,
      checkedInAt: { toDate: () => new Date() } as any,
    };
    if (activeTab === 'ntu') {
      setNtuCheckins([newCheckin, ...ntuCheckins]);
    } else {
      setSgCheckins([newCheckin, ...sgCheckins]);
    }
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
          Footprint Map
        </Text>
        <View className="w-10" />
      </View>

      {/* Tab Toggle */}
      <View className="flex-row mx-4 mt-3 mb-2 bg-[#F6F6F6] rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'ntu' ? 'bg-[#1B1C62]' : ''}`}
          onPress={() => setActiveTab('ntu')}
        >
          <Text className={`text-[14px] font-bold ${activeTab === 'ntu' ? 'text-white' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            NTU Campus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'singapore' ? 'bg-[#1B1C62]' : ''}`}
          onPress={() => setActiveTab('singapore')}
        >
          <Text className={`text-[14px] font-bold ${activeTab === 'singapore' ? 'text-white' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Singapore
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B1C62" />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* SVG Map */}
          <View className="mx-4 mt-2 bg-[#F8FAFF] rounded-2xl border border-[#E5E5EA] overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
              <Svg
                width={Math.max(SCREEN_WIDTH - 32, 380)}
                height={activeTab === 'ntu' ? 420 : 320}
                viewBox={viewBox}
              >
                {zones.map((zone) => {
                  const isCheckedIn = checkedInIds.has(zone.id);
                  return (
                    <React.Fragment key={zone.id}>
                      <Path
                        d={zone.path}
                        fill={isCheckedIn ? '#1B1C62' : '#E8EDF5'}
                        stroke={isCheckedIn ? '#0F1147' : '#C4CDDF'}
                        strokeWidth={1.5}
                        onPress={() => handleZonePress(zone.id, zone.name)}
                      />
                      <SvgText
                        x={zone.labelX}
                        y={zone.labelY}
                        fontSize={activeTab === 'ntu' ? 8 : 7}
                        fill={isCheckedIn ? '#FFFFFF' : '#5A6478'}
                        textAnchor="middle"
                        fontWeight="bold"
                        onPress={() => handleZonePress(zone.id, zone.name)}
                      >
                        {zone.shortName}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </ScrollView>
          </View>

          {/* Stats Card */}
          <View className="px-4 mt-4 mb-4">
            <View className="bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-[#E5E5EA]">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[14px] text-[#8E8E93] mb-1" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                    {activeTab === 'ntu' ? 'Campus Zones' : 'Areas'} Unlocked
                  </Text>
                  <Text className="text-[24px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                    {checkins.length} <Text className="text-[16px] text-[#8E8E93]">/ {totalZones}</Text>
                  </Text>
                </View>
                <View className="w-12 h-12 bg-[#F6F6F6] rounded-full items-center justify-center">
                  <Ionicons name="trophy" size={24} color="#D71440" />
                </View>
              </View>
              <View className="h-[6px] bg-[#E5E5EA] rounded-full w-full overflow-hidden mb-4">
                <View className="h-full bg-[#1B1C62] rounded-full" style={{ width: `${progressPct}%` }} />
              </View>
              <View className="flex-row items-center">
                <Text className="text-[14px] text-black" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                  {activeTab === 'ntu' ? 'Campus' : 'Singapore'} Rank:{' '}
                </Text>
                <Text className="text-[14px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {getRank(checkins.length, totalZones)}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Check-ins */}
          <View className="px-4 pb-12">
            <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
              Recent Check-ins
            </Text>

            {checkins.length === 0 ? (
              <Text className="text-[15px] text-[#8E8E93] text-center mt-4" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                {activeTab === 'ntu'
                  ? 'Tap a zone on the campus map to check in!'
                  : 'Tap a planning area on the map to check in!'}
              </Text>
            ) : (
              checkins.map((item, index) => (
                <View key={item.zoneId} className="flex-row items-start mb-6">
                  <View className="w-10 h-10 rounded-full bg-[#1B1C62] items-center justify-center border border-[#0F1147] mr-4 z-10">
                    <Ionicons name="location" size={18} color="white" />
                  </View>
                  <View className="flex-1 pt-1 justify-center">
                    <Text className="text-[16px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                      {item.zoneName}
                    </Text>
                    <Text className="text-[13px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      {formatTime(item)}
                    </Text>
                  </View>

                  {index < checkins.length - 1 && (
                    <View className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-[#E5E5EA]" />
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
