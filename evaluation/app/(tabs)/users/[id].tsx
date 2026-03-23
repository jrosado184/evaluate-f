// app/screens/User.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  RefreshControl,
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
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import SinglePressTouchable from "@/app/utils/SinglePress";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

const User = () => {
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);

  const openSwipeableRef = useRef<Swipeable | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const createdEvalIdRef = useRef<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const snapPoints = useMemo(() => ["94%"], []);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);
  const [sheetView, setSheetView] = useState<"summary" | "step1" | "step2">(
    "summary",
  );
  const [step2Week, setStep2Week] = useState<number>(1);

  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close?.();
      openSwipeableRef.current = null;
    }
  }, []);

  const resetSheetState = useCallback(() => {
    createdEvalIdRef.current = null;
    setSelectedEvaluationId(null);
    setSheetView("summary");
    setStep2Week(1);
  }, []);

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

  const fetchEmployee = useCallback(
    async (showFullLoader = false) => {
      if (!employee?._id) return;

      try {
        if (showFullLoader && !hasLoadedOnceRef.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const [empRes, evalRes] = await Promise.all([
          axios.get(`${baseUrl}/employees/${employee._id}`, {
            headers: { Authorization: token! },
          }),
          axios.get(`${baseUrl}/employees/${employee._id}/evaluations`, {
            headers: { Authorization: token! },
          }),
        ]);

        setEmployee(empRes.data);
        setAddEmployeeInfo(empRes.data);
        setEvaluationFiles(Array.isArray(evalRes.data) ? evalRes.data : []);

        hasLoadedOnceRef.current = true;
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not load employee or evaluations.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [employee?._id, setAddEmployeeInfo, setEmployee],
  );

  useFocusEffect(
    useCallback(() => {
      fetchEmployee(!hasLoadedOnceRef.current);
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

  const handleTapOutside = useCallback(() => {
    closeOpenSwipeable();
  }, [closeOpenSwipeable]);

  const handleRefresh = useCallback(() => {
    fetchEmployee(false);
  }, [fetchEmployee]);

  const headerTitle =
    sheetView === "step1"
      ? "Personal Information"
      : sheetView === "step2"
        ? "Weekly Evaluation"
        : "Evaluation Summary";

  const headerIcon =
    sheetView === "summary" ? ("x" as any) : ("chevron-left" as any);

  const handleHeaderPress = useCallback(() => {
    if (
      sheetView === "step1" &&
      !selectedEvaluationId &&
      !createdEvalIdRef.current
    ) {
      closeSheet();
      return;
    }

    if (sheetView === "summary") {
      closeSheet();
      return;
    }

    setSheetView("summary");
  }, [closeSheet, sheetView, selectedEvaluationId]);

  if (loading && !hasLoadedOnceRef.current) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTapOutside}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <SinglePressTouchable
            onPress={() => router.back()}
            style={styles.backRow}
          >
            <Icon name="chevron-left" size={28} />
            <Text style={styles.backText}>Back</Text>
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Evaluations</Text>

            <SinglePressTouchable
              onPress={handleStartEvaluation}
              style={styles.createButton}
            >
              <Icon name="plus" size={12} color="#2563EB" />
              <Text style={styles.createButtonText}>Create</Text>
            </SinglePressTouchable>
          </View>

          {evaluationFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard" size={50} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No evaluations yet.</Text>
            </View>
          ) : (
            <View style={styles.evaluationsList}>
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
            onRefresh={() => fetchEmployee(false)}
          />
        </AppBottomSheet>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 20,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#2563EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  createButtonText: {
    color: "#2563EB",
    marginLeft: 4,
  },
  evaluationsList: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
  },
  emptyStateText: {
    color: "#6B7280",
    marginTop: 16,
  },
});

export default User;
