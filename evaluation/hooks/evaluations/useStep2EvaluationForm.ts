import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import getServerIP from "@/app/requests/NetworkAddress";
import {
  clamp,
  formatWeekDataForApi,
  HOURS_OFF_JOB_KEYS,
  HOURS_ON_JOB_KEYS,
  HOURS_WITH_TRAINEE_KEYS,
  INITIAL_FORM_DATA,
  mapWeekDataToFormData,
  roundToQuarter,
  sumFields,
  toNum,
  uploadPendingEvaluationWeekSignatures,
} from "@/app/helpers/evaluations/step2FormHelpers";

type UseStep2EvaluationFormArgs = {
  evaluationId: string;
  currentWeek: number;
  currentUserName: string;
  onDone?: () => void;
  onNavigateBack?: () => void;
};

export function useStep2EvaluationForm({
  evaluationId,
  currentWeek,
  currentUserName,
  onDone,
  onNavigateBack,
}: UseStep2EvaluationFormArgs) {
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
  const [apiBase, setApiBase] = useState("");

  const [pendingSigs, setPendingSigs] = useState<
    Partial<
      Record<
        "trainerSignature" | "teamMemberSignature" | "supervisorSignature",
        string
      >
    >
  >({});

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        if (!isMounted) return;
        setApiBase(baseUrl);

        const { data } = await axios.get(
          `${baseUrl}/evaluations/${evaluationId}`,
          { headers: { Authorization: token! } },
        );

        if (!isMounted) return;

        setJobStartDate(data.personalInfo?.jobStartDate || "");
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
          setFormData((prev) => ({
            ...prev,
            ...mapWeekDataToFormData(weekData, baseUrl),
          }));
        }
      } catch {
        Alert.alert("Error", "Failed to load evaluation");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
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

  const clearFieldError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const submit = async () => {
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

      if (onDone) {
        onDone();
      } else {
        onNavigateBack?.();
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    clearFieldError,
    loading,
    isSubmitting,
    signatureType,
    setSignatureType,
    traineeName,
    projectedTrainingHours,
    jobStartDate,
    prevHoursOnJob,
    apiBase,
    pendingSigs,
    setPendingSigs,
    expectedQualified,
    currentUserName,
    submit,
  };
}
