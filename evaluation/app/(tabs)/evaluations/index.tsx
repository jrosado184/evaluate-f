import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

type EvalStatus = "in_progress" | "complete";
type EvalSheetView = "summary" | "step1" | "step2" | "qualify";

const Evaluations = () => {
  const { complete } = useLocalSearchParams();

  const initialStatus: EvalStatus =
    complete === "complete" ? "complete" : "in_progress";

  const [status, setStatus] = useState<EvalStatus>(initialStatus);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sheetRef = useRef<BottomSheetModal>(null);
  const createdEvalIdRef = useRef<string | null>(null);

  const snapPoints = useMemo(() => ["94%"], []);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);
  const [sheetView, setSheetView] = useState<EvalSheetView>("summary");
  const [step2Week, setStep2Week] = useState<number>(1);
  const [qualifyPayload, setQualifyPayload] = useState<any>(null);

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const res = await axios.get(`${baseUrl}/evaluations`, {
        headers: { Authorization: token },
      });

      setEvaluations(res?.data ?? []);
    } catch (err) {
      console.log("Error fetching evaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const res = await axios.get(`${baseUrl}/evaluations`, {
        headers: { Authorization: token },
      });

      setEvaluations(res?.data ?? []);
    } catch (err) {
      console.log("Error refreshing evaluations:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const inProgressList = useMemo(() => {
    return evaluations.filter((eva: any) => {
      return eva.status === "incomplete" || eva.status === "in_progress";
    });
  }, [evaluations]);

  const completedList = useMemo(() => {
    return evaluations.filter((eva: any) => {
      return eva.status === "complete" || eva.status === "qualified";
    });
  }, [evaluations]);

  const filtered = useMemo(() => {
    return status === "in_progress" ? inProgressList : completedList;
  }, [status, inProgressList, completedList]);

  const openSheet = useCallback((evaluation: any) => {
    const evaluationId = evaluation?._id || null;
    const week = Number(evaluation?.week || evaluation?.currentWeek || 1);

    setSelectedEvaluationId(evaluationId);
    setSheetView("summary");
    setStep2Week(week);
    setQualifyPayload(null);
    createdEvalIdRef.current = evaluationId;

    requestAnimationFrame(() => {
      sheetRef.current?.present();
    });
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const resetSheetState = useCallback(() => {
    setSelectedEvaluationId(null);
    setSheetView("summary");
    setStep2Week(1);
    setQualifyPayload(null);
    createdEvalIdRef.current = null;
  }, []);

  const headerTitle =
    sheetView === "step1"
      ? "Personal Information"
      : sheetView === "step2"
        ? "Weekly Evaluation"
        : sheetView === "qualify"
          ? "Qualify Evaluation"
          : "Evaluation Summary";

  const headerIcon = sheetView === "summary" ? "x" : ("arrow-left" as const);

  const handleHeaderPress = () => {
    if (sheetView === "summary") {
      closeSheet();
      return;
    }

    if (sheetView === "qualify" || sheetView === "step2") {
      setSheetView("summary");
      return;
    }

    setSheetView("summary");
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-6 pb-14">
        <View className="mb-2 mt-2">
          <Text className="text-3xl font-bold text-black">Evaluations</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Review employee progress and completed evaluations
          </Text>
        </View>

        <View className="my-4">
          <View className="h-12 flex-row rounded-2xl border border-neutral-300 bg-white p-1">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setStatus("in_progress")}
              className={`w-1/2 flex-row items-center justify-center rounded-xl ${
                status === "in_progress" ? "bg-[#1a237e]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  status === "in_progress" ? "text-white" : "text-neutral-700"
                }`}
              >
                In Progress
              </Text>
              <View
                className={`ml-2 min-w-[22px] rounded-full px-2 py-[2px] ${
                  status === "in_progress" ? "bg-white/20" : "bg-neutral-100"
                }`}
              >
                <Text
                  className={`text-center text-[12px] font-semibold ${
                    status === "in_progress" ? "text-white" : "text-neutral-500"
                  }`}
                >
                  {inProgressList.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setStatus("complete")}
              className={`w-1/2 flex-row items-center justify-center rounded-xl ${
                status === "complete" ? "bg-[#1a237e]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  status === "complete" ? "text-white" : "text-neutral-700"
                }`}
              >
                Completed
              </Text>
              <View
                className={`ml-2 min-w-[22px] rounded-full px-2 py-[2px] ${
                  status === "complete" ? "bg-white/20" : "bg-neutral-100"
                }`}
              >
                <Text
                  className={`text-center text-[12px] font-semibold ${
                    status === "complete" ? "text-white" : "text-neutral-500"
                  }`}
                >
                  {completedList.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#1a237e" />
            <Text className="mt-3 text-sm font-medium text-neutral-500">
              Loading evaluations...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) =>
              item?._id?.toString?.() || String(index)
            }
            renderItem={({ item }) => (
              <EvaluationRow
                file={item}
                includeName
                onPress={() => openSheet(item)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            ListEmptyComponent={
              <View className="mt-16 items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10">
                <Text className="text-[17px] font-semibold text-gray-800">
                  No evaluations found
                </Text>
                <Text className="mt-2 text-center text-[14px] leading-5 text-gray-500">
                  {status === "complete"
                    ? "There are no completed evaluations right now."
                    : "There are no evaluations in progress right now."}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <AppBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={sheetView === "summary"}
        title={headerTitle}
        iconName={headerIcon}
        onHeaderPress={handleHeaderPress}
        onDismiss={resetSheetState}
        scroll={false}
      >
        <EvaluationSheet
          key={`evaluation-${selectedEvaluationId ?? "none"}-${sheetView}`}
          sheetView={sheetView}
          setSheetView={setSheetView}
          evaluationId={selectedEvaluationId}
          setEvaluationId={setSelectedEvaluationId}
          step2Week={step2Week}
          setStep2Week={setStep2Week}
          qualifyPayload={qualifyPayload}
          setQualifyPayload={setQualifyPayload}
          createdEvalIdRef={createdEvalIdRef}
          onClose={closeSheet}
          onRefresh={fetchEvaluations}
        />
      </AppBottomSheet>
    </View>
  );
};

export default Evaluations;
