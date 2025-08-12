import React, { useEffect, useState, useRef } from "react";
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
import { formatLongDate, getMondayOfWeek, parseMDY } from "@/app/helpers/dates";

const Step2Form = () => {
  const router = useRouter();
  const { id: employeeId, evaluationId, week } = useLocalSearchParams();
  const { currentUser } = useAuthContext();
  const currentWeek = parseInt((week as string) || "1", 10);

  const [formData, setFormData] = useState<any>({
    hoursMonday: "",
    hoursTuesday: "",
    hoursWednesday: "",
    hoursThursday: "",
    hoursFriday: "",
    hoursOffJobMonday: "",
    hoursOffJobTuesday: "",
    hoursOffJobWednesday: "",
    hoursOffJobThursday: "",
    hoursOffJobFriday: "",
    hoursWithTraineeMonday: "",
    hoursWithTraineeTuesday: "",
    hoursWithTraineeWednesday: "",
    hoursWithTraineeThursday: "",
    hoursWithTraineeFriday: "",
    percentQualified: "",
    expectedQualified: "",
    reTimeAchieved: "",
    yieldAuditDate: "",
    knifeSkillsAuditDate: "",
    knifeScore: "",
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
  const [signatureType, setSignatureType] = useState<null | string>(null);
  const [traineeName, setTraineeName] = useState("Trainee");
  const [projectedTrainingHours, setProjectedTrainingHours] = useState(200);
  const [jobStartDate, setJobStartDate] = useState("");

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [prevHoursOnJob, setPrevHoursOnJob] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
          headers: { Authorization: token! },
        });
        setJobStartDate(res.data.personalInfo.jobStartDate);

        const evalDoc = res.data;

        setTraineeName(evalDoc.personalInfo.teamMemberName || "Trainee");

        const projected =
          Number(evalDoc.personalInfo.projectedTrainingHours) || 200;
        setProjectedTrainingHours(projected);

        const cumulative = evalDoc.evaluations
          .filter((e: any) => e.weekNumber < currentWeek)
          .reduce((sum: number, e: any) => sum + (e.totalHoursOnJob || 0), 0);

        setPrevHoursOnJob(cumulative);

        const weekData = evalDoc.evaluations.find(
          (e: any) => e.weekNumber === currentWeek
        );
        if (weekData) {
          setFormData((f: any) => ({ ...f, ...weekData }));
        }
      } catch {
        Alert.alert("Error", "Failed to load evaluation");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId, currentWeek]);

  useEffect(() => {
    const weekHours = [
      Number(formData.hoursMonday) || 0,
      Number(formData.hoursTuesday) || 0,
      Number(formData.hoursWednesday) || 0,
      Number(formData.hoursThursday) || 0,
      Number(formData.hoursFriday) || 0,
    ];

    const sumCurrentWeek = weekHours.reduce((acc, v) => acc + v, 0);
    const total = prevHoursOnJob + sumCurrentWeek;

    const pctRaw = projectedTrainingHours
      ? (total / projectedTrainingHours) * 100
      : 0;

    const pct = Math.min(pctRaw, 100).toFixed(1) + "%";

    setFormData((f: any) => ({ ...f, expectedQualified: pct }));
  }, [
    formData.hoursMonday,
    formData.hoursTuesday,
    formData.hoursWednesday,
    formData.hoursThursday,
    formData.hoursFriday,
    prevHoursOnJob,
    projectedTrainingHours,
  ]);

  const handleChange = (key: string, value: string, index?: number) => {
    let v = value;
    if (["yieldAuditDate", "knifeSkillsAuditDate"].includes(key)) {
      v = v
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, a, b, c) =>
          [a, b, c].filter(Boolean).join("/")
        );
    }
    if (key === "knifeScore") {
      v = v.replace(/[^0-9.]/g, "").slice(0, 3);
    }
    if (
      key.startsWith("hours") ||
      key === "percentQualified" ||
      key === "reTimeAchieved"
    ) {
      v = v.replace(/\D/g, "");
    }
    setFormData((f: any) => ({ ...f, [key]: v }));
    if (errors[key]) {
      setErrors((e) => {
        const c = { ...e };
        delete c[key];
        return c;
      });
    }

    if (index !== undefined && v.length === 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const total = (keys: string[]) =>
    keys.reduce((s, k) => s + (Number(formData[k]) || 0), 0);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // ---------- 1. derive all totals ----------
      const totalHoursOnJob = total([
        "hoursMonday",
        "hoursTuesday",
        "hoursWednesday",
        "hoursThursday",
        "hoursFriday",
      ]);

      const totalHoursOffJob = total([
        "hoursOffJobMonday",
        "hoursOffJobTuesday",
        "hoursOffJobWednesday",
        "hoursOffJobThursday",
        "hoursOffJobFriday",
      ]);

      const totalHoursWithTrainee = total([
        "hoursWithTraineeMonday",
        "hoursWithTraineeTuesday",
        "hoursWithTraineeWednesday",
        "hoursWithTraineeThursday",
        "hoursWithTraineeFriday",
      ]);

      const totalHours = totalHoursOnJob + totalHoursOffJob;

      // ---------- 2. send API calls ----------
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      // add/update this week
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "add_or_update_week",
          data: {
            weekData: {
              ...formData,
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

      // update overall status
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "update_status",
          data: { status: "in_progress" },
        },
        { headers: { Authorization: token! } }
      );

      // go back
      router.replace(`/evaluations/${evaluationId}`);
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

  /* --------------------------------------------------------------- *
   *  renderFieldGroup
   *  -------------------------------------------------------------- *
   *  • weekIndex = 0  → first week (starts at jobStartDate’s week)
   *  • weekIndex = 1  → second week (add 7 days), etc.
   * --------------------------------------------------------------- */
  const renderFieldGroup = (
    title: string,
    keys: string[],
    startIndex: number,
    weekIndex: number | string
  ) => {
    const weekIdxNum =
      typeof weekIndex === "string" ? Number(weekIndex) : weekIndex;

    const safeWeekIdx = Number.isFinite(weekIdxNum) ? weekIdxNum : 0;

    const jobStart = parseMDY(jobStartDate); // Date | null

    const stripTime = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const getMonday = (date: Date): Date => {
      const d = stripTime(new Date(date));
      const day = d.getDay(); // 0..6
      const diff = day === 0 ? 1 : 1 - day;
      d.setDate(d.getDate() + diff);
      return d;
    };

    const baseMonday =
      jobStart instanceof Date && !isNaN(jobStart.getTime())
        ? getMonday(jobStart)
        : null;

    const mondayOfThisWeek = baseMonday
      ? new Date(
          baseMonday.getFullYear(),
          baseMonday.getMonth(),
          baseMonday.getDate() + safeWeekIdx * 7
        )
      : null;

    const formatDateOnly = (d: Date): string =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(d);

    const isFirstWeek = safeWeekIdx === 0;
    const jobStartOnly =
      jobStart instanceof Date && !isNaN(jobStart.getTime())
        ? stripTime(jobStart)
        : null;

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          {title}
        </Text>

        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
          (weekday, i) => {
            const key = keys[i];

            const baseForDay = mondayOfThisWeek ?? stripTime(new Date());
            const currentDate = new Date(
              baseForDay.getFullYear(),
              baseForDay.getMonth(),
              baseForDay.getDate() + i
            );

            let isDisabled = false;
            if (isFirstWeek && jobStartOnly) {
              isDisabled =
                stripTime(currentDate).getTime() < jobStartOnly.getTime();
            }

            return (
              <View key={key} className="mb-4">
                <Text className="text-base text-gray-700">{weekday}</Text>
                <Text className="text-[.8rem] text-gray-500 mb-2">
                  {formatDateOnly(currentDate)}
                </Text>

                <TextInput
                  ref={(ref) => (inputRefs.current[startIndex + i] = ref)}
                  value={formData[key]}
                  onChangeText={(t) =>
                    !isDisabled && handleChange(key, t, startIndex + i)
                  }
                  editable={!isDisabled}
                  placeholder="0"
                  keyboardType="numeric"
                  className={`rounded-md px-4 py-3 ${
                    isDisabled
                      ? "bg-gray-100 border-gray-200 text-gray-400"
                      : errors[key]
                      ? "border-red-500 border text-gray-900"
                      : "border border-gray-300 text-gray-900"
                  }`}
                  maxLength={1}
                />

                {errors[key] && !isDisabled && (
                  <Text className="text-sm text-red-500 mt-1">
                    {errors[key]}
                  </Text>
                )}
              </View>
            );
          }
        )}
      </View>
    );
  };

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
              onPress={() => router.replace(`/evaluations/${evaluationId}`)}
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

          {renderFieldGroup(
            "Hours On Job",
            [
              "hoursMonday",
              "hoursTuesday",
              "hoursWednesday",
              "hoursThursday",
              "hoursFriday",
            ],
            0,
            currentWeek - 1
          )}
          {renderFieldGroup(
            "Hours Off Job",
            [
              "hoursOffJobMonday",
              "hoursOffJobTuesday",
              "hoursOffJobWednesday",
              "hoursOffJobThursday",
              "hoursOffJobFriday",
            ],
            5,
            currentWeek - 1
          )}
          {renderFieldGroup(
            "Hours with Trainee",
            [
              "hoursWithTraineeMonday",
              "hoursWithTraineeTuesday",
              "hoursWithTraineeWednesday",
              "hoursWithTraineeThursday",
              "hoursWithTraineeFriday",
            ],
            10,
            currentWeek - 1
          )}

          {[
            {
              label: "Percent Qualified (%)",
              key: "percentQualified",
              keyboardType: "numeric",
            },
            {
              label: "Expected Qualified (%)",
              key: "expectedQualified",
              editable: false,
              keyboardType: "numeric",
            },
            {
              label: "RE Time (s)",
              key: "reTimeAchieved",
              keyboardType: "numeric",
            },
            {
              label: "Yield Audit Date",
              key: "yieldAuditDate",
              keyboardType: "numeric",
            },
            {
              label: "Knife Audit Date",
              key: "knifeSkillsAuditDate",
              keyboardType: "numeric",
            },
            {
              label: "Knife Score (%)",
              key: "knifeScore",
              keyboardType: "decimal-pad",
            },
            { label: "Comments", key: "comments", multiline: true },
          ].map((f) => (
            <View key={f.key} className="mb-5">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {f.label}
              </Text>
              <TextInput
                value={formData[f.key]}
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
            </View>
          ))}

          {["hasPain", "handStretchCompleted"].map((k) => (
            <View key={k} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {k === "hasPain"
                  ? "Any pain/numbness?"
                  : "Hand Stretch Exercises Completed"}
              </Text>
              <SinglePressTouchable
                onPress={() => setFormData((f: any) => ({ ...f, [k]: !f[k] }))}
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
            { key: "teamMemberSignature", label: traineeName },
            { key: "supervisorSignature", label: "Supervisor" },
          ].map((s) => (
            <View key={s.key} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {s.label}
              </Text>
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
            </View>
          ))}

          <SinglePressTouchable
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-[#1a237e] py-4 rounded-md items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
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
        onOK={(base64: string) => {
          setFormData((f: any) => ({ ...f, [signatureType!]: base64 }));
          setSignatureType(null);
        }}
        onCancel={() => setSignatureType(null)}
      />
    </SafeAreaView>
  );
};

export default Step2Form;
