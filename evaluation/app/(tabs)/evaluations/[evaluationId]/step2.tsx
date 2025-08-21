import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import SignatureModal from "@/components/SignatureModal";
import useAuthContext from "@/app/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { parseMDY } from "@/app/helpers/dates";

/* ---------------- helpers (kept tiny) ---------------- */
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
  "hoursOffJobMonday",
  "hoursOffJobTuesday",
  "hoursOffJobWednesday",
  "hoursOffJobThursday",
  "hoursOffJobFriday",
  "hoursWithTraineeMonday",
  "hoursWithTraineeTuesday",
  "hoursWithTraineeWednesday",
  "hoursWithTraineeThursday",
  "hoursWithTraineeFriday",
]);
const DATE_KEYS = new Set(["yieldAuditDate", "knifeSkillsAuditDate"]);

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
      [a, b, c].filter(Boolean).join("/")
    );
const intOnly = (s: string) => s.replace(/\D/g, "");
const knifeSanitize = (s: string) => {
  const c = s.replace(/[^0-9.]/g, "");
  const p = c.split(".");
  return (p.length > 1 ? `${p[0]}.${p.slice(1).join("")}` : c).slice(0, 3);
};
const toNum = (s: string) => (s === "" ? null : Number.isNaN(+s) ? null : +s);

/* ---------------- small presentational bits ---------------- */
const Labeled = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View className="mb-5">
    <Text className="text-base font-medium text-gray-700 mb-2">{label}</Text>
    {children}
  </View>
);

/* =============================== screen =============================== */
export default function Step2Form() {
  const router = useRouter();
  const {
    id: employeeId,
    evaluationId,
    week,
    from,
  }: any = useLocalSearchParams();
  const { currentUser } = useAuthContext();
  const currentWeek = parseInt((week as string) || "1", 10);

  const [formData, setFormData] = useState<Record<string, any>>({
    // numeric → null
    hoursMonday: null,
    hoursTuesday: null,
    hoursWednesday: null,
    hoursThursday: null,
    hoursFriday: null,
    hoursSaturday: null,
    hoursOffJobMonday: null,
    hoursOffJobTuesday: null,
    hoursOffJobWednesday: null,
    hoursOffJobThursday: null,
    hoursOffJobFriday: null,
    hoursOffSaturday: null,
    hoursWithTraineeMonday: null,
    hoursWithTraineeTuesday: null,
    hoursWithTraineeWednesday: null,
    hoursWithTraineeThursday: null,
    hoursWithTraineeFriday: null,
    hoursWithTraineeSaturday: null,
    percentQualified: null,
    expectedQualified: null,
    reTimeAchieved: null,
    knifeScore: null,
    // dates/text/bools
    yieldAuditDate: "",
    knifeSkillsAuditDate: "",
    handStretchCompleted: false,
    hasPain: false,
    comments: "",
    trainerSignature: "",
    teamMemberSignature: "",
    supervisorSignature: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureType, setSignatureType] = useState<string | null>(null);
  const [traineeName, setTraineeName] = useState("Trainee");
  const [projectedTrainingHours, setProjectedTrainingHours] =
    useState<number>(200);
  const [jobStartDate, setJobStartDate] = useState("");
  const [prevHoursOnJob, setPrevHoursOnJob] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  /* load evaluation */
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const { data } = await axios.get(
          `${baseUrl}/evaluations/${evaluationId}`,
          { headers: { Authorization: token! } }
        );

        setJobStartDate(data.personalInfo.jobStartDate);
        setTraineeName(data.personalInfo.teamMemberName || "Trainee");
        setProjectedTrainingHours(
          Number(data.personalInfo.projectedTrainingHours) || 200
        );

        const cumulative = data.evaluations
          .filter((e: any) => e.weekNumber < currentWeek)
          .reduce((sum: number, e: any) => sum + (e.totalHoursOnJob || 0), 0);
        setPrevHoursOnJob(cumulative);

        const weekData = data.evaluations.find(
          (e: any) => e.weekNumber === currentWeek
        );
        if (weekData) {
          const next: Record<string, any> = {};
          Object.entries(weekData).forEach(([k, v]) => {
            if (NUMERIC.has(k)) next[k] = v == null ? null : Number(v);
            else if (DATE_KEYS.has(k)) next[k] = typeof v === "string" ? v : "";
            else next[k] = v;
          });
          setFormData((f) => ({ ...f, ...next }));
        }
      } catch {
        Alert.alert("Error", "Failed to load evaluation");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId, currentWeek]);

  // helpers
  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
  const roundToQuarter = (n: number) => Math.round(n * 4) / 4;

  // expectedQualified with quarter rounding (stores as number)
  const expectedQualified = useMemo(() => {
    // make weekSum numeric-safe
    const weekSum = [
      "hoursMonday",
      "hoursTuesday",
      "hoursWednesday",
      "hoursThursday",
      "hoursFriday",
      "hoursSaturday",
    ].reduce((s, k) => s + toNum(formData[k]), 0);

    const total = toNum(prevHoursOnJob) + weekSum;

    const rawPct =
      toNum(projectedTrainingHours) > 0
        ? (total / toNum(projectedTrainingHours)) * 100
        : 0;

    const clamped = clamp(rawPct, 0, 100);
    const quarter = roundToQuarter(clamped);

    return Number(quarter.toFixed(2));
  }, [
    formData.hoursMonday,
    formData.hoursTuesday,
    formData.hoursWednesday,
    formData.hoursThursday,
    formData.hoursFriday,
    formData.hoursSaturday,
    prevHoursOnJob,
    projectedTrainingHours,
  ]);

  /* single input handler */
  const handleChange = (key: string, raw: string, index?: number) => {
    let next: string | number | null = raw;
    let len = raw.length;

    if (DATE_KEYS.has(key)) next = fmtMMDDYYYY(raw);
    else if (key === "knifeScore") {
      const s = knifeSanitize(raw);
      next = toNum(s);
      len = s.length;
    } else if (NUMERIC.has(key)) {
      const s = intOnly(raw);
      next = toNum(s);
      len = s.length;
    }

    setFormData((f) => ({ ...f, [key]: next }));
    if (errors[key])
      setErrors((e) => {
        const c = { ...e };
        delete c[key];
        return c;
      });
    if (typeof index === "number" && len === 1)
      inputRefs.current[index + 1]?.focus();
  };

  const sum = (keys: string[]) =>
    keys.reduce((s, k) => s + Number(formData[k] ?? 0), 0);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const totalHoursOnJob = sum([
        "hoursMonday",
        "hoursTuesday",
        "hoursWednesday",
        "hoursThursday",
        "hoursFriday",
        "hoursSaturday",
      ]);
      const totalHoursOffJob = sum([
        "hoursOffJobMonday",
        "hoursOffJobTuesday",
        "hoursOffJobWednesday",
        "hoursOffJobThursday",
        "hoursOffJobFriday",
        "hoursOffJobSaturday",
      ]);
      const totalHoursWithTrainee = sum([
        "hoursWithTraineeMonday",
        "hoursWithTraineeTuesday",
        "hoursWithTraineeWednesday",
        "hoursWithTraineeThursday",
        "hoursWithTraineeFriday",
        "hoursWithTraineeSaturday",
      ]);
      const totalHours = totalHoursOnJob + totalHoursOffJob;

      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "add_or_update_week",
          data: {
            weekData: {
              ...formData,
              expectedQualified, // numeric
              weekNumber: currentWeek,
              totalHours,
              totalHoursOnJob,
              totalHoursOffJob,
              totalHoursWithTrainee,
            },
          },
        },
        { headers: { Authorization: token! } }
      );

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "update_status",
          data: { status: "in_progress" },
        },
        { headers: { Authorization: token! } }
      );

      router.replace({
        pathname: `/evaluations/${evaluationId}`,
        params: {
          employeeId,
        },
      });
    } catch {
      Alert.alert("Error", "Failed to save evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  /* compact field group */
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
    const js = parseMDY(jobStartDate);
    const baseMon = js ? getMonday(js) : null;
    const mon = baseMon
      ? new Date(
          baseMon.getFullYear(),
          baseMon.getMonth(),
          baseMon.getDate() + weekIndex * 7
        )
      : null;
    const isFirstWeek = weekIndex === 0;
    const jsOnly = js ? stripTime(js) : null;

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
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
          const k = keys[i];
          const base = mon ?? stripTime(new Date());
          const d = new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate() + i
          );
          const isDisabled =
            isFirstWeek && jsOnly && stripTime(d).getTime() < jsOnly.getTime();
          const val = formData[k] == null ? "" : String(formData[k]);

          return (
            <View key={k} className="mb-4">
              <Text className="text-base text-gray-700">{weekday}</Text>
              <Text className="text-[.8rem] text-gray-500 mb-2">
                {fmtDateLong(d)}
              </Text>
              <TextInput
                ref={(r) => (inputRefs.current[startIndex + i] = r)}
                value={val}
                onChangeText={(t) =>
                  !isDisabled && handleChange(k, t, startIndex + i)
                }
                editable={!isDisabled}
                placeholder="0"
                keyboardType="number-pad"
                className={`rounded-md px-4 py-3 ${
                  isDisabled
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : errors[k]
                    ? "border-red-500 border text-gray-900"
                    : "border border-gray-300 text-gray-900"
                }`}
                maxLength={1}
              />
              {errors[k] && !isDisabled && (
                <Text className="text-sm text-red-500 mt-1">{errors[k]}</Text>
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
      keyboardType: "decimal-pad" as const,
    },
    { label: "Comments", key: "comments", multiline: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View className="flex-row items-center mb-6">
            <SinglePressTouchable
              onPress={() =>
                router.replace({
                  pathname: `/evaluations/[evaluationId]`,
                  params: {
                    evaluationId: evaluationId,
                    from: from,
                  },
                })
              }
              className="mr-3"
            >
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </SinglePressTouchable>
            <Text className="text-2xl font-semibold text-gray-900">
              {`${currentWeek}${
                ["st", "nd", "rd"][currentWeek - 1] || "th"
              } Week`}
            </Text>
          </View>

          <FieldGroup
            title="Hours On Job"
            keys={[
              "hoursMonday",
              "hoursTuesday",
              "hoursWednesday",
              "hoursThursday",
              "hoursFriday",
              "hoursSaturday",
            ]}
            startIndex={0}
            weekIndex={currentWeek - 1}
          />
          <FieldGroup
            title="Hours Off Job"
            keys={[
              "hoursOffJobMonday",
              "hoursOffJobTuesday",
              "hoursOffJobWednesday",
              "hoursOffJobThursday",
              "hoursOffJobFriday",
              "hoursOffJobSaturday",
            ]}
            startIndex={6}
            weekIndex={currentWeek - 1}
          />
          <FieldGroup
            title="Hours with Trainee"
            keys={[
              "hoursWithTraineeMonday",
              "hoursWithTraineeTuesday",
              "hoursWithTraineeWednesday",
              "hoursWithTraineeThursday",
              "hoursWithTraineeFriday",
              "hoursWithTraineeSaturday",
            ]}
            startIndex={12}
            weekIndex={currentWeek - 1}
          />

          {simpleFields.map((f) => {
            const raw = formData[f.key];
            const val = f.format ? f.format() : raw == null ? "" : String(raw);
            return (
              <Labeled key={f.key} label={f.label}>
                <TextInput
                  value={val}
                  onChangeText={(t) => handleChange(f.key, t)}
                  placeholder={f.label}
                  editable={f.editable !== false}
                  multiline={!!f.multiline}
                  keyboardType={f.keyboardType || "default"}
                  className={`border ${
                    errors[f.key] ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-3 text-gray-900 ${
                    f.editable === false ? "bg-gray-100 text-gray-400" : ""
                  }`}
                  style={{ textAlignVertical: f.multiline ? "top" : "center" }}
                  numberOfLines={f.multiline ? 4 : 1}
                />
                {errors[f.key] && (
                  <Text className="text-sm text-red-500 mt-1">
                    {errors[f.key]}
                  </Text>
                )}
              </Labeled>
            );
          })}

          {(["hasPain", "handStretchCompleted"] as const).map((k) => (
            <View key={k} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {k === "hasPain"
                  ? "Any pain/numbness?"
                  : "Hand Stretch Exercises Completed"}
              </Text>
              <SinglePressTouchable
                onPress={() => setFormData((f) => ({ ...f, [k]: !f[k] }))}
                className={`py-3 rounded-md items-center ${
                  k === "hasPain"
                    ? formData.hasPain
                      ? "bg-red-600"
                      : "bg-green-600"
                    : formData.handStretchCompleted
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                <Text className="text-white text-lg font-semibold">
                  {formData[k] ? "Yes" : "No"}
                </Text>
              </SinglePressTouchable>
            </View>
          ))}

          {[
            { key: "trainerSignature", label: currentUser.name },
            { key: "teamMemberSignature", label: "Trainee" },
            { key: "supervisorSignature", label: "Supervisor" },
          ].map((s) => (
            <Labeled key={s.key} label={s.label}>
              <SinglePressTouchable
                onPress={() => setSignatureType(s.key)}
                className={`rounded-md px-4 py-3 justify-center items-center ${
                  errors[s.key]
                    ? "bg-gray-100 border border-red-500"
                    : "bg-gray-100 border border-gray-300"
                }`}
              >
                {formData[s.key] ? (
                  <Image
                    source={{ uri: formData[s.key] }}
                    className="w-full h-16"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-500">Tap to sign</Text>
                )}
              </SinglePressTouchable>
              {errors[s.key] && (
                <Text className="text-sm text-red-500 mt-1">
                  {errors[s.key]}
                </Text>
              )}
            </Labeled>
          ))}

          <SinglePressTouchable
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-[#1a237e] py-4 rounded-md items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Save & Continue
              </Text>
            )}
          </SinglePressTouchable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SignatureModal
        visible={!!signatureType}
        onOK={(b64: string) => {
          setFormData((f) => ({ ...f, [signatureType!]: b64 }));
          setSignatureType(null);
        }}
        onCancel={() => setSignatureType(null)}
      />
    </SafeAreaView>
  );
}
