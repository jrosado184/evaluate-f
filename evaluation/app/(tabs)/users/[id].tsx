// app/screens/User.tsx
// @ts-nocheck
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import getServerIP from "@/app/requests/NetworkAddress";
import UserCard from "@/components/UserCard";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";

import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import EvaluationSummary from "@/components/evaluations/EvaluationSummary";
import PersonalInfoForm from "@/app/evaluations/[evaluationId]/edit/step1";
import Step2Form from "@/app/evaluations/[evaluationId]/edit/step2";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

const User = () => {
  const insets = useSafeAreaInsets();
  const { id } = useGlobalSearchParams();

  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);

  // Bottom sheet
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["94%"], []);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);
  const [sheetView, setSheetView] = useState<"summary" | "step1" | "step2">(
    "summary",
  );
  const [step2Week, setStep2Week] = useState<number>(1);

  // Tracks create-mode evaluation id (created inside Step1)
  const createdEvalIdRef = useRef<string | null>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const openSheet = useCallback((evaluationId: string) => {
    createdEvalIdRef.current = null;
    setSelectedEvaluationId(evaluationId);
    setSheetView("summary");
    setStep2Week(1);
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const fetchEmployee = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const empRes = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token! },
      });

      setEmployee(empRes.data);
      setAddEmployeeInfo(empRes.data);

      const evalRes = await axios.get(
        `${baseUrl}/employees/${id}/evaluations`,
        {
          headers: { Authorization: token! },
        },
      );

      if (evalRes.status === 200 && evalRes.data) {
        setEvaluationFiles(evalRes.data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load employee or evaluations.");
    } finally {
      setLoading(false);
    }
  }, [id, setAddEmployeeInfo, setEmployee]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEmployee();
    }, [fetchEmployee]),
  );

  /**
   * ✅ Create button: open Step1 in "create mode"
   * - Do NOT create here. Step1 creates only when user taps Save & Continue.
   */
  const handleStartEvaluation = useCallback(() => {
    createdEvalIdRef.current = null;
    setSelectedEvaluationId(null); // create mode => undefined eval id
    setSheetView("step1");
    setStep2Week(1);

    // Close any open swipe row so it doesn't intercept touches/gestures
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close?.();
      openSwipeableRef.current = null;
    }

    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleDeleteEvaluation = useCallback(
    (evaluationId: string) => {
      Alert.alert(
        "Delete Evaluation",
        "Are you sure you want to delete this evaluation?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem("token");
                const baseUrl = await getServerIP();
                await axios.delete(`${baseUrl}/evaluations/${evaluationId}`, {
                  headers: { Authorization: token! },
                });
                fetchEmployee();
              } catch {
                Alert.alert("Error", "Failed to delete evaluation.");
              }
            },
          },
        ],
      );
    },
    [fetchEmployee],
  );

  const handleSwipeableWillOpen = useCallback((ref: Swipeable | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close?.();
    }
    openSwipeableRef.current = ref;
  }, []);

  const handleTapOutside = useCallback(() => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close?.();
      openSwipeableRef.current = null;
    }
  }, []);

  const headerTitle =
    sheetView === "step1"
      ? "Personal Information"
      : sheetView === "step2"
        ? "Weekly Evaluation"
        : "Evaluation Summary";

  const headerIcon =
    sheetView === "summary" ? ("x" as any) : ("chevron-left" as any);

  const handleHeaderPress = useCallback(() => {
    // If user is creating a new evaluation and hasn't saved Step1 yet,
    // close the sheet instead of going to "summary" (which would be blank).
    if (
      sheetView === "step1" &&
      !selectedEvaluationId &&
      !createdEvalIdRef.current
    ) {
      closeSheet();
      return;
    }

    if (sheetView === "summary") closeSheet();
    else setSheetView("summary");
  }, [closeSheet, sheetView, selectedEvaluationId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTapOutside}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View style={{ flex: 1 }}>
          <View style={{ padding: 24 }}>
            <SinglePressTouchable
              onPress={() => router.replace("/users")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="chevron-left" size={28} />
              <Text style={{ marginLeft: 4, fontSize: 20, fontWeight: "600" }}>
                Back
              </Text>
            </SinglePressTouchable>

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

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 24,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                Evaluations
              </Text>

              <SinglePressTouchable
                onPress={handleStartEvaluation}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "#2563EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Icon name="plus" size={12} color="#2563EB" />
                <Text style={{ color: "#2563EB", marginLeft: 4 }}>Create</Text>
              </SinglePressTouchable>
            </View>

            {evaluationFiles.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 48 }}>
                <Icon name="clipboard" size={50} color="#9CA3AF" />
                <Text style={{ color: "#6B7280", marginTop: 16 }}>
                  No evaluations yet.
                </Text>
              </View>
            ) : (
              <View>
                {evaluationFiles.map((file) => (
                  <EvaluationRow
                    key={file._id}
                    file={file}
                    onPress={() => openSheet(file._id)}
                    onDelete={handleDeleteEvaluation}
                    handleSwipeableWillOpen={(ref: Swipeable | null) =>
                      handleSwipeableWillOpen(ref)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        <AppBottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={sheetView === "summary"}
          title={headerTitle}
          iconName={headerIcon}
          onHeaderPress={handleHeaderPress}
          onDismiss={() => {
            createdEvalIdRef.current = null;
            setSelectedEvaluationId(null);
            setSheetView("summary");
            setStep2Week(1);
          }}
        >
          <EvaluationSheet
            sheetView={sheetView}
            setSheetView={setSheetView}
            evaluationId={selectedEvaluationId}
            setEvaluationId={setSelectedEvaluationId}
            step2Week={step2Week}
            setStep2Week={setStep2Week}
            createdEvalIdRef={createdEvalIdRef}
            employeeId={String(id)}
            createdBy={currentUser?.name || ""}
            onClose={closeSheet}
            onRefresh={fetchEmployee}
          />
        </AppBottomSheet>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  sheetBg: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  handle: { width: 44 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
});

export default User;
