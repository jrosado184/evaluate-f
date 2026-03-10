import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import Header from "@/components/Header";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Greeting from "@/components/Greeting";
import useGetUsers from "@/app/requests/useGetUsers";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useGetLockers from "@/app/requests/useGetLockers";
import getServerIP from "@/app/requests/NetworkAddress";
import useEvaluationStats from "@/hooks/useEvaluationsStats";
import useAuthContext from "@/app/context/AuthContext";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import SelectionSheet from "@/components/ui/sheets/SelectionSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

const StatBlock = ({ label, value, sub, highlightColor, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
  >
    <Text className="mb-1 text-xs text-neutral-500">{label}</Text>
    <Text className="text-2xl font-bold text-black">{value}</Text>
    {sub ? (
      <Text className={`mt-1 text-xs ${highlightColor}`}>{sub}</Text>
    ) : null}
  </TouchableOpacity>
);

const PerformanceBar = ({ name, percent, color }: any) => (
  <View className="mb-5">
    <Text className="mb-1 text-sm font-medium text-neutral-700">{name}</Text>
    <View className="h-3 rounded-full bg-neutral-200">
      <View
        className="h-3 rounded-full"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </View>
    <Text className="mt-1 text-xs text-neutral-500">{percent}%</Text>
  </View>
);

type DashboardSheetMode = "selectEmployee" | "evaluation";
type EvalSheetView = "summary" | "step1" | "step2" | "qualify";

export default function ModernDashboard() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const createdEvalIdRef = useRef<string | null>(null);

  const snapPoints = useMemo(() => ["94%"], []);

  const [showEvaluationSheet, setShowEvaluationSheet] = useState(false);
  const [dashboardSheetMode, setDashboardSheetMode] =
    useState<DashboardSheetMode>("selectEmployee");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const [sheetView, setSheetView] = useState<EvalSheetView>("step1");
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [step2Week, setStep2Week] = useState(1);
  const [qualifyPayload, setQualifyPayload] = useState<any>(null);

  const { currentUser } = useAuthContext();

  const { getLockers } = useGetLockers();
  const { setLockers, setLockerDetails, setLoading, lockerDetails } =
    useEmployeeContext();

  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [vacantLockers, setVacantLockers] = useState(0);

  const {
    completedCount,
    inProgressCount,
    percentComplete,
    percentInProgress,
  } = useEvaluationStats(evaluations);

  const fetchAllEvaluations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const res = await axios.get(`${baseUrl}/evaluations`, {
        headers: { Authorization: token! },
      });

      setEvaluations(res.data ?? []);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
    }
  };

  useEffect(() => {
    const fetchLockersForHome = async () => {
      setLoading(true);

      try {
        const data = await getLockers(1, 4);

        if (data) {
          setVacantLockers(data?.vacantLockers ?? 0);
          setLockers(data.results ?? []);
          setLockerDetails({
            totalPages: data.totalPages,
            currentPage: 1,
            totalLockers: data.totalLockers,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const run = async () => {
      await fetchLockersForHome();
      await fetchAllEvaluations();
    };

    run();
  }, []);

  useGetUsers(8);

  const resetEvaluationFlow = () => {
    setShowEvaluationSheet(false);
    setDashboardSheetMode("selectEmployee");
    setSelectedEmployeeId(null);
    setSheetView("step1");
    setEvaluationId(null);
    setStep2Week(1);
    setQualifyPayload(null);
    createdEvalIdRef.current = null;
  };

  const openEvaluationPicker = () => {
    resetEvaluationFlow();
    setShowEvaluationSheet(true);
  };

  useEffect(() => {
    if (!showEvaluationSheet) return;

    const id = setTimeout(() => {
      sheetRef.current?.present();
    }, 40);

    return () => clearTimeout(id);
  }, [showEvaluationSheet]);

  const closeEvaluationPicker = () => {
    sheetRef.current?.dismiss();
  };

  const handleSheetHeaderPress = () => {
    const effectiveEvaluationId = createdEvalIdRef.current || evaluationId;

    if (dashboardSheetMode === "evaluation") {
      if (sheetView === "summary") {
        closeEvaluationPicker();
        return;
      }

      if (sheetView === "step2" || sheetView === "qualify") {
        setSheetView("summary");
        return;
      }

      if (sheetView === "step1") {
        if (effectiveEvaluationId) {
          setSheetView("summary");
        } else {
          setDashboardSheetMode("selectEmployee");
          setSelectedEmployeeId(null);
        }
        return;
      }

      closeEvaluationPicker();
      return;
    }

    closeEvaluationPicker();
  };

  const sheetTitle =
    dashboardSheetMode === "selectEmployee"
      ? "Select Employee"
      : sheetView === "summary"
        ? "Evaluation Summary"
        : sheetView === "step2"
          ? `Week ${step2Week}`
          : sheetView === "qualify"
            ? "Qualify Evaluation"
            : "Start Evaluation";

  const sheetIconName =
    dashboardSheetMode === "selectEmployee" ? "x" : "arrow-left";

  return (
    <>
      <ScrollView className="bg-[#F9FAFB]">
        <SafeAreaView className="p-6">
          <Header />

          <View className="mb-2">
            <Greeting />
          </View>

          <View className="mb-6 flex-row gap-4">
            <StatBlock
              label="Total Lockers"
              value={lockerDetails?.totalLockers ?? 0}
              sub={`${vacantLockers} Vacant`}
              highlightColor="text-emerald-600"
            />
            <StatBlock
              label="Evaluations"
              value={`${completedCount} Qualified`}
              sub={`${inProgressCount} In Progress`}
              highlightColor="text-yellow-600"
            />
          </View>

          <View className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-4 text-sm font-semibold text-black">
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

          <View className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-4 text-sm font-semibold text-black">
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

          <View className="mb-10 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-4 text-sm font-semibold text-black">
              Quick Actions
            </Text>

            <View className="flex-row justify-between gap-4">
              <SinglePressTouchable className="flex-1 items-center">
                <View className="mb-1 rounded-xl bg-gray-100 p-3">
                  <MaterialIcons name="person-add-alt" size={20} color="#111" />
                </View>
                <Text className="text-xs text-neutral-700">Add Employee</Text>
              </SinglePressTouchable>

              <SinglePressTouchable
                onPress={openEvaluationPicker}
                className="flex-1 items-center"
              >
                <View className="mb-1 rounded-xl bg-gray-100 p-3">
                  <MaterialIcons name="assignment" size={20} color="#111" />
                </View>
                <Text className="text-xs text-neutral-700">
                  Start Evaluation
                </Text>
              </SinglePressTouchable>

              <SinglePressTouchable className="flex-1 items-center">
                <View className="mb-1 rounded-xl bg-gray-100 p-3">
                  <MaterialIcons name="vpn-key" size={20} color="#111" />
                </View>
                <Text className="text-xs text-neutral-700">Assign Locker</Text>
              </SinglePressTouchable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      {showEvaluationSheet ? (
        <AppBottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          title={sheetTitle}
          iconName={sheetIconName}
          onHeaderPress={handleSheetHeaderPress}
          onDismiss={resetEvaluationFlow}
          scroll={false}
        >
          {dashboardSheetMode === "selectEmployee" ? (
            <SelectionSheet
              mode="employees"
              source="dashboard"
              onEmployeeSelected={(employeeId) => {
                setSelectedEmployeeId(employeeId);
                setDashboardSheetMode("evaluation");
                setSheetView("step1");
                setEvaluationId(null);
                setStep2Week(1);
                setQualifyPayload(null);
                createdEvalIdRef.current = null;
              }}
            />
          ) : (
            <EvaluationSheet
              sheetView={sheetView}
              setSheetView={setSheetView}
              evaluationId={evaluationId}
              setEvaluationId={setEvaluationId}
              step2Week={step2Week}
              setStep2Week={setStep2Week}
              qualifyPayload={qualifyPayload}
              setQualifyPayload={setQualifyPayload}
              createdEvalIdRef={createdEvalIdRef}
              employeeId={selectedEmployeeId || ""}
              createdBy={currentUser?.name || ""}
              onClose={closeEvaluationPicker}
              onRefresh={fetchAllEvaluations}
            />
          )}
        </AppBottomSheet>
      ) : null}
    </>
  );
}
