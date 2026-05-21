import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import SinglePressTouchable from "@/app/utils/SinglePress";
import useEmployeeContext from "@/app/context/EmployeeContext";
import getServerIP from "@/app/requests/NetworkAddress";
import { getAvatarMeta } from "@/app/helpers/avatar";

type Props = {
  jsa: any;
  onSuccess?: () => void;
  onViewPdf?: (employeeJsa: any) => void;
};

type SignatureKey = "employeeSignature" | "trainerSignature";

const INITIAL_FORM_DATA = {
  employeeSignature: "",
  trainerSignature: "",
};

const SIGNATURE_FIELDS: Array<{ key: SignatureKey; label: string }> = [
  { key: "employeeSignature", label: "Employee" },
  { key: "trainerSignature", label: "Trainer" },
];

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

function getQuestionOptions(question: any) {
  return question?.type === "text"
    ? ["Myself", "My supervisor"]
    : ["Yes", "No"];
}

const ViewCompletedJsa = ({ jsa, onViewPdf }: Props) => {
  const { employee } = useEmployeeContext();
  const { width } = useWindowDimensions();

  const isTabletLayout = width >= 768;

  const questions = useMemo(
    () => (Array.isArray(jsa?.questions) ? jsa.questions : []),
    [jsa?.questions],
  );

  const [apiBase, setApiBase] = useState("");
  const [loading, setLoading] = useState(true);
  const [employeeJsa, setEmployeeJsa] = useState<any | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const assignedByName = employeeJsa?.assignedBy || "Not available";
  const assignedByAvatar = getAvatarMeta(
    assignedByName === "Not available" ? "NA" : assignedByName,
  );

  useEffect(() => {
    if (!jsa?._id || !employee?._id) return;

    let isMounted = true;

    const fetchCompletedJsa = async () => {
      try {
        setLoading(true);

        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        if (!isMounted) return;
        setApiBase(baseUrl);

        const response = await axios.get(
          `${baseUrl}/employee-jsas?jsaId=${jsa._id}&employeeId=${employee._id}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        if (!isMounted) return;

        const record = response?.data?.data?.[0] || null;
        setEmployeeJsa(record);

        const nextResponses =
          record?.responses && typeof record.responses === "object"
            ? record.responses
            : {};

        setResponses(nextResponses);

        setFormData({
          employeeSignature: record?.employeeSignature?.url || "",
          trainerSignature: record?.trainerSignature?.url || "",
        });
      } catch (error: any) {
        if (!isMounted) return;
        console.log(
          "Failed to fetch completed employee JSA",
          error?.response?.data || error,
        );
        setEmployeeJsa(null);
        setResponses({});
        setFormData(INITIAL_FORM_DATA);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompletedJsa();

    return () => {
      isMounted = false;
    };
  }, [jsa?._id, employee?._id]);

  const makePreview = (value: string) =>
    value?.startsWith("/api/") ? absFromRelative(value, apiBase) : value;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-[14px] font-medium text-gray-500">
          Loading completed JSA...
        </Text>
      </View>
    );
  }

  if (!employeeJsa) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#9CA3AF"
          />
        </View>
        <Text className="mt-4 text-[17px] font-semibold text-gray-800">
          Completed JSA not found
        </Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-gray-500">
          We couldn’t find a saved JSA record for this employee and document.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="px-4 pt-2"
      contentContainerStyle={{
        paddingBottom: 40,
        alignSelf: "center",
        width: "100%",
        maxWidth: isTabletLayout ? 980 : undefined,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        <View className="flex-row items-start">
          <View className="h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-blue-100 bg-blue-50">
            <MaterialCommunityIcons
              name="file-document-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View className="ml-3 flex-1 pr-1">
            <Text
              numberOfLines={2}
              className="mb-1 text-[16px] font-bold text-gray-900"
            >
              {jsa?.name ?? "Selected JSA"}
            </Text>

            {(!!jsa?.position || !!jsa?.department) && (
              <View className="flex-row items-center flex-wrap">
                {!!jsa?.position && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {jsa.position}
                  </Text>
                )}

                {!!jsa?.position && !!jsa?.department && (
                  <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                )}

                {!!jsa?.department && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {jsa.department}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="my-4 h-px bg-gray-100" />

        <View
          className={`${isTabletLayout ? "flex-row items-start justify-between" : ""}`}
        >
          <View className={`${isTabletLayout ? "flex-1 pr-4" : ""}`}>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color="#6B7280"
              />
              <Text className="ml-2 text-[13px] text-gray-500">
                Assigned to
              </Text>
            </View>

            <Text className="mt-2 text-[16px] font-semibold text-gray-900">
              {employee?.employee_name ??
                employeeJsa?.employeeName ??
                "Selected employee"}
            </Text>

            {(!!employee?.position || !!employee?.department) && (
              <View className="mt-1 flex-row items-center flex-wrap">
                {!!employee?.position && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {employee.position}
                  </Text>
                )}

                {!!employee?.position && !!employee?.department && (
                  <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                )}

                {!!employee?.department && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {employee.department}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View
            className={`mt-4 ${isTabletLayout ? "mt-0 items-end justify-start" : ""}`}
          >
            <View className="rounded-full bg-emerald-100 px-3 py-1.5 self-start">
              <Text className="text-[12px] font-semibold capitalize text-emerald-700">
                {employeeJsa?.status
                  ? String(employeeJsa.status).replaceAll("_", " ")
                  : "completed"}
              </Text>
            </View>

            {!!employeeJsa?.completedAt && (
              <Text className="mt-2 text-[12px] font-medium text-gray-500">
                Completed{" "}
                {new Date(employeeJsa.completedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <View className="mt-4 rounded-[18px] bg-gray-50 px-4 py-3">
          <Text className="text-[12px] font-medium uppercase tracking-[0.4px] text-gray-500">
            Assigned by
          </Text>

          <View className="mt-2 flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${assignedByAvatar.bg}`}
            >
              <Text
                className={`text-[12px] font-bold tracking-[0.4px] ${assignedByAvatar.text}`}
              >
                {assignedByAvatar.initials || "NA"}
              </Text>
            </View>

            <Text className="ml-3 flex-1 text-[14px] font-semibold text-gray-900">
              {assignedByName}
            </Text>
          </View>
        </View>
      </View>

      <View
        className={`mt-4 ${isTabletLayout ? "flex-row flex-wrap justify-between" : "gap-3"} pb-6`}
      >
        {questions.map((question: any, index: number) => {
          const questionText = question?.question ?? "";
          const selected = responses[questionText];
          const options = getQuestionOptions(question);

          return (
            <View
              key={question?.order ?? index}
              className={`rounded-[20px] border border-gray-200 bg-white px-4 py-4 ${
                isTabletLayout ? "mb-4 w-[48.7%]" : ""
              }`}
            >
              <View className="mb-3 flex-row items-start">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                  <Text className="text-[12px] font-semibold text-blue-600">
                    {index + 1}
                  </Text>
                </View>

                <Text className="flex-1 font-inter-medium text-[14px] leading-5 text-gray-900">
                  {questionText}
                </Text>
              </View>

              <View className="flex-row gap-2">
                {options.map((option) => {
                  const isSelected = selected === option;

                  return (
                    <View key={option} className="flex-1">
                      <View
                        className={`min-h-[48px] flex-row items-center justify-center rounded-[16px] border px-3 ${
                          isSelected
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <Text
                          className={`text-center text-[14px] font-medium ${
                            isSelected ? "text-blue-700" : "text-gray-700"
                          }`}
                        >
                          {option}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      <View className={`${isTabletLayout ? "flex-row justify-between" : ""}`}>
        {SIGNATURE_FIELDS.map((sig) => {
          const stored = formData[sig.key];
          const previewSource = makePreview(stored);
          const label =
            sig.key === "employeeSignature"
              ? employee?.employee_name
              : assignedByName;

          return (
            <View
              key={sig.key}
              className={`mb-5 ${isTabletLayout ? "w-[49%]" : ""}`}
            >
              <Text className="mb-2 text-base font-medium text-gray-700">
                {label} Signature
              </Text>

              <View className="items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-4 py-3 min-h-[92px]">
                {previewSource ? (
                  <Image
                    source={{ uri: previewSource }}
                    className="h-16 w-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-500">No signature available</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-4 rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        <View className="flex-row items-center">
          <View className="h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-blue-50">
            <MaterialCommunityIcons
              name="file-document-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-gray-900">
              JSA Summary
            </Text>
            <Text className="mt-0.5 text-[13px] text-gray-500">
              View as PDF document
            </Text>
          </View>

          <SinglePressTouchable
            activeOpacity={0.85}
            onPress={() => onViewPdf?.(employeeJsa)}
          >
            <View className="rounded-full bg-blue-100 px-3 py-2">
              <Text className="text-[12px] font-semibold text-blue-700">
                View PDF
              </Text>
            </View>
          </SinglePressTouchable>
        </View>
      </View>
    </ScrollView>
  );
};

export default ViewCompletedJsa;
