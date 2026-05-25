// app/screens/User.tsx

import React, { useCallback, useMemo, useRef, useState } from "react";

import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";

import Icon from "react-native-vector-icons/Feather";

import { Swipeable } from "react-native-gesture-handler";

import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { ActivityIndicator } from "react-native-paper";

import { BottomSheetModal } from "@gorhom/bottom-sheet";

import getServerIP from "@/app/requests/NetworkAddress";

import UserCard from "@/components/UserCard";

import useEmployeeContext from "@/app/context/EmployeeContext";

import useAuthContext from "@/app/context/AuthContext";

import { formatISODate } from "@/app/conversions/ConvertIsoDate";

import SinglePressTouchable from "@/app/utils/SinglePress";

import AppBottomSheet from "@/components/ui/AppBottomSheet";

import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

import EmployeeFilesHub, {
  FileCategoryKey,
} from "@/components/users/user/EmployeeFilesHub";

const User = () => {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const [workHardeningFiles] = useState<any[]>([]);
  const [newHireFiles] = useState<any[]>([]);
  const [jsaFiles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<FileCategoryKey>("all");
  const openSwipeableRef = useRef<Swipeable | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const createdEvalIdRef = useRef<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const snapPoints = useMemo(() => [isTablet ? "86%" : "94%"], [isTablet]);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);

  const [sheetView, setSheetView] = useState<"summary" | "step1" | "step2">(
    "summary",
  );

  const [step2Week, setStep2Week] = useState(1);

  const closeOpenSwipeable = useCallback(() => {
    openSwipeableRef.current?.close?.();

    openSwipeableRef.current = null;
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const resetSheetState = useCallback(() => {
    createdEvalIdRef.current = null;

    setSelectedEvaluationId(null);

    setSheetView("summary");

    setStep2Week(1);
  }, []);

  const openEvaluationSheet = useCallback((evaluationId: string) => {
    createdEvalIdRef.current = null;

    setSelectedEvaluationId(evaluationId);

    setSheetView("summary");

    setStep2Week(1);

    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const fetchEmployee = useCallback(async () => {
    if (!employee?._id) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const baseUrl = await getServerIP();

      const [empRes, evalRes] = await Promise.all([
        axios.get(`${baseUrl}/employees/${employee._id}`, {
          headers: {
            Authorization: token!,
          },
        }),

        axios.get(`${baseUrl}/employees/${employee._id}/evaluations`, {
          headers: {
            Authorization: token!,
          },
        }),
      ]);

      setEmployee(empRes.data);

      setAddEmployeeInfo(empRes.data);

      setEvaluationFiles(Array.isArray(evalRes.data) ? evalRes.data : []);

      hasLoadedOnceRef.current = true;
    } catch (err) {
      console.error(err);

      Alert.alert("Error", "Could not load employee files.");
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, [employee?._id, setAddEmployeeInfo, setEmployee]);

  useFocusEffect(
    useCallback(() => {
      fetchEmployee();
    }, [fetchEmployee]),
  );

  const handleStartEvaluation = useCallback(() => {
    createdEvalIdRef.current = null;

    setSelectedEvaluationId(null);

    setSheetView("step1");

    setStep2Week(1);

    closeOpenSwipeable();

    requestAnimationFrame(() => sheetRef.current?.present());
  }, [closeOpenSwipeable]);

  const handleDeleteEvaluation = useCallback((evaluationId: string) => {
    Alert.alert(
      "Delete Evaluation",
      "Are you sure you want to delete this evaluation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");

              const baseUrl = await getServerIP();

              await axios.delete(`${baseUrl}/evaluations/${evaluationId}`, {
                headers: {
                  Authorization: token!,
                },
              });

              setEvaluationFiles((prev) =>
                prev.filter((file) => file._id !== evaluationId),
              );
            } catch (err) {
              console.error(err);

              Alert.alert("Error", "Failed to delete evaluation.");
            }
          },
        },
      ],
    );
  }, []);

  const handleSwipeableWillOpen = useCallback((ref: Swipeable | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close?.();
    }

    openSwipeableRef.current = ref;
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    fetchEmployee();
  }, [fetchEmployee]);

  const handleCreateForCategory = useCallback(() => {
    if (activeCategory === "all" || activeCategory === "evaluations") {
      handleStartEvaluation();

      return;
    }

    Alert.alert("Coming Soon", "This file type is not connected yet.");
  }, [activeCategory, handleStartEvaluation]);

  const headerTitle =
    sheetView === "step1"
      ? "Personal Information"
      : sheetView === "step2"
        ? "Weekly Evaluation"
        : "Evaluation Summary";

  const headerIcon =
    sheetView === "summary" ? ("x" as any) : ("chevron-left" as any);

  const handleHeaderPress = useCallback(() => {
    if (sheetView === "summary") {
      closeSheet();

      return;
    }

    if (
      sheetView === "step1" &&
      !selectedEvaluationId &&
      !createdEvalIdRef.current
    ) {
      closeSheet();

      return;
    }

    setSheetView("summary");
  }, [closeSheet, sheetView, selectedEvaluationId]);

  if (loading && !hasLoadedOnceRef.current) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={closeOpenSwipeable}>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerClassName={
            isTablet
              ? "w-[90%] self-center pt-10 pb-32"
              : "w-[90%] self-center py-5 pb-28"
          }
        >
          <SinglePressTouchable
            onPress={() => router.back()}
            className="mb-4 flex-row items-center"
          >
            <Icon name="chevron-left" size={28} color="#111827" />

            <Text className="ml-1 text-xl font-semibold text-neutral-900">
              Back
            </Text>
          </SinglePressTouchable>

          <View
            className={isTablet ? "w-[85%] self-center gap-5" : "w-full gap-5"}
          >
            <UserCard
              name={employee?.employee_name}
              employee_id={employee?.employee_id}
              date_of_hire={formatISODate(employee?.date_of_hire)}
              locker_number={employee?.locker_number}
              knife_number={employee?.knife_number}
              position={employee?.position}
              department={employee?.department}
              last_update={formatISODate(employee?.last_updated)}
            />

            <EmployeeFilesHub
              isTablet={isTablet}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              evaluationFiles={evaluationFiles}
              workHardeningFiles={workHardeningFiles}
              newHireFiles={newHireFiles}
              jsaFiles={jsaFiles}
              onCreate={handleCreateForCategory}
              onOpenEvaluation={openEvaluationSheet}
              onDeleteEvaluation={handleDeleteEvaluation}
              onSwipeableWillOpen={handleSwipeableWillOpen}
            />
          </View>
        </ScrollView>

        <AppBottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={sheetView === "summary"}
          title={headerTitle}
          iconName={headerIcon}
          onHeaderPress={handleHeaderPress}
          onDismiss={resetSheetState}
        >
          <EvaluationSheet
            sheetView={sheetView}
            setSheetView={setSheetView}
            evaluationId={selectedEvaluationId}
            setEvaluationId={setSelectedEvaluationId}
            step2Week={step2Week}
            setStep2Week={setStep2Week}
            createdEvalIdRef={createdEvalIdRef}
            employeeId={String(employee?._id || employee?.id || "")}
            createdBy={currentUser?.name || ""}
            onClose={closeSheet}
            onRefresh={fetchEmployee}
          />
        </AppBottomSheet>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default User;
