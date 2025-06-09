import React from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Header from "@/components/Header";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Greeting from "@/components/Greeting";
import { router } from "expo-router";

const StatBlock = ({ label, value, sub, highlightColor }: any) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
    <Text className="text-xs text-neutral-500 mb-1">{label}</Text>
    <Text className="text-2xl font-bold text-black">{value}</Text>
    {sub && <Text className={`text-xs mt-1 ${highlightColor}`}>{sub}</Text>}
  </View>
);

const PerformanceBar = ({ name, percent, color }: any) => (
  <View className="mb-5">
    <Text className="text-sm font-medium text-neutral-700 mb-1">{name}</Text>
    <View className="h-3 bg-neutral-200 rounded-full">
      <View
        className="h-3 rounded-full"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </View>
    <Text className="text-xs text-neutral-500 mt-1">{percent}%</Text>
  </View>
);

export default function ModernDashboard() {
  return (
    <ScrollView className="bg-[#F9FAFB]">
      <SafeAreaView className="p-6">
        <Header />

        {/* Greeting */}
        <View className="mb-8">
          <Greeting />
        </View>

        {/* Stat Blocks */}
        <View className="flex-row gap-4 mb-6">
          <StatBlock
            label="Total Lockers"
            value="1000"
            sub="928 Vacant"
            highlightColor="text-emerald-600"
          />
          <StatBlock
            label="Evaluations"
            value="3 Qualified"
            sub="1 In Progress"
            highlightColor="text-yellow-600"
          />
        </View>

        {/* Evaluation Performance */}
        <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
          <Text className="text-sm font-semibold text-black mb-4">
            Evaluation Performance
          </Text>
          <PerformanceBar
            name="Evaluations Complete"
            percent={42}
            color="#F59E0B"
          />
          <PerformanceBar name="In Progress" percent={18} color="#FBBF24" />
        </View>

        {/* Termination Summary */}
        <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
          <Text className="text-sm font-semibold text-black mb-4">
            Terminations
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xl font-bold text-black">0</Text>
              <Text className="text-xs text-neutral-500">Under 90 days</Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-black">0</Text>
              <Text className="text-xs text-neutral-500">Over 90 days</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-10">
          <Text className="text-sm font-semibold text-black mb-4">
            Quick Actions
          </Text>
          <View className="flex-row justify-between gap-4">
            <SinglePressTouchable
              onPress={() => router.push("/(tabs)/users/add_user")}
              className="flex-1 items-center"
            >
              <View className="bg-gray-100 p-3 rounded-xl mb-1">
                <MaterialIcons name="person-add-alt" size={20} color="#111" />
              </View>
              <Text className="text-xs text-neutral-700">Add Employee</Text>
            </SinglePressTouchable>
            <SinglePressTouchable className="flex-1 items-center">
              <View className="bg-gray-100 p-3 rounded-xl mb-1">
                <MaterialIcons name="assignment" size={20} color="#111" />
              </View>
              <Text className="text-xs text-neutral-700">Start Evaluation</Text>
            </SinglePressTouchable>
            <SinglePressTouchable className="flex-1 items-center">
              <View className="bg-gray-100 p-3 rounded-xl mb-1">
                <MaterialIcons name="vpn-key" size={20} color="#111" />
              </View>
              <Text className="text-xs text-neutral-700">Assign Locker</Text>
            </SinglePressTouchable>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
