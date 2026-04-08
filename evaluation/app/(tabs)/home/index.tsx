import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

import Header from "@/components/Header";
import Greeting from "@/components/Greeting";
import SinglePressTouchable from "@/app/utils/SinglePress";
import useGetUsers from "@/app/requests/useGetUsers";
import getServerIP from "@/app/requests/NetworkAddress";
import useAuthContext from "@/app/context/AuthContext";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import SelectionSheet from "@/components/ui/sheets/SelectionSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

import KpiCard from "@/components/dashboard/KpiCard";
import SectionCard from "@/components/dashboard/SectionCard";
import DonutChartCard from "@/components/dashboard/DonutChartCard";
import MiniBarChart from "@/components/dashboard/MiniBarChart";
import RiskPill from "@/components/dashboard/RiskPill";

import {
  DashboardSheetMode,
  EvalSheetView,
} from "@/components/dashboard/dashboard.types";
import {
  buildHealthSegments,
  daysBetween,
  getCompletedDate,
  getCreatedDate,
  getRiskStatus,
  isInProgress,
  isQualified,
} from "@/components/dashboard/dashboard.utils";

export default function ModernDashboard() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1100;

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
  const [evaluations, setEvaluations] = useState<any[]>([]);

  const { currentUser } = useAuthContext();

  const maxWidth = isLargeTablet ? 1280 : isTablet ? 1040 : 680;
  const donutSize = isTablet ? 198 : 148;
  const chartHeight = isTablet ? 170 : 118;
  const barWidth = isTablet ? 24 : 18;
  const kpiWidth = isTablet ? "24%" : "48.5%";
  const chartCardHeight = isTablet ? 365 : undefined;

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
    fetchAllEvaluations();
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

  const dashboardData = useMemo(() => {
    const active = evaluations.filter(isInProgress);
    const completed = evaluations.filter(isQualified);

    const completedThisMonth = completed.filter((evaluation) => {
      const completedDate = new Date(getCompletedDate(evaluation));
      if (Number.isNaN(completedDate.getTime())) return false;

      const now = new Date();
      return (
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear()
      );
    });

    const onTrack = active.filter((e) => getRiskStatus(e) === "onTrack");
    const watchList = active.filter((e) => getRiskStatus(e) === "watch");
    const atRisk = active.filter((e) => getRiskStatus(e) === "atRisk");
    const critical = active.filter((e) => getRiskStatus(e) === "critical");
    const readyToQualify = active.filter((e) => getRiskStatus(e) === "ready");

    const avgDaysToQualifyValues = completed
      .map((evaluation) =>
        daysBetween(getCreatedDate(evaluation), getCompletedDate(evaluation)),
      )
      .filter((value): value is number => typeof value === "number");

    const avgDaysToQualify =
      avgDaysToQualifyValues.length > 0
        ? Math.round(
            avgDaysToQualifyValues.reduce((sum, value) => sum + value, 0) /
              avgDaysToQualifyValues.length,
          )
        : 0;

    const onTrackRate =
      active.length > 0
        ? Math.round((onTrack.length / active.length) * 100)
        : 0;

    const healthSegments = buildHealthSegments(
      onTrack,
      watchList,
      atRisk,
      critical,
    );

    const now = new Date();
    const weeklyPaceData = Array.from({ length: 8 }).map((_, i) => {
      const weekOffset = 7 - i;
      const start = new Date(now);
      start.setDate(now.getDate() - weekOffset * 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const actualQualified = completed.filter((evaluation) => {
        const completedDate = new Date(getCompletedDate(evaluation) || "");
        if (Number.isNaN(completedDate.getTime())) return false;
        return completedDate >= start && completedDate <= end;
      }).length;

      return {
        label: `W${i + 1}`,
        value: actualQualified,
        target: Math.max(1, Math.ceil(active.length / 8)),
      };
    });

    return {
      active,
      completedThisMonth,
      onTrack,
      watchList,
      atRisk,
      critical,
      readyToQualify,
      avgDaysToQualify,
      onTrackRate,
      healthSegments,
      weeklyPaceData,
    };
  }, [evaluations]);

  return (
    <>
      <ScrollView
        className="bg-[#F3F5F8]"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView className="self-center w-full px-5" style={{ maxWidth }}>
          <Header />

          <View className="mb-6">
            <Greeting />

            <View className="mt-3 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[11px] font-medium uppercase tracking-[1px] text-neutral-400">
                  Overview
                </Text>

                <Text className="mt-1 text-[20px] font-semibold tracking-[-0.4px] text-[#111827]">
                  Training Dashboard
                </Text>

                <Text className="mt-1 text-[13px] leading-5 text-neutral-500">
                  Training health and qualification pace at a glance.
                </Text>
              </View>
            </View>
          </View>

          <View
            className="mb-5 flex-row flex-wrap justify-between"
            style={{ rowGap: 12 }}
          >
            <View style={{ width: kpiWidth }}>
              <KpiCard
                label="Active Trainees"
                value={dashboardData.active.length}
                sub={`${dashboardData.readyToQualify.length} ready to qualify`}
                icon="groups"
                accent="neutral"
                onPress={() => router.push("/(tabs)/evaluations")}
              />
            </View>

            <View style={{ width: kpiWidth }}>
              <KpiCard
                label="On-Track Rate"
                value={`${dashboardData.onTrackRate}%`}
                sub={`${dashboardData.onTrack.length} on pace`}
                icon="trending-up"
                accent="success"
                onPress={() => router.push("/(tabs)/evaluations")}
              />
            </View>

            <View style={{ width: kpiWidth }}>
              <KpiCard
                label="At Risk"
                value={
                  dashboardData.atRisk.length + dashboardData.critical.length
                }
                sub={`${dashboardData.critical.length} critical`}
                icon="warning-amber"
                accent="danger"
                onPress={() => router.push("/(tabs)/evaluations")}
              />
            </View>

            <View style={{ width: kpiWidth }}>
              <KpiCard
                label="Qualified This Month"
                value={dashboardData.completedThisMonth.length}
                sub={`Avg ${dashboardData.avgDaysToQualify} days`}
                icon="task-alt"
                accent="primary"
                onPress={() => router.push("/(tabs)/evaluations")}
              />
            </View>
          </View>

          <View
            className="mb-5"
            style={{
              flexDirection: isTablet ? "row" : "column",
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                minHeight: chartCardHeight,
              }}
            >
              <DonutChartCard
                title="Training Health"
                subtitle="Hours invested versus qualification progress"
                centerValue={`${dashboardData.onTrackRate}%`}
                centerLabel="on track"
                segments={dashboardData.healthSegments}
                size={donutSize}
                topStatLabel="Active evaluations"
                topStatValue={dashboardData.active.length}
                matchHeight={isTablet}
              />
            </View>

            <View
              style={{
                flex: 1,
                minHeight: chartCardHeight,
              }}
            >
              <SectionCard
                title="Qualification Pace"
                subtitle="Actual completions vs target, last 8 weeks"
                containerStyle={
                  isTablet ? { minHeight: chartCardHeight } : undefined
                }
                contentStyle={isTablet ? { flex: 1 } : undefined}
              >
                <View
                  style={{
                    flex: isTablet ? 1 : undefined,
                    justifyContent: "space-between",
                  }}
                >
                  <MiniBarChart
                    data={dashboardData.weeklyPaceData}
                    maxValue={Math.max(
                      ...dashboardData.weeklyPaceData.map((d) =>
                        Math.max(d.value, d.target || 0),
                      ),
                      1,
                    )}
                    chartHeight={chartHeight}
                    barWidth={barWidth}
                  />

                  <View className="mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <Text className="text-[12px] text-neutral-500">
                        Actual qualified
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View className="mr-2 h-[2px] w-4 rounded-full bg-slate-400" />
                      <Text className="text-[12px] text-neutral-500">
                        Target
                      </Text>
                    </View>
                  </View>
                </View>
              </SectionCard>
            </View>
          </View>

          <View className="mb-5">
            <SectionCard
              title="Risk Summary"
              subtitle="Calculated from hours on job compared to qualification progress"
            >
              <View className="flex-row gap-3">
                <RiskPill
                  label="Critical"
                  value={dashboardData.critical.length}
                  tone="danger"
                />
                <RiskPill
                  label="At Risk"
                  value={dashboardData.atRisk.length}
                  tone="warning"
                />
              </View>

              <View className="mt-2.5 flex-row gap-3">
                <RiskPill
                  label="Watch"
                  value={dashboardData.watchList.length}
                  tone="primary"
                />
                <RiskPill
                  label="Ready"
                  value={dashboardData.readyToQualify.length}
                  tone="success"
                />
              </View>
            </SectionCard>
          </View>

          <View className="mb-5 pb-10">
            <SectionCard title="Quick Actions">
              <View className="flex-row justify-between gap-4">
                <SinglePressTouchable className="flex-1 items-center">
                  <View className="mb-2 rounded-2xl bg-gray-100 p-3">
                    <MaterialIcons
                      name="person-add-alt"
                      size={20}
                      color="#111827"
                    />
                  </View>
                  <Text className="text-center text-[12px] font-medium text-neutral-700">
                    Add Employee
                  </Text>
                </SinglePressTouchable>

                <SinglePressTouchable
                  onPress={openEvaluationPicker}
                  className="flex-1 items-center"
                >
                  <View className="mb-2 rounded-2xl bg-blue-50 p-3">
                    <MaterialIcons
                      name="assignment"
                      size={20}
                      color="#2563EB"
                    />
                  </View>
                  <Text className="text-center text-[12px] font-medium text-neutral-700">
                    Start Evaluation
                  </Text>
                </SinglePressTouchable>

                <SinglePressTouchable
                  onPress={() => router.push("/(tabs)/evaluations")}
                  className="flex-1 items-center"
                >
                  <View className="mb-2 rounded-2xl bg-gray-100 p-3">
                    <MaterialIcons
                      name="fact-check"
                      size={20}
                      color="#111827"
                    />
                  </View>
                  <Text className="text-center text-[12px] font-medium text-neutral-700">
                    Evaluations
                  </Text>
                </SinglePressTouchable>
              </View>
            </SectionCard>
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
