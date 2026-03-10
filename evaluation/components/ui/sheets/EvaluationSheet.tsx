// components/ui/sheets/EvaluationSheet.tsx
// @ts-nocheck
import React from "react";
import EvaluationSummary from "@/components/evaluations/EvaluationSummary";
import PersonalInfoForm from "@/app/evaluations/[evaluationId]/edit/step1";
import Step2Form from "@/app/evaluations/[evaluationId]/edit/step2";
import QualifyForm from "@/components/evaluations/sheets/QualifyForm";

type Props = {
  sheetView: "summary" | "step1" | "step2" | "qualify";
  setSheetView: (v: any) => void;

  evaluationId: string | null;
  setEvaluationId: (id: string | null) => void;

  step2Week: number;
  setStep2Week: (n: number) => void;

  qualifyPayload?: any;
  setQualifyPayload?: (p: any) => void;

  createdEvalIdRef?: React.MutableRefObject<string | null>;

  employeeId?: string;
  createdBy?: string;

  onClose: () => void;
  onRefresh?: () => Promise<any> | void;
};

export default function EvaluationSheet({
  sheetView,
  setSheetView,
  evaluationId,
  setEvaluationId,
  step2Week,
  setStep2Week,
  qualifyPayload,
  setQualifyPayload,
  createdEvalIdRef,
  employeeId,
  createdBy,
  onClose,
  onRefresh,
}: Props) {
  const createdId = createdEvalIdRef?.current ?? null;
  const effectiveEvaluationId = createdId || evaluationId;
  const hasEvalId = !!effectiveEvaluationId;

  if (!hasEvalId && sheetView === "summary") return null;
  if (!hasEvalId && sheetView === "step2") return null;
  if (!hasEvalId && sheetView === "qualify") return null;

  if (sheetView === "qualify") {
    return (
      <QualifyForm
        inSheet
        evaluationId={qualifyPayload?.evaluationId || effectiveEvaluationId!}
        employee_name={qualifyPayload?.employee_name}
        department={qualifyPayload?.department}
        position={qualifyPayload?.position}
        onBack={() => {
          setQualifyPayload?.(null);
          setSheetView("summary");
        }}
        onDone={async () => {
          await onRefresh?.();
          setQualifyPayload?.(null);
          setSheetView("summary");
        }}
      />
    );
  }

  if (sheetView === "summary") {
    return (
      <EvaluationSummary
        evaluationId={effectiveEvaluationId!}
        onClose={onClose}
        onEdit={() => setSheetView("step1")}
        onOpenStep2={({ week }: any) => {
          setStep2Week(Number(week) || 1);
          setSheetView("step2");
        }}
        onOpenQualify={(payload: any) => {
          setQualifyPayload?.(payload);
          setSheetView("qualify");
        }}
        inSheet
      />
    );
  }

  if (sheetView === "step1") {
    return (
      <PersonalInfoForm
        evaluationId={effectiveEvaluationId ?? undefined}
        id={employeeId || ""}
        createdBy={createdBy || ""}
        inSheet
        onCreated={(newEvalId: string) => {
          if (createdEvalIdRef) {
            createdEvalIdRef.current = newEvalId;
          }
          setEvaluationId(newEvalId);
          onRefresh?.();
        }}
        onBack={() => {
          if (!effectiveEvaluationId) onClose();
          else setSheetView("summary");
        }}
        onDone={() => {
          const idToUse = createdEvalIdRef?.current || evaluationId;

          if (idToUse) {
            setEvaluationId(idToUse);
            setSheetView("summary");
          } else {
            onClose();
          }
        }}
      />
    );
  }

  return (
    <Step2Form
      evaluationId={effectiveEvaluationId!}
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
