import { FileCategoryKey } from "@/components/users/user/EmployeeFilesHub";

export type UserFileSheetMode =
  | "evaluation"
  | "jsaSelection"
  | "workHardening"
  | "newHire"
  | null;

export type EvaluationSheetView = "summary" | "step1" | "step2";

export const fileCategoryToSheetMode: Partial<
  Record<FileCategoryKey, UserFileSheetMode>
> = {
  evaluations: "evaluation",
  jsas: "jsaSelection",
  workHardening: "workHardening",
  newHire: "newHire",
};
