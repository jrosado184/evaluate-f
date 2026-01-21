// app/components/evaluations/EvaluationSheet.tsx
// @ts-nocheck
import React from "react";
import EvaluationSummary from "@/components/evaluations/EvaluationSummary";
import PersonalInfoForm from "@/app/evaluations/[evaluationId]/edit/step1";
import Step2Form from "@/app/evaluations/[evaluationId]/edit/step2";

type Props = {
  sheetView: "summary" | "step1" | "step2";
  setSheetView: (v: any) => void;

  evaluationId: string | null;
  setEvaluationId: (id: string | null) => void;

  step2Week: number;
  setStep2Week: (n: number) => void;

  // create mode tracking
  createdEvalIdRef?: React.MutableRefObject<string | null>;

  employeeId?: string; // used by Step1 in User screen
  createdBy?: string; // used by Step1 in User screen

  onClose: () => void;
  onRefresh?: () => Promise<any> | void; // refresh list after updates/creates
};

export default function EvaluationSheet({
  sheetView,
  setSheetView,
  evaluationId,
  setEvaluationId,
  step2Week,
  setStep2Week,
  createdEvalIdRef,
  employeeId,
  createdBy,
  onClose,
  onRefresh,
}: Props) {
  const hasEvalId = !!evaluationId;
  const createdId = createdEvalIdRef?.current;

  if (!hasEvalId && sheetView === "summary") return null;
  if (!hasEvalId && sheetView === "step2") return null;

  if (sheetView === "summary") {
    return (
      <EvaluationSummary
        evaluationId={evaluationId!}
        onClose={onClose}
        onEdit={() => setSheetView("step1")}
        onOpenStep2={({ week }: any) => {
          setStep2Week(Number(week) || 1);
          setSheetView("step2");
        }}
      />
    );
  }

  if (sheetView === "step1") {
    return (
      <PersonalInfoForm
        evaluationId={evaluationId ?? undefined} // undefined => create mode
        id={employeeId || ""} // your Step1 prop naming
        createdBy={createdBy || ""}
        inSheet
        onCreated={(newEvalId: string) => {
          if (createdEvalIdRef) createdEvalIdRef.current = newEvalId;
          setEvaluationId(newEvalId);
          onRefresh?.();
        }}
        onBack={() => {
          // if user never saved, close (so you don't land on blank summary)
          if (!evaluationId && !createdId) onClose();
          else setSheetView("summary");
        }}
        onDone={() => {
          const idToUse = createdId || evaluationId;
          if (idToUse) {
            setEvaluationId(idToUse);
            setSheetView("summary"); // or step2 if you prefer
          } else {
            onClose();
          }
        }}
      />
    );
  }

  // step2
  return (
    <Step2Form
      evaluationId={evaluationId!}
      week={step2Week}
      inSheet
      onBack={() => setSheetView("summary")}
      onDone={async () => {
        await onRefresh?.();
        setSheetView("summary");
      }}
    />
  );
}
