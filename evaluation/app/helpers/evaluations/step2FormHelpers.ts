import * as FileSystem from "expo-file-system";
import {
  pickUploadedFileUrl,
  toRelativeApiPath,
  uploadEvaluationSignatures,
} from "@/app/helpers/signatureHelpers";

export const NUMERIC = new Set([
  "knifeScore",
  "percentQualified",
  "expectedQualified",
  "reTimeAchieved",
  "hoursMonday",
  "hoursTuesday",
  "hoursWednesday",
  "hoursThursday",
  "hoursFriday",
  "hoursSaturday",
  "hoursOffJobMonday",
  "hoursOffJobTuesday",
  "hoursOffJobWednesday",
  "hoursOffJobThursday",
  "hoursOffJobFriday",
  "hoursOffJobSaturday",
  "hoursWithTraineeMonday",
  "hoursWithTraineeTuesday",
  "hoursWithTraineeWednesday",
  "hoursWithTraineeThursday",
  "hoursWithTraineeFriday",
  "hoursWithTraineeSaturday",
]);

export const DATE_KEYS = new Set(["yieldAuditDate", "knifeSkillsAuditDate"]);

export const HOURS_ON_JOB_KEYS = [
  "hoursMonday",
  "hoursTuesday",
  "hoursWednesday",
  "hoursThursday",
  "hoursFriday",
  "hoursSaturday",
];

export const HOURS_OFF_JOB_KEYS = [
  "hoursOffJobMonday",
  "hoursOffJobTuesday",
  "hoursOffJobWednesday",
  "hoursOffJobThursday",
  "hoursOffJobFriday",
  "hoursOffJobSaturday",
];

export const HOURS_WITH_TRAINEE_KEYS = [
  "hoursWithTraineeMonday",
  "hoursWithTraineeTuesday",
  "hoursWithTraineeWednesday",
  "hoursWithTraineeThursday",
  "hoursWithTraineeFriday",
  "hoursWithTraineeSaturday",
];

export const INITIAL_FORM_DATA = {
  hoursMonday: "",
  hoursTuesday: "",
  hoursWednesday: "",
  hoursThursday: "",
  hoursFriday: "",
  hoursSaturday: "",
  hoursOffJobMonday: "",
  hoursOffJobTuesday: "",
  hoursOffJobWednesday: "",
  hoursOffJobThursday: "",
  hoursOffJobFriday: "",
  hoursOffJobSaturday: "",
  hoursWithTraineeMonday: "",
  hoursWithTraineeTuesday: "",
  hoursWithTraineeWednesday: "",
  hoursWithTraineeThursday: "",
  hoursWithTraineeFriday: "",
  hoursWithTraineeSaturday: "",
  percentQualified: "",
  expectedQualified: "",
  reTimeAchieved: "",
  knifeScore: "",
  yieldAuditDate: "",
  knifeSkillsAuditDate: "",
  handStretchCompleted: false,
  hasPain: false,
  comments: "",
  trainerSignature: "",
  teamMemberSignature: "",
  supervisorSignature: "",
};

export const fmtDateLong = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);

export const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const getMonday = (date: Date) => {
  const d = stripTime(new Date(date));
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 1 - day));
  return d;
};

export const fmtMMDDYYYY = (s: string) =>
  s
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join("/"),
    );

export const intOnly = (s: string) => s.replace(/\D/g, "");

export const knifeSanitize = (s: string) => {
  let cleaned = s.replace(/[^0-9.]/g, "");

  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  const [whole = "", decimal] = cleaned.split(".");
  const limitedWhole = whole.slice(0, 3);

  if (cleaned.includes(".")) {
    return `${limitedWhole}.${(decimal || "").slice(0, 2)}`;
  }

  return limitedWhole;
};

export const toNumOrNull = (v: any) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const clamp = (n: number, lo = 0, hi = 100) =>
  Math.min(hi, Math.max(lo, n));

export const roundToQuarter = (n: number) => Math.round(n * 4) / 4;

export async function dataUrlToTempFile(
  dataUrl: string,
  opts?: { name?: string },
) {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL");

  const mime = match[1] || "image/png";
  const base64 = match[2];

  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/jpeg"
        ? "jpg"
        : mime === "image/webp"
          ? "webp"
          : "bin";

  const name = opts?.name || `signature_${Date.now()}.${ext}`;
  const fileUri = `${FileSystem.cacheDirectory}${name}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri: fileUri, type: mime, name };
}

export function absFromRelative(rel: string, baseUrl: string) {
  if (!rel) return "";
  if (!rel.startsWith("/")) return rel;

  try {
    const u = new URL(baseUrl);
    return `${u.origin}${rel}`;
  } catch {
    const origin = baseUrl.replace(/\/api\/?$/, "");
    return `${origin}${rel}`;
  }
}

export function sumFields(formData: Record<string, any>, keys: string[]) {
  return keys.reduce((sum, key) => sum + Number(formData[key] ?? 0), 0);
}

export function formatWeekDataForApi(formData: Record<string, any>) {
  return {
    ...formData,
    percentQualified: toNumOrNull(formData.percentQualified),
    reTimeAchieved: toNumOrNull(formData.reTimeAchieved),

    hoursMonday: toNumOrNull(formData.hoursMonday),
    hoursTuesday: toNumOrNull(formData.hoursTuesday),
    hoursWednesday: toNumOrNull(formData.hoursWednesday),
    hoursThursday: toNumOrNull(formData.hoursThursday),
    hoursFriday: toNumOrNull(formData.hoursFriday),
    hoursSaturday: toNumOrNull(formData.hoursSaturday),

    hoursOffJobMonday: toNumOrNull(formData.hoursOffJobMonday),
    hoursOffJobTuesday: toNumOrNull(formData.hoursOffJobTuesday),
    hoursOffJobWednesday: toNumOrNull(formData.hoursOffJobWednesday),
    hoursOffJobThursday: toNumOrNull(formData.hoursOffJobThursday),
    hoursOffJobFriday: toNumOrNull(formData.hoursOffJobFriday),
    hoursOffJobSaturday: toNumOrNull(formData.hoursOffJobSaturday),

    hoursWithTraineeMonday: toNumOrNull(formData.hoursWithTraineeMonday),
    hoursWithTraineeTuesday: toNumOrNull(formData.hoursWithTraineeTuesday),
    hoursWithTraineeWednesday: toNumOrNull(formData.hoursWithTraineeWednesday),
    hoursWithTraineeThursday: toNumOrNull(formData.hoursWithTraineeThursday),
    hoursWithTraineeFriday: toNumOrNull(formData.hoursWithTraineeFriday),
    hoursWithTraineeSaturday: toNumOrNull(formData.hoursWithTraineeSaturday),
  };
}

export function mapWeekDataToFormData(weekData: any, baseUrl: string) {
  const next: Record<string, any> = {};

  Object.entries(weekData || {}).forEach(([key, value]) => {
    if (key === "knifeScore") {
      next[key] = value == null ? "" : String(value);
    } else if (NUMERIC.has(key)) {
      next[key] = value == null ? "" : String(value);
    } else if (DATE_KEYS.has(key)) {
      next[key] = typeof value === "string" ? value : "";
    } else if (value && typeof value === "object" && "path" in (value as any)) {
      const pathValue = (value as any)?.path || (value as any)?.url || "";
      next[key] = toRelativeApiPath(pathValue, baseUrl) || pathValue;
    } else if (typeof value === "string" && value.includes("/api/")) {
      next[key] = toRelativeApiPath(value, baseUrl) || value;
    } else {
      next[key] = value;
    }
  });

  return next;
}

export async function uploadPendingEvaluationWeekSignatures({
  pendingSigs,
  baseUrl,
  token,
  evaluationId,
  weekNumber,
}: {
  pendingSigs: Partial<
    Record<
      "trainerSignature" | "teamMemberSignature" | "supervisorSignature",
      string
    >
  >;
  baseUrl: string;
  token: string;
  evaluationId: string;
  weekNumber: number;
}) {
  const hasAnyPending =
    !!pendingSigs.trainerSignature ||
    !!pendingSigs.teamMemberSignature ||
    !!pendingSigs.supervisorSignature;

  if (!hasAnyPending) {
    return null;
  }

  const files: any = {};

  if (pendingSigs.trainerSignature) {
    files.trainer = await dataUrlToTempFile(pendingSigs.trainerSignature, {
      name: `trainer_${Date.now()}.png`,
    });
  }

  if (pendingSigs.teamMemberSignature) {
    files.employee = await dataUrlToTempFile(pendingSigs.teamMemberSignature, {
      name: `employee_${Date.now()}.png`,
    });
  }

  if (pendingSigs.supervisorSignature) {
    files.supervisor = await dataUrlToTempFile(
      pendingSigs.supervisorSignature,
      {
        name: `supervisor_${Date.now()}.png`,
      },
    );
  }

  const response = await uploadEvaluationSignatures({
    baseUrl,
    token,
    evaluationId,
    weekNumber,
    files,
  });

  const roleToFormKey: Record<string, string> = {
    trainer: "trainerSignature",
    employee: "teamMemberSignature",
    supervisor: "supervisorSignature",
  };

  const uploadedPaths: Record<string, string> = {};

  for (const role of Object.keys(roleToFormKey)) {
    if (!files[role]) continue;

    const formKey = roleToFormKey[role];
    const absOrRel = pickUploadedFileUrl(response, role, [formKey]);
    const relativePath = toRelativeApiPath(absOrRel, baseUrl);

    if (!relativePath) {
      throw new Error("Upload did not return a valid signature URL.");
    }

    uploadedPaths[formKey] = relativePath;
  }

  return uploadedPaths;
}

export const SIMPLE_FIELDS = [
  {
    label: "Percent Qualified (%)",
    key: "percentQualified",
    keyboardType: "number-pad" as const,
  },
  {
    label: "RE Time (s)",
    key: "reTimeAchieved",
    keyboardType: "number-pad" as const,
  },
  {
    label: "Yield Audit Date",
    key: "yieldAuditDate",
    keyboardType: "number-pad" as const,
  },
  {
    label: "Knife Audit Date",
    key: "knifeSkillsAuditDate",
    keyboardType: "number-pad" as const,
  },
  {
    label: "Knife Score (%)",
    key: "knifeScore",
  },
  { label: "Comments", key: "comments", multiline: true },
] as const;

export const SIGNATURE_FIELDS = (trainerName: string, traineeName: string) =>
  [
    { key: "trainerSignature", label: trainerName || "Trainer" },
    { key: "teamMemberSignature", label: traineeName || "Trainee" },
    { key: "supervisorSignature", label: "Supervisor" },
  ] as const;
