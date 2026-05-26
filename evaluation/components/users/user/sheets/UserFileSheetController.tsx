import React, {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";
import JsaSelection from "@/components/jsas/sheets/JsaSelection";
import {
  EvaluationSheetView,
  UserFileSheetMode,
} from "@/components/users/user/types";

type Props = {
  isTablet: boolean;
  employeeId: string;
  createdBy: string;
  onRefresh: () => Promise<void>;
};

export type UserFileSheetControllerRef = {
  openEvaluation: (evaluationId?: string | null) => void;
  openJsaSelection: () => void;
  openWorkHardening: () => void;
  openNewHire: () => void;
  close: () => void;
};

const UserFileSheetController = forwardRef<UserFileSheetControllerRef, Props>(
  ({ isTablet, employeeId, createdBy, onRefresh }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const createdEvalIdRef = useRef<string | null>(null);

    const [mode, setMode] = useState<UserFileSheetMode>(null);
    const [evaluationView, setEvaluationView] =
      useState<EvaluationSheetView>("summary");
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<
      string | null
    >(null);
    const [step2Week, setStep2Week] = useState(1);

    const snapPoints = useMemo(() => [isTablet ? "86%" : "94%"], [isTablet]);

    const close = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    const present = useCallback(() => {
      requestAnimationFrame(() => sheetRef.current?.present());
    }, []);

    const resetEvaluationState = useCallback(() => {
      createdEvalIdRef.current = null;
      setSelectedEvaluationId(null);
      setEvaluationView("summary");
      setStep2Week(1);
    }, []);

    const resetAll = useCallback(() => {
      resetEvaluationState();
      setMode(null);
    }, [resetEvaluationState]);

    const openEvaluation = useCallback(
      (evaluationId?: string | null) => {
        resetEvaluationState();
        setMode("evaluation");
        setSelectedEvaluationId(evaluationId ?? null);
        setEvaluationView(evaluationId ? "summary" : "step1");
        present();
      },
      [present, resetEvaluationState],
    );

    const openJsaSelection = useCallback(() => {
      resetEvaluationState();
      setMode("jsaSelection");
      present();
    }, [present, resetEvaluationState]);

    const openWorkHardening = useCallback(() => {
      resetEvaluationState();
      setMode("workHardening");
      present();
    }, [present, resetEvaluationState]);

    const openNewHire = useCallback(() => {
      resetEvaluationState();
      setMode("newHire");
      present();
    }, [present, resetEvaluationState]);

    useImperativeHandle(ref, () => ({
      openEvaluation,
      openJsaSelection,
      openWorkHardening,
      openNewHire,
      close,
    }));

    const title = useMemo(() => {
      if (mode === "jsaSelection") return "Select JSA";
      if (mode === "workHardening") return "Work Hardening";
      if (mode === "newHire") return "New Hire File";

      if (evaluationView === "step1") return "Personal Information";
      if (evaluationView === "step2") return "Weekly Evaluation";

      return "Evaluation Summary";
    }, [evaluationView, mode]);

    const iconName = useMemo(() => {
      if (mode !== "evaluation") return "x" as any;
      return evaluationView === "summary"
        ? ("x" as any)
        : ("chevron-left" as any);
    }, [evaluationView, mode]);

    const handleHeaderPress = useCallback(() => {
      if (mode !== "evaluation") {
        close();
        return;
      }

      if (evaluationView === "summary") {
        close();
        return;
      }

      if (
        evaluationView === "step1" &&
        !selectedEvaluationId &&
        !createdEvalIdRef.current
      ) {
        close();
        return;
      }

      setEvaluationView("summary");
    }, [close, evaluationView, mode, selectedEvaluationId]);

    const enablePanDownToClose =
      mode !== "evaluation" || evaluationView === "summary";

    const shouldUseParentScroll = mode !== "jsaSelection";

    return (
      <AppBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        title={title}
        iconName={iconName}
        onHeaderPress={handleHeaderPress}
        onDismiss={resetAll}
        scroll={shouldUseParentScroll}
      >
        {mode === "evaluation" ? (
          <EvaluationSheet
            sheetView={evaluationView}
            setSheetView={setEvaluationView}
            evaluationId={selectedEvaluationId}
            setEvaluationId={setSelectedEvaluationId}
            step2Week={step2Week}
            setStep2Week={setStep2Week}
            createdEvalIdRef={createdEvalIdRef}
            employeeId={employeeId}
            createdBy={createdBy}
            onClose={close}
            onRefresh={onRefresh}
          />
        ) : mode === "jsaSelection" ? (
          <JsaSelection
            onSelectJsa={(jsa) => {
              console.log("Selected JSA:", jsa);
              close();
            }}
          />
        ) : mode === "workHardening" ? (
          <PlaceholderSheet title="Work hardening flow coming next." />
        ) : mode === "newHire" ? (
          <PlaceholderSheet title="New hire flow coming next." />
        ) : null}
      </AppBottomSheet>
    );
  },
);

const PlaceholderSheet = ({ title }: { title: string }) => {
  return (
    <View className="px-2 py-6">
      <Text className="text-base font-inter-medium text-neutral-700">
        {title}
      </Text>
    </View>
  );
};

export default UserFileSheetController;
