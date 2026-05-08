// app/screens/Step2Form.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";

import getServerIP from "@/app/requests/NetworkAddress";
import SignatureModal from "@/components/SignatureModal";
import useAuthContext from "@/app/context/AuthContext";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { parseMDY } from "@/app/helpers/dates";
import {
  pickUploadedFileUrl,
  toRelativeApiPath,
  uploadEvaluationSignatures,
} from "@/app/helpers/signatureHelpers";

/* ---------------- constants ---------------- */
const NUMERIC = new Set([
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

const DATE_KEYS = new Set(["yieldAuditDate", "knifeSkillsAuditDate"]);

const HOURS_ON_JOB_KEYS = [
  "hoursMonday",
  "hoursTuesday",
  "hoursWednesday",
  "hoursThursday",
  "hoursFriday",
  "hoursSaturday",
];

const HOURS_OFF_JOB_KEYS = [
  "hoursOffJobMonday",
  "hoursOffJobTuesday",
  "hoursOffJobWednesday",
  "hoursOffJobThursday",
  "hoursOffJobFriday",
  "hoursOffJobSaturday",
];

const HOURS_WITH_TRAINEE_KEYS = [
  "hoursWithTraineeMonday",
  "hoursWithTraineeTuesday",
  "hoursWithTraineeWednesday",
  "hoursWithTraineeThursday",
  "hoursWithTraineeFriday",
  "hoursWithTraineeSaturday",
];

const INITIAL_FORM_DATA = {
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

/* ---------------- helpers ---------------- */
const fmtDateLong = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);

const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getMonday = (date: Date) => {
  const d = stripTime(new Date(date));
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 1 - day));
  return d;
};

const fmtMMDDYYYY = (s: string) =>
  s
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join("/"),
    );

const intOnly = (s: string) => s.replace(/\D/g, "");

const knifeSanitize = (s: string) => {
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

const toNumOrNull = (v: any) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const roundToQuarter = (n: number) => Math.round(n * 4) / 4;

async function dataUrlToTempFile(dataUrl: string, opts?: { name?: string }) {
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

function absFromRelative(rel: string, baseUrl: string) {
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

function sumFields(formData: Record<string, any>, keys: string[]) {
  return keys.reduce((sum, key) => sum + Number(formData[key] ?? 0), 0);
}

function formatWeekDataForApi(formData: Record<string, any>) {
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

async function uploadPendingEvaluationWeekSignatures({
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

    const absOrRel = pickUploadedFileUrl(response, role);
    const relativePath = toRelativeApiPath(absOrRel, baseUrl);

    if (!relativePath) {
      throw new Error("Upload did not return a valid signature URL.");
    }

    uploadedPaths[roleToFormKey[role]] = relativePath;
  }

  return uploadedPaths;
}

/* ---------------- small ui ---------------- */
const Labeled = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View className="mb-5">
    <Text className="mb-2 text-base font-medium text-gray-700">{label}</Text>
    {children}
  </View>
);

type Props = {
  evaluationId?: string;
  week?: number;
  onBack?: () => void;
  onDone?: () => void;
};

export default function Step2Form(props: Props) {
  const router = useRouter();
  const params: any = useLocalSearchParams();

  const evaluationId =
    props?.evaluationId ?? params?.evaluationId ?? params?.id;
  const employeeId = params?.id ?? params?.employeeId;
  const weekParam = props?.week ?? params?.week;

  const { currentUser } = useAuthContext();
  const currentWeek = parseInt(String(weekParam || "1"), 10);

  const [formData, setFormData] =
    useState<Record<string, any>>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureType, setSignatureType] = useState<string | null>(null);

  const [traineeName, setTraineeName] = useState("Trainee");
  const [projectedTrainingHours, setProjectedTrainingHours] =
    useState<number>(200);
  const [jobStartDate, setJobStartDate] = useState("");
  const [prevHoursOnJob, setPrevHoursOnJob] = useState(0);
  const [apiBase, setApiBase] = useState<string>("");

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [pendingSigs, setPendingSigs] = useState<
    Partial<
      Record<
        "trainerSignature" | "teamMemberSignature" | "supervisorSignature",
        string
      >
    >
  >({});

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        setApiBase(baseUrl);

        const { data } = await axios.get(
          `${baseUrl}/evaluations/${evaluationId}`,
          { headers: { Authorization: token! } },
        );

        setJobStartDate(data.personalInfo?.jobStartDate);
        setTraineeName(data.personalInfo?.teamMemberName || "Trainee");
        setProjectedTrainingHours(
          Number(data.personalInfo?.projectedTrainingHours) || 200,
        );

        const cumulative = (data.evaluations || [])
          .filter((e: any) => e.weekNumber < currentWeek)
          .reduce((sum: number, e: any) => sum + (e.totalHoursOnJob || 0), 0);

        setPrevHoursOnJob(cumulative);

        const weekData = (data.evaluations || []).find(
          (e: any) => e.weekNumber === currentWeek,
        );

        if (weekData) {
          const next: Record<string, any> = {};

          Object.entries(weekData).forEach(([key, value]) => {
            if (key === "knifeScore") {
              next[key] = value == null ? "" : String(value);
            } else if (NUMERIC.has(key)) {
              next[key] = value == null ? "" : String(value);
            } else if (DATE_KEYS.has(key)) {
              next[key] = typeof value === "string" ? value : "";
            } else if (typeof value === "string" && value.includes("/api/")) {
              next[key] = toRelativeApiPath(value, baseUrl) || value;
            } else {
              next[key] = value;
            }
          });

          setFormData((prev) => ({ ...prev, ...next }));
        }
      } catch {
        Alert.alert("Error", "Failed to load evaluation");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId, currentWeek]);

  const expectedQualified = useMemo(() => {
    const weekSum = HOURS_ON_JOB_KEYS.reduce(
      (sum, key) => sum + toNum(formData[key]),
      0,
    );

    const total = toNum(prevHoursOnJob) + weekSum;
    const rawPct =
      projectedTrainingHours > 0 ? (total / projectedTrainingHours) * 100 : 0;

    const clamped = clamp(rawPct, 0, 100);
    const quarter = roundToQuarter(clamped);

    return Number(quarter.toFixed(2));
  }, [formData, prevHoursOnJob, projectedTrainingHours]);

  const handleChange = (key: string, raw: string) => {
    let next: string | null = raw;

    if (DATE_KEYS.has(key)) {
      next = fmtMMDDYYYY(raw);
    } else if (key === "knifeScore") {
      next = knifeSanitize(raw);
    } else if (NUMERIC.has(key)) {
      next = intOnly(raw);
    }

    setFormData((prev: any) => ({
      ...prev,
      [key]: next,
    }));

    setErrors((prev: any) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const token = await AsyncStorage.getItem("token");
      const baseUrl = apiBase || (await getServerIP());
      const weekNumber = Number(currentWeek);

      let nextFormData = { ...formData };

      const uploadedSignaturePaths =
        await uploadPendingEvaluationWeekSignatures({
          pendingSigs,
          baseUrl,
          token: token!,
          evaluationId: String(evaluationId),
          weekNumber,
        });

      if (uploadedSignaturePaths) {
        nextFormData = {
          ...nextFormData,
          ...uploadedSignaturePaths,
        };

        setPendingSigs({});
        setFormData(nextFormData);
      }

      const totalHoursOnJob = sumFields(nextFormData, HOURS_ON_JOB_KEYS);
      const totalHoursOffJob = sumFields(nextFormData, HOURS_OFF_JOB_KEYS);
      const totalHoursWithTrainee = sumFields(
        nextFormData,
        HOURS_WITH_TRAINEE_KEYS,
      );
      const totalHours = totalHoursOnJob + totalHoursOffJob;

      const knifeScoreValue =
        nextFormData.knifeScore === "" || nextFormData.knifeScore == null
          ? null
          : Number(nextFormData.knifeScore);

      const numericWeekData = formatWeekDataForApi(nextFormData);

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "add_or_update_week",
          data: {
            weekData: {
              ...numericWeekData,
              knifeScore:
                knifeScoreValue == null || Number.isNaN(knifeScoreValue)
                  ? null
                  : knifeScoreValue,
              expectedQualified,
              weekNumber: currentWeek,
              totalHours,
              totalHoursOnJob,
              totalHoursOffJob,
              totalHoursWithTrainee,
            },
          },
        },
        { headers: { Authorization: token! } },
      );

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        { action: "update_status", data: { status: "in_progress" } },
        { headers: { Authorization: token! } },
      );

      if (props?.onDone) {
        props.onDone();
      } else {
        router.replace({
          pathname: `/evaluations/${evaluationId}`,
          params: { employeeId },
        });
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldGroup = ({
    title,
    keys,
    startIndex,
    weekIndex,
  }: {
    title: string;
    keys: string[];
    startIndex: number;
    weekIndex: number;
  }) => {
    const jobStart = parseMDY(jobStartDate);
    const baseMonday = jobStart ? getMonday(jobStart) : null;
    const monday = baseMonday
      ? new Date(
          baseMonday.getFullYear(),
          baseMonday.getMonth(),
          baseMonday.getDate() + weekIndex * 7,
        )
      : null;

    const isFirstWeek = weekIndex === 0;
    const jobStartOnly = jobStart ? stripTime(jobStart) : null;

    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-semibold text-gray-800">
          {title}
        </Text>

        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((weekday, i) => {
          const key = keys[i];
          const base = monday ?? stripTime(new Date());
          const date = new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate() + i,
          );

          const isDisabled =
            isFirstWeek &&
            jobStartOnly &&
            stripTime(date).getTime() < jobStartOnly.getTime();

          const value = formData[key] == null ? "" : String(formData[key]);

          return (
            <View key={key} className="mb-4">
              <Text className="text-base text-gray-700">{weekday}</Text>
              <Text className="mb-2 text-[.8rem] text-gray-500">
                {fmtDateLong(date)}
              </Text>

              <TextInput
                ref={(r) => (inputRefs.current[startIndex + i] = r)}
                value={value}
                onChangeText={(text) => !isDisabled && handleChange(key, text)}
                editable={!isDisabled}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() =>
                  inputRefs.current[startIndex + i + 1]?.focus()
                }
                className={`rounded-md px-4 py-3 ${
                  isDisabled
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : errors[key]
                      ? "border border-red-500 text-gray-900"
                      : "border border-gray-300 text-gray-900"
                }`}
                maxLength={2}
              />

              {errors[key] && !isDisabled && (
                <Text className="mt-1 text-sm text-red-500">{errors[key]}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const simpleFields = [
    {
      label: "Percent Qualified (%)",
      key: "percentQualified",
      keyboardType: "number-pad" as const,
    },
    {
      label: "Expected Qualified (%)",
      key: "expectedQualified",
      keyboardType: "number-pad" as const,
      editable: false,
      format: () => `${expectedQualified.toFixed(1)}%`,
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
      keyboardType:
        Platform.OS === "ios" ? ("decimal-pad" as const) : ("numeric" as const),
    },
    { label: "Comments", key: "comments", multiline: true },
  ];

  const makePreview = (value: string) =>
    value?.startsWith("/api/") ? absFromRelative(value, apiBase) : value;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 80,
            paddingTop: 20,
          }}
        >
          <FieldGroup
            title="Hours On Job"
            keys={HOURS_ON_JOB_KEYS}
            startIndex={0}
            weekIndex={currentWeek - 1}
          />

          <FieldGroup
            title="Hours Off Job"
            keys={HOURS_OFF_JOB_KEYS}
            startIndex={6}
            weekIndex={currentWeek - 1}
          />

          <FieldGroup
            title="Hours with Trainee"
            keys={HOURS_WITH_TRAINEE_KEYS}
            startIndex={12}
            weekIndex={currentWeek - 1}
          />

          {simpleFields.map((field) => {
            const raw = formData[field.key];
            const value = field.format
              ? field.format()
              : raw == null
                ? ""
                : String(raw);

            return (
              <Labeled key={field.key} label={field.label}>
                <TextInput
                  value={value == null ? "" : String(value)}
                  onChangeText={(text) => handleChange(field.key, text)}
                  placeholder={field.label}
                  editable={field.editable !== false}
                  multiline={!!field.multiline}
                  keyboardType={field.keyboardType || "default"}
                  className={`rounded-md border px-4 py-3 text-gray-900 ${
                    errors[field.key] ? "border-red-500" : "border-gray-300"
                  } ${field.editable === false ? "bg-gray-100 text-gray-400" : ""}`}
                  style={{
                    textAlignVertical: field.multiline ? "top" : "center",
                  }}
                  numberOfLines={field.multiline ? 4 : 1}
                  maxLength={
                    field.key === "knifeScore"
                      ? 6
                      : field.key === "yieldAuditDate" ||
                          field.key === "knifeSkillsAuditDate"
                        ? 10
                        : undefined
                  }
                />

                {errors[field.key] && (
                  <Text className="mt-1 text-sm text-red-500">
                    {errors[field.key]}
                  </Text>
                )}
              </Labeled>
            );
          })}

          {(["hasPain", "handStretchCompleted"] as const).map((key) => (
            <View key={key} className="mb-6">
              <Text className="mb-2 text-base font-medium text-gray-700">
                {key === "hasPain"
                  ? "Any pain/numbness?"
                  : "Hand Stretch Exercises Completed"}
              </Text>

              <SinglePressTouchable
                onPress={() =>
                  setFormData((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className={`items-center rounded-md py-3 ${
                  key === "hasPain"
                    ? formData.hasPain
                      ? "bg-red-600"
                      : "bg-green-600"
                    : formData.handStretchCompleted
                      ? "bg-green-600"
                      : "bg-red-600"
                }`}
              >
                <Text className="text-lg font-semibold text-white">
                  {formData[key] ? "Yes" : "No"}
                </Text>
              </SinglePressTouchable>
            </View>
          ))}

          {(
            [
              { key: "trainerSignature", label: currentUser.name },
              { key: "teamMemberSignature", label: traineeName || "Trainee" },
              { key: "supervisorSignature", label: "Supervisor" },
            ] as const
          ).map((sig) => {
            const stored = formData[sig.key];
            const previewUri = makePreview(stored);

            return (
              <Labeled key={sig.key} label={sig.label}>
                <SinglePressTouchable
                  onPress={() => setSignatureType(sig.key)}
                  className={`items-center justify-center rounded-md px-4 py-3 ${
                    errors[sig.key]
                      ? "bg-gray-100 border border-red-500"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                >
                  {stored ? (
                    <Image
                      source={{ uri: previewUri }}
                      className="h-16 w-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <Text className="text-gray-500">Tap to sign</Text>
                  )}
                </SinglePressTouchable>

                {errors[sig.key] && (
                  <Text className="mt-1 text-sm text-red-500">
                    {errors[sig.key]}
                  </Text>
                )}
              </Labeled>
            );
          })}

          <View className="my-10">
            <SinglePressTouchable
              onPress={handleSubmit}
              activeOpacity={0.85}
              className="items-center rounded-md bg-[#1a237e] py-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text className="text-lg font-semibold text-white">
                  Save & Continue
                </Text>
              )}
            </SinglePressTouchable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SignatureModal
        visible={!!signatureType}
        onOK={(b64: string) => {
          if (!signatureType) return;
          setPendingSigs((prev) => ({ ...prev, [signatureType]: b64 }));
          setFormData((prev) => ({ ...prev, [signatureType]: b64 }));
          setSignatureType(null);
        }}
        onCancel={() => setSignatureType(null)}
      />
    </SafeAreaView>
  );
}
