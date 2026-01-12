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
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import EvaluationSummary from "@/components/evaluations/EvaluationSummary";

const User = () => {
  const insets = useSafeAreaInsets();

  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);

  // -------------------------
  // BottomSheetModal control
  // -------------------------
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["94%"], []);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const openSheet = useCallback((evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  // Fetch employee + evals
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
        }
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
    }, [fetchEmployee])
  );

  /** Always go to step1 when creating **/
  const handleStartEvaluation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const res = await axios.post(
        `${baseUrl}/employees/${id}/evaluations`,
        {
          position: "Untitled",
          createdBy: currentUser?.name,
        },
        { headers: { Authorization: token! } }
      );

      const newEvalId = res.data._id;
      router.push({
        pathname: `/evaluations/${newEvalId}/edit/step1`,
        params: { id: String(id) },
      });
    } catch (err) {
      console.error("Failed to start evaluation:", err);
      Alert.alert("Error", "Could not start evaluation.");
    }
  };

  /** Swipe-to-delete **/
  const handleDeleteEvaluation = (evaluationId: string) => {
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

              // Refresh list
              fetchEmployee();
            } catch {
              Alert.alert("Error", "Failed to delete evaluation.");
            }
          },
        },
      ]
    );
  };

  const handleSwipeableWillOpen = (ref: Swipeable | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close?.();
    }
    openSwipeableRef.current = ref;
  };

  const handleTapOutside = () => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close?.();
      openSwipeableRef.current = null;
    }
  };

  // Full-screen loader
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
            {/* Back */}
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

            {/* Employee card */}
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

            {/* Header + Create */}
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

            {/* Empty state */}
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
                    includeName
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

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          topInset={insets.top}
          onDismiss={() => setSelectedEvaluationId(null)}
          backgroundStyle={styles.sheetBg}
          handleIndicatorStyle={styles.handle}
          handleStyle={{ paddingTop: 6 }}
          enableContentPanningGesture={false}
        >
          <BottomSheetScrollView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <SinglePressTouchable
                onPress={closeSheet}
                style={{ marginRight: 12 }}
              >
                <Icon name="x" size={26} color="#1a237e" />
              </SinglePressTouchable>
              <Text style={styles.sheetTitle}>Evaluation Summary</Text>
            </View>

            <View style={{ flex: 1 }}>
              {selectedEvaluationId ? (
                <EvaluationSummary
                  evaluationId={selectedEvaluationId}
                  onClose={closeSheet}
                />
              ) : null}
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
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
