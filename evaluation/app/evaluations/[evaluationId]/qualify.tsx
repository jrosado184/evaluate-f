// app/evaluations/[evaluationId]/qualify.tsx
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QualifyForm from "@/components/evaluations/sheets/QualifyForm";

export default function QualifyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <QualifyForm
      evaluationId={String(params.evaluationId)}
      employee_name={String(params.employee_name || "")}
      department={String(params.department || "")}
      position={String(params.position || "")}
      onBack={() => router.back()}
      onDone={() =>
        router.replace({
          pathname: `/evaluations`,
          params: { complete: "complete" },
        })
      }
    />
  );
}
