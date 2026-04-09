// app/helpers/dashboard/dashboardMetrics.ts

export type RiskStatus =
  | "onTrack"
  | "watch"
  | "atRisk"
  | "critical"
  | "ready"
  | "inactive";

const toDate = (value?: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const slashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashMatch) {
      const [, mm, dd, yyyy] = slashMatch;
      const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && value?.$date) {
    const parsed = new Date(value.$date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const daysBetween = (start?: any, end?: any): number | null => {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return null;

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const isQualified = (evaluation: any) => {
  const status = String(evaluation?.status || "").toLowerCase();
  return status === "complete" || status === "qualified";
};

export const isInProgress = (evaluation: any) => {
  const status = String(evaluation?.status || "").toLowerCase();
  return status === "in_progress" || status === "incomplete";
};

export const getCreatedDate = (evaluation: any) => {
  return (
    evaluation?.uploadedAt ||
    evaluation?.personalInfo?.jobStartDate ||
    evaluation?.personalInfo?.hireDate ||
    null
  );
};

export const getCompletedDate = (evaluation: any) => {
  return evaluation?.qualifiedAt || null;
};

export const getWeeks = (evaluation: any) => {
  const weeks = Array.isArray(evaluation?.evaluations)
    ? evaluation.evaluations
    : [];

  return [...weeks].sort(
    (a, b) => Number(a?.weekNumber || 0) - Number(b?.weekNumber || 0),
  );
};

export const getLatestWeek = (evaluation: any) => {
  const weeks = getWeeks(evaluation);
  return weeks.length ? weeks[weeks.length - 1] : null;
};

export const getTotalHoursOnJob = (evaluation: any) => {
  return getWeeks(evaluation).reduce(
    (sum, week) => sum + Number(week?.totalHoursOnJob || 0),
    0,
  );
};

export const getProjectedTrainingHours = (evaluation: any) => {
  return Number(evaluation?.personalInfo?.projectedTrainingHours || 0);
};

export const getActualPercent = (evaluation: any) => {
  const latestWeek = getLatestWeek(evaluation);
  return Number(latestWeek?.percentQualified || 0);
};

export const getExpectedPercent = (evaluation: any) => {
  const latestWeek = getLatestWeek(evaluation);

  const explicitExpected = Number(latestWeek?.expectedQualified);
  if (!Number.isNaN(explicitExpected) && explicitExpected > 0) {
    return Math.min(100, explicitExpected);
  }

  const projectedHours = getProjectedTrainingHours(evaluation);
  const totalHoursOnJob = getTotalHoursOnJob(evaluation);

  if (!projectedHours || projectedHours <= 0) return 0;

  return Math.min(100, Math.round((totalHoursOnJob / projectedHours) * 100));
};

export const getRiskStatus = (evaluation: any): RiskStatus => {
  if (!isInProgress(evaluation)) return "inactive";

  const weeks = getWeeks(evaluation);
  const actualPercent = getActualPercent(evaluation);
  const expectedPercent = getExpectedPercent(evaluation);
  const deficit = expectedPercent - actualPercent;

  if (weeks.length >= 3 && actualPercent >= 100) return "ready";
  if (actualPercent >= expectedPercent) return "onTrack";
  if (deficit <= 10) return "watch";
  if (deficit <= 25) return "atRisk";
  return "critical";
};

const buildSegments = (
  healthy: any[],
  watchList: any[],
  atRisk: any[],
  critical: any[],
) => {
  const total =
    healthy.length + watchList.length + atRisk.length + critical.length;

  const toPct = (count: number) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  return [
    {
      key: "onTrack",
      label: "On Track",
      count: healthy.length,
      percent: toPct(healthy.length),
      color: "#22C55E",
    },
    {
      key: "watch",
      label: "Watch",
      count: watchList.length,
      percent: toPct(watchList.length),
      color: "#3B82F6",
    },
    {
      key: "atRisk",
      label: "At Risk",
      count: atRisk.length,
      percent: toPct(atRisk.length),
      color: "#F59E0B",
    },
    {
      key: "critical",
      label: "Critical",
      count: critical.length,
      percent: toPct(critical.length),
      color: "#DC2626",
    },
  ];
};

export const buildWeeklyPaceData = (
  active: any[],
  completed: any[],
  weeksToShow = 8,
) => {
  const now = new Date();
  const targetPerWeek = Math.max(1, Math.round(active.length / 4));

  return Array.from({ length: weeksToShow }).map((_, i) => {
    const weekOffset = weeksToShow - 1 - i;

    const start = new Date(now);
    start.setDate(now.getDate() - weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const actualQualified = completed.filter((evaluation) => {
      const completedDate = toDate(getCompletedDate(evaluation));
      if (!completedDate) return false;
      return completedDate >= start && completedDate <= end;
    }).length;

    return {
      label: `W${i + 1}`,
      value: actualQualified,
      target: targetPerWeek,
    };
  });
};

export const buildDashboardMetrics = (evaluations: any[]) => {
  const active = evaluations.filter(isInProgress);
  const completed = evaluations.filter(isQualified);

  const completedThisMonth = completed.filter((evaluation) => {
    const completedDate = toDate(getCompletedDate(evaluation));
    if (!completedDate) return false;

    const now = new Date();
    return (
      completedDate.getMonth() === now.getMonth() &&
      completedDate.getFullYear() === now.getFullYear()
    );
  });

  const onTrackRaw = active.filter(
    (evaluation) => getRiskStatus(evaluation) === "onTrack",
  );
  const watchList = active.filter(
    (evaluation) => getRiskStatus(evaluation) === "watch",
  );
  const atRisk = active.filter(
    (evaluation) => getRiskStatus(evaluation) === "atRisk",
  );
  const critical = active.filter(
    (evaluation) => getRiskStatus(evaluation) === "critical",
  );
  const readyToQualify = active.filter(
    (evaluation) => getRiskStatus(evaluation) === "ready",
  );

  // Ready-to-qualify is still healthy for dashboard health
  const healthy = [...onTrackRaw, ...readyToQualify];

  const avgDaysToQualifyValues = completed
    .map((evaluation) =>
      daysBetween(getCreatedDate(evaluation), getCompletedDate(evaluation)),
    )
    .filter((value): value is number => typeof value === "number");

  const avgDaysToQualify =
    avgDaysToQualifyValues.length > 0
      ? Math.round(
          avgDaysToQualifyValues.reduce((sum, value) => sum + value, 0) /
            avgDaysToQualifyValues.length,
        )
      : 0;

  const onTrackRate =
    active.length > 0 ? Math.round((healthy.length / active.length) * 100) : 0;

  const avgActivePercent =
    active.length > 0
      ? Math.round(
          active.reduce(
            (sum, evaluation) => sum + getActualPercent(evaluation),
            0,
          ) / active.length,
        )
      : 0;

  const atRiskTotal = atRisk.length + critical.length;

  const healthSegments = buildSegments(healthy, watchList, atRisk, critical);

  const weeklyPaceData = buildWeeklyPaceData(active, completed, 8);

  return {
    active,
    completed,
    completedThisMonth,
    onTrackRaw,
    watchList,
    atRisk,
    critical,
    readyToQualify,
    healthy,
    atRiskTotal,
    avgDaysToQualify,
    avgActivePercent,
    onTrackRate,
    healthSegments,
    weeklyPaceData,
  };
};
