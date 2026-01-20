import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";

import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";
import EvaluationSummary from "@/components/evaluations/EvaluationSummary";
import PersonalInfoForm from "@/app/evaluations/[evaluationId]/edit/step1";
import Step2Form from "../../evaluations/[evaluationId]/edit/step2";

const Evaluations = () => {
  const insets = useSafeAreaInsets();

  const { complete } = useLocalSearchParams();
  const [status, setStatus] = useState<any>(complete || "in_progress");
  const [evaluations, setEvaluations] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["94%"], []);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);

  const [sheetView, setSheetView] = useState<"summary" | "step1" | "step2">(
    "summary",
  );

  const [step2Week, setStep2Week] = useState<number>(1);

  const openSheet = useCallback((evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setSheetView("summary");
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

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

  useEffect(() => {
    setLoading(true);

    const GetEvaluations = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const res = await axios.get(`${baseUrl}/evaluations`, {
          headers: { Authorization: token },
        });

        setEvaluations(res?.data ?? []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    GetEvaluations();
  }, [status]);

  const filtered = evaluations.filter((eva: any) => {
    if (status === "in_progress" && eva.status === "incomplete") return true;
    return eva.status === status;
  });

  const headerTitle =
    sheetView === "step1"
      ? "Personal Information"
      : sheetView === "step2"
        ? `Weekly Evaluation`
        : "Evaluation Summary";

  const headerIcon = sheetView === "summary" ? "x" : ("chevron-left" as any);

  const handleHeaderPress = () => {
    if (sheetView === "summary") closeSheet();
    else setSheetView("summary");
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView className="p-6 bg-white flex-1 pb-14">
        <View className="flex-row border border-neutral-400 h-8 rounded-lg my-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setStatus("in_progress")}
            className={`${
              status === "in_progress" && "bg-[#1a237e]"
            } border-neutral-600 w-1/2 rounded-lg justify-center items-center`}
          >
            <Text
              className={`${
                status === "in_progress" && "text-neutral-50"
              } font-inter`}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setStatus("complete")}
            className={`${
              status === "complete" && "bg-[#1a237e]"
            } w-1/2 rounded-lg justify-center items-center`}
          >
            <Text
              className={`font-inter ${
                status === "complete" && "text-neutral-50"
              }`}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <ActivityIndicator size="large" color="#1a237e" />
          </View>
        ) : (
          <ScrollView className="my-4" keyboardShouldPersistTaps="handled">
            {filtered.map((file: any) => (
              <EvaluationRow
                key={file._id}
                file={file}
                includeName
                onPress={() => openSheet(file._id)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={sheetView === "summary"}
        backdropComponent={renderBackdrop}
        topInset={insets.top}
        onDismiss={() => {
          setSelectedEvaluationId(null);
          setSheetView("summary");
          setStep2Week(1);
        }}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        handleStyle={{ paddingTop: 6 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.sheetHeader}>
            <SinglePressTouchable onPress={handleHeaderPress} className="mr-4">
              <Icon name={headerIcon} size={26} color="#1a237e" />
            </SinglePressTouchable>

            <Text style={styles.sheetTitle}>{headerTitle}</Text>
          </View>

          <View style={{ flex: 1 }}>
            {selectedEvaluationId ? (
              sheetView === "summary" ? (
                <EvaluationSummary
                  evaluationId={selectedEvaluationId}
                  onClose={closeSheet}
                  onEdit={() => setSheetView("step1")}
                  onOpenStep2={({ week }: any) => {
                    setStep2Week(Number(week) || 1);
                    setSheetView("step2");
                  }}
                />
              ) : sheetView === "step1" ? (
                <PersonalInfoForm
                  evaluationId={selectedEvaluationId}
                  id={""}
                  onBack={() => setSheetView("summary")}
                  onDone={() => setSheetView("summary")}
                />
              ) : (
                <Step2Form
                  evaluationId={selectedEvaluationId}
                  week={step2Week}
                  onBack={() => setSheetView("summary")}
                  onDone={() => setSheetView("summary")}
                />
              )
            ) : null}
          </View>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default Evaluations;
