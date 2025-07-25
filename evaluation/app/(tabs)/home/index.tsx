import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Header from "@/components/Header";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Greeting from "@/components/Greeting";
import { router } from "expo-router";
import SlideUpModal from "@/components/SlideUpModal";
import useGetUsers from "@/app/requests/useGetUsers";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useGetLockers from "@/app/requests/useGetLockers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import useEvaluationStats from "@/hooks/useEvaluationsStats";

const StatBlock = ({ label, value, sub, highlightColor, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
  >
    <Text className="text-xs text-neutral-500 mb-1">{label}</Text>
    <Text className="text-2xl font-bold text-black">{value}</Text>
    {sub && <Text className={`text-xs mt-1 ${highlightColor}`}>{sub}</Text>}
  </TouchableOpacity>
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
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const { employees, loading } = useEmployeeContext();
  const { getLockers } = useGetLockers();
  const { setLockers, setLockerDetails, setLoading, lockerDetails } =
    useEmployeeContext();
  const [evaluations, setEvaluations] = useState([]);
  const [vacantLockers, setVacantLockers] = useState(0);

  const {
    completedCount,
    inProgressCount,
    percentComplete,
    percentInProgress,
  } = useEvaluationStats(evaluations);

  useEffect(() => {
    const fetchLockersForHome = async () => {
      setLoading(true);
      const data = await getLockers(1, 4);
      if (data) {
        setVacantLockers(data?.vacantLockers);
        setLockers(data.results);
        setLockerDetails({
          totalPages: data.totalPages,
          currentPage: 1,
          totalLockers: data.totalLockers,
        });
      }
      setLoading(false);
    };

    const fetchAllEvaluations = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/evaluations`, {
          headers: { Authorization: token! },
        });
        setEvaluations(res.data);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
      }
    };

    fetchLockersForHome();
    fetchAllEvaluations();
  }, []);

  useGetUsers(8);

  return (
    <ScrollView className="bg-[#F9FAFB]">
      <SafeAreaView className="p-6">
        <Header />

        <View className="mb-8">
          <Greeting />
        </View>

        <View className="flex-row gap-4 mb-6">
          <StatBlock
            label="Total Lockers"
            value={lockerDetails?.totalLockers}
            sub={`${vacantLockers} Vacant`}
            highlightColor="text-emerald-600"
          />
          <StatBlock
            onPress={() => router.push("/(tabs)/evaluations")}
            label="Evaluations"
            value={`${completedCount} Qualified`}
            sub={`${inProgressCount} In Progress`}
            highlightColor="text-yellow-600"
          />
        </View>

        <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
          <Text className="text-sm font-semibold text-black mb-4">
            Evaluation Performance
          </Text>
          <PerformanceBar
            name="Evaluations Complete"
            percent={percentComplete}
            color="#10B981"
          />
          <PerformanceBar
            name="In Progress"
            percent={percentInProgress}
            color="#FBBF24"
          />
        </View>

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

            <SinglePressTouchable
              onPress={() => setShowEvaluationModal(true)}
              className="flex-1 items-center"
            >
              <View className="bg-gray-100 p-3 rounded-xl mb-1">
                <MaterialIcons name="assignment" size={20} color="#111" />
              </View>
              <Text className="text-xs text-neutral-700">Start Evaluation</Text>
            </SinglePressTouchable>

            <SinglePressTouchable
              onPress={() => router.push("/(tabs)/lockers")}
              className="flex-1 items-center"
            >
              <View className="bg-gray-100 p-3 rounded-xl mb-1">
                <MaterialIcons name="vpn-key" size={20} color="#111" />
              </View>
              <Text className="text-xs text-neutral-700">Assign Locker</Text>
            </SinglePressTouchable>
          </View>
        </View>

        <SlideUpModal
          visible={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          employees={employees}
          loading={loading}
          source="dashboard"
          mode="assignEmployee"
          onSelectEmployee={(employee: any) => {
            router.push(`/users/${employee._id}`);
            setShowEvaluationModal(false);
          }}
        />
      </SafeAreaView>
    </ScrollView>
  );
}
