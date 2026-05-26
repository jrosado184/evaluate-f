import React, { useMemo, useState } from "react";
import { Alert, View, Text, Image, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system";

import SinglePressTouchable from "@/app/utils/SinglePress";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";
import getServerIP from "@/app/requests/NetworkAddress";
import SignatureModal from "@/components/SignatureModal";
import ViewCompletedJsa from "@/components/jsas/ViewCompletedJsa";
import {
  pickUploadedFileId,
  pickUploadedFileUrl,
  toRelativeApiPath,
  uploadJsaSignatures,
} from "@/app/helpers/signatureHelpers";

type Props = {
  jsa: any;
};

type SignatureKey = "employeeSignature" | "trainerSignature";

type SignatureRef = {
  signatureId: string | null;
  storage: "gridfs";
  signedAt: string | null;
  path: string | null;
  url: null;
};

const INITIAL_FORM_DATA = {
  employeeSignature: "",
  trainerSignature: "",
};

const SIGNATURE_FIELDS: Array<{ key: SignatureKey; label: string }> = [
  { key: "employeeSignature", label: "Employee" },
  { key: "trainerSignature", label: "Trainer" },
];

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

function getQuestionOptions(question: any) {
  return question?.type === "text"
    ? ["Myself", "My supervisor"]
    : ["Yes", "No"];
}

function buildSignatureRef({
  signatureId,
  path,
  signedAt,
}: {
  signatureId?: string | null;
  path?: string | null;
  signedAt?: string | null;
}): SignatureRef {
  return {
    signatureId: signatureId || null,
    storage: "gridfs",
    signedAt: signedAt || null,
    path: path || null,
    url: null,
  };
}

async function uploadPendingJsaSignatures({
  pendingSigs,
  baseUrl,
  token,
  employeeId,
  jsaId,
}: {
  pendingSigs: Partial<Record<SignatureKey, string>>;
  baseUrl: string;
  token: string;
  employeeId: string;
  jsaId: string;
}) {
  const hasAnyPending =
    !!pendingSigs.employeeSignature || !!pendingSigs.trainerSignature;

  if (!hasAnyPending) return null;

  const files: Record<string, any> = {};

  if (pendingSigs.employeeSignature) {
    files.employee = await dataUrlToTempFile(pendingSigs.employeeSignature, {
      name: `jsa_employee_${Date.now()}.png`,
    });
  }

  if (pendingSigs.trainerSignature) {
    files.trainer = await dataUrlToTempFile(pendingSigs.trainerSignature, {
      name: `jsa_trainer_${Date.now()}.png`,
    });
  }

  const response = await uploadJsaSignatures({
    baseUrl,
    token,
    files,
    employeeId,
    jsaId,
  });

  const roleToFormKey: Record<string, SignatureKey> = {
    employee: "employeeSignature",
    trainer: "trainerSignature",
  };

  const uploadedSignatures: Partial<Record<SignatureKey, SignatureRef>> = {};
  const uploadedPaths: Partial<Record<SignatureKey, string>> = {};
  const now = new Date().toISOString();

  for (const role of Object.keys(roleToFormKey)) {
    if (!files[role]) continue;

    const formKey = roleToFormKey[role];
    const absOrRel = pickUploadedFileUrl(response, role, [formKey]);
    const signatureId = pickUploadedFileId(response, role, [formKey]);
    const relativePath = toRelativeApiPath(absOrRel, baseUrl);

    if (!relativePath) {
      throw new Error("Upload did not return a valid signature URL.");
    }

    uploadedPaths[formKey] = relativePath;
    uploadedSignatures[formKey] = buildSignatureRef({
      signatureId: signatureId || null,
      path: relativePath,
      signedAt: now,
    });
  }

  return {
    uploadedPaths,
    uploadedSignatures,
  };
}

const JsaQuestions = ({ jsa }: Props) => {
  const { employee } = useEmployeeContext();
  const { currentUser } = useAuthContext();
  const { width } = useWindowDimensions();

  const isTabletLayout = width >= 768;

  const questions = useMemo(
    () => (Array.isArray(jsa?.questions) ? jsa.questions : []),
    [jsa?.questions],
  );

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureKey | null>(null);
  const [apiBase, setApiBase] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [pendingSigs, setPendingSigs] = useState<
    Partial<Record<SignatureKey, string>>
  >({});
  const [signatureRefs, setSignatureRefs] = useState<
    Partial<Record<SignatureKey, SignatureRef>>
  >({});
  const [completedJsa, setCompletedJsa] = useState<any | null>(null);

  const handleSelect = (questionText: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionText]: answer,
    }));
  };

  const hasAllResponses =
    questions.length === 0 ||
    Object.keys(responses).length === questions.length;

  const makePreview = (value: string) =>
    value?.startsWith("/api/") ? absFromRelative(value, apiBase) : value;

  const handleSubmit = async () => {
    if (!employee?._id || !jsa?._id) {
      Alert.alert("Error", "Missing employee or JSA.");
      return;
    }

    if (!hasAllResponses) {
      Alert.alert(
        "Incomplete",
        "Please answer all questions before submitting.",
      );
      return;
    }

    if (!pendingSigs.employeeSignature && !formData.employeeSignature) {
      Alert.alert("Missing signature", "Please add the employee signature.");
      return;
    }

    if (!pendingSigs.trainerSignature && !formData.trainerSignature) {
      Alert.alert("Missing signature", "Please add the trainer signature.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      if (!token) {
        Alert.alert("Error", "Missing auth token.");
        return;
      }

      setApiBase(baseUrl);

      let nextFormData = { ...formData };
      let nextSignatureRefs = { ...signatureRefs };

      const uploadResult = await uploadPendingJsaSignatures({
        pendingSigs,
        baseUrl,
        token,
        employeeId: String(employee._id),
        jsaId: String(jsa._id),
      });

      if (uploadResult) {
        nextFormData = {
          ...nextFormData,
          ...uploadResult.uploadedPaths,
        };

        nextSignatureRefs = {
          ...nextSignatureRefs,
          ...uploadResult.uploadedSignatures,
        };

        setPendingSigs({});
        setFormData(nextFormData);
        setSignatureRefs(nextSignatureRefs);
      }

      const now = new Date().toISOString();

      const employeeSignature =
        nextSignatureRefs.employeeSignature ||
        buildSignatureRef({
          path: nextFormData.employeeSignature,
          signedAt: now,
        });

      const trainerSignature =
        nextSignatureRefs.trainerSignature ||
        buildSignatureRef({
          path: nextFormData.trainerSignature,
          signedAt: now,
        });

      const response = await axios.post(
        `${baseUrl}/employee-jsas`,
        {
          employeeId: employee._id,
          jsaId: jsa._id,
          responses,
          assignedBy: currentUser?.name,
          status: "completed",
          completedAt: now,
          employeeSignature,
          trainerSignature,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      setCompletedJsa({
        ...(response.data || {}),
        jsa,
        employee,
        responses,
        completedAt: now,
        employeeSignature,
        trainerSignature,
      });
    } catch (error: any) {
      console.error(
        "Failed to create completed employee JSA:",
        error?.response?.data || error,
      );

      Alert.alert(
        "Error",
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save JSA",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (completedJsa) {
    return <ViewCompletedJsa completedJsa={completedJsa} />;
  }

  return (
    <>
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

          <View className={isTabletLayout ? "flex-row items-start" : ""}>
            <View className={isTabletLayout ? "flex-1 pr-4" : ""}>
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color="#6B7280"
                />

                <Text className="ml-2 text-[13px] text-gray-500">
                  Assigning to
                </Text>
              </View>

              <Text className="mt-2 text-[16px] font-semibold text-gray-900">
                {employee?.employee_name ?? "Selected employee"}
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
          </View>
        </View>

        <View
          className={`mt-4 ${
            isTabletLayout ? "flex-row flex-wrap justify-between" : "gap-3"
          } pb-6`}
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
                      <SinglePressTouchable
                        key={option}
                        activeOpacity={0.85}
                        className="flex-1"
                        onPress={() => handleSelect(questionText, option)}
                      >
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
                      </SinglePressTouchable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <View className={isTabletLayout ? "flex-row justify-between" : ""}>
          {SIGNATURE_FIELDS.map((sig) => {
            const stored = formData[sig.key];
            const previewSource = pendingSigs[sig.key] || makePreview(stored);
            const label =
              sig.key === "employeeSignature"
                ? employee?.employee_name || sig.label
                : sig.label;

            return (
              <View
                key={sig.key}
                className={`mb-5 ${isTabletLayout ? "w-[49%]" : ""}`}
              >
                <Text className="mb-2 text-base font-medium text-gray-700">
                  {label} Signature
                </Text>

                <SinglePressTouchable
                  onPress={() => setSignatureType(sig.key)}
                  className="items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-4 py-3 min-h-[92px]"
                >
                  {previewSource ? (
                    <Image
                      source={{ uri: previewSource }}
                      className="h-16 w-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <Text className="text-gray-500">Tap to sign</Text>
                  )}
                </SinglePressTouchable>
              </View>
            );
          })}
        </View>

        <View className="my-4 pb-20">
          <SinglePressTouchable
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View className="min-h-[52px] flex-row items-center justify-center rounded-[18px] bg-blue-600 px-4">
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 text-[14px] font-semibold text-white">
                    Save JSA
                  </Text>
                </>
              )}
            </View>
          </SinglePressTouchable>
        </View>
      </ScrollView>

      <SignatureModal
        visible={!!signatureType}
        onOK={(b64: string) => {
          if (!signatureType) return;

          setPendingSigs((prev) => ({
            ...prev,
            [signatureType]: b64,
          }));

          setFormData((prev) => ({
            ...prev,
            [signatureType]: b64,
          }));

          setSignatureType(null);
        }}
        onCancel={() => setSignatureType(null)}
      />
    </>
  );
};

export default JsaQuestions;
