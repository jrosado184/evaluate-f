import { DonutSegment } from "./dashboard.types";

export const formatDateLabel = (value?: string | Date | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const daysBetween = (
  start?: string | Date | null,
  end?: string | Date | null,
) => {
  if (!start || !end) return null;

  const s = new Date(start);
  const e = new Date(end);

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;

  return Math.max(
    0,
    Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)),
  );
};

export const getEvaluationName = (evaluation: any) =>
  evaluation?.employeeName ||
  evaluation?.employee?.name ||
  evaluation?.employee?.fullName ||
  evaluation?.associateName ||
  "Unknown Employee";

export const getEvaluationTitle = (evaluation: any) =>
  evaluation?.evaluationType ||
  evaluation?.type ||
  evaluation?.title ||
  evaluation?.templateName ||
  "Evaluation";

export const getDueDate = (evaluation: any) =>
  evaluation?.dueDate ||
  evaluation?.deadline ||
  evaluation?.nextDueDate ||
  evaluation?.targetDate ||
  null;

export const getCreatedDate = (evaluation: any) =>
  evaluation?.createdAt ||
  evaluation?.startDate ||
  evaluation?.date ||
  evaluation?.evaluationStartDate ||
  null;

export const getCompletedDate = (evaluation: any) =>
  evaluation?.completedAt ||
  evaluation?.qualifiedAt ||
  evaluation?.updatedAt ||
  evaluation?.completedDate ||
  null;

export const getHoursOnJob = (evaluation: any) => {
  const raw =
    evaluation?.hoursOnJob ??
    evaluation?.hoursWorked ??
    evaluation?.trainingHoursCompleted ??
    evaluation?.actualHours ??
    evaluation?.hours ??
    0;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
};

export const getProjectedHours = (evaluation: any) => {
  const raw =
    evaluation?.projectedTrainingHours ??
    evaluation?.targetHours ??
    evaluation?.requiredHours ??
    evaluation?.projectedHours ??
    0;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
};

export const getActualPercent = (evaluation: any) => {
  const raw =
    evaluation?.pctQualified ??
    evaluation?.percentQualified ??
    evaluation?.qualificationPercent ??
    evaluation?.progressPercent ??
    evaluation?.completionPercent ??
    0;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
};

export const getExpectedPercentByHours = (evaluation: any) => {
  const hoursOnJob = getHoursOnJob(evaluation);
  const projectedHours = getProjectedHours(evaluation);

  if (!projectedHours || projectedHours <= 0) return 0;

  return Math.max(
    0,
    Math.min(100, Math.round((hoursOnJob / projectedHours) * 100)),
  );
};

export const getProgressGap = (evaluation: any) =>
  getExpectedPercentByHours(evaluation) - getActualPercent(evaluation);

export const isQualified = (evaluation: any) => {
  const status = String(
    evaluation?.status || evaluation?.evaluationStatus || "",
  ).toLowerCase();

  return (
    status.includes("qualified") ||
    status.includes("complete") ||
    status.includes("completed")
  );
};

export const isInProgress = (evaluation: any) => {
  const status = String(
    evaluation?.status || evaluation?.evaluationStatus || "",
  ).toLowerCase();

  if (!status) return !isQualified(evaluation);

  return (
    status.includes("progress") ||
    status.includes("active") ||
    status.includes("started") ||
    status.includes("open")
  );
};

export const isOverdue = (evaluation: any) => {
  const dueDate = getDueDate(evaluation);
  if (!dueDate || isQualified(evaluation)) return false;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

export const isReadyToQualify = (evaluation: any) => {
  if (isQualified(evaluation)) return false;
  return getActualPercent(evaluation) >= 90;
};

export const getRiskStatus = (evaluation: any) => {
  if (isQualified(evaluation)) return "qualified";
  if (isOverdue(evaluation)) return "critical";

  const gap = getProgressGap(evaluation);

  if (gap >= 25) return "critical";
  if (gap >= 15) return "atRisk";
  if (gap >= 6) return "watch";
  if (isReadyToQualify(evaluation)) return "ready";

  return "onTrack";
};

export const buildHealthSegments = (
  onTrack: any[],
  watchList: any[],
  atRisk: any[],
  critical: any[],
): DonutSegment[] => [
  { label: "On Track", value: onTrack.length, color: "#16A34A" },
  { label: "Watch", value: watchList.length, color: "#2563EB" },
  { label: "At Risk", value: atRisk.length, color: "#F59E0B" },
  { label: "Critical", value: critical.length, color: "#DC2626" },
];
