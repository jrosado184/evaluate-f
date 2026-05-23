// @ts-nocheck
import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";

import SignatureModal from "@/components/SignatureModal";
import useAuthContext from "@/app/context/AuthContext";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { parseMDY } from "@/app/helpers/dates";
import { useStep2EvaluationForm } from "@/hooks/evaluations/useStep2EvaluationForm";
import {
  absFromRelative,
  DATE_KEYS,
  fmtDateLong,
  fmtMMDDYYYY,
  getMonday,
  HOURS_OFF_JOB_KEYS,
  HOURS_ON_JOB_KEYS,
  HOURS_WITH_TRAINEE_KEYS,
  intOnly,
  knifeSanitize,
  NUMERIC,
  SIGNATURE_FIELDS,
  SIMPLE_FIELDS,
} from "@/app/helpers/evaluations/step2FormHelpers";

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
  const { currentUser } = useAuthContext();

  const evaluationId =
    props?.evaluationId ?? params?.evaluationId ?? params?.id;
  const employeeId = params?.id ?? params?.employeeId;
  const weekParam = props?.week ?? params?.week;
  const currentWeek = parseInt(String(weekParam || "1"), 10);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const {
    formData,
    setFormData,
    errors,
    clearFieldError,
    loading,
    isSubmitting,
    signatureType,
    setSignatureType,
    traineeName,
    jobStartDate,
    apiBase,
    pendingSigs,
    setPendingSigs,
    expectedQualified,
    submit,
  } = useStep2EvaluationForm({
    evaluationId: String(evaluationId),
    currentWeek,
    currentUserName: currentUser?.name || "",
    onDone: props?.onDone,
    onNavigateBack: () =>
      router.replace({
        pathname: `/evaluations/${evaluationId}`,
        params: { employeeId },
      }),
  });

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

    clearFieldError(key);
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
    const jobStartOnly = jobStart
      ? new Date(
          jobStart.getFullYear(),
          jobStart.getMonth(),
          jobStart.getDate(),
        )
      : null;

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
          const base = monday ?? new Date();
          const date = new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate() + i,
          );

          const isDisabled =
            isFirstWeek &&
            jobStartOnly &&
            new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ).getTime() < jobStartOnly.getTime();

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

          {SIMPLE_FIELDS.map((field) => {
            const raw = formData[field.key];
            const value =
              field.key === "expectedQualified"
                ? `${expectedQualified.toFixed(1)}%`
                : raw == null
                  ? ""
                  : String(raw);

            return (
              <Labeled key={field.key} label={field.label}>
                <TextInput
                  value={value}
                  onChangeText={(text) => handleChange(field.key, text)}
                  placeholder={field.label}
                  editable={field.key !== "expectedQualified"}
                  multiline={!!field.multiline}
                  keyboardType={
                    field.key === "knifeScore"
                      ? Platform.OS === "ios"
                        ? "decimal-pad"
                        : "numeric"
                      : field.keyboardType || "default"
                  }
                  className={`rounded-md border px-4 py-3 text-gray-900 ${
                    errors[field.key] ? "border-red-500" : "border-gray-300"
                  } ${field.key === "expectedQualified" ? "bg-gray-100 text-gray-400" : ""}`}
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

          {SIGNATURE_FIELDS(currentUser?.name || "Trainer", traineeName).map(
            (sig) => {
              const stored = formData[sig.key];
              const previewUri = absFromRelative(stored, apiBase);

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
            },
          )}

          <View className="my-10">
            <SinglePressTouchable
              onPress={submit}
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
