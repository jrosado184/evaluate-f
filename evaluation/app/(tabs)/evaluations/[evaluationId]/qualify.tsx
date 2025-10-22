import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import SignatureModal from "@/components/SignatureModal";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import * as FileSystem from "expo-file-system";

type SignatureData = {
  image: string;
  signedAt: string;
};

const ROLE_ORDER: Array<
  | "teamMember"
  | "trainer"
  | "supervisor"
  | "trainingSupervisor"
  | "superintendent"
> = [
  "teamMember",
  "trainer",
  "supervisor",
  "trainingSupervisor",
  "superintendent",
];

// Convert base64 or dataURL into a temporary file compatible with RN FormData
async function dataUrlToRNFile(data: string, name: string) {
  const base64 = data.startsWith("data:") ? data.split(",")[1] || "" : data;
  const path = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { uri: path, name, type: "image/png" };
}

/** Upload final signatures (multipart) to /api/evaluations/:id/final-signatures using axios */
async function uploadFinalSignaturesMultipart({
  baseUrl,
  evaluationId,
  token,
  signatures,
}: {
  baseUrl: string;
  evaluationId: string;
  token: string;
  signatures: Record<string, SignatureData>;
}) {
  const fd = new FormData();

  // Must match server field names
  for (const role of ROLE_ORDER) {
    const sig = signatures[role];
    if (sig?.image) {
      const file = await dataUrlToRNFile(
        sig.image,
        `${role}_${Date.now()}.png`
      );
      // @ts-ignore - RN FormData shim
      fd.append(role, file);
      fd.append(`${role}_signedAt`, sig.signedAt || "");
    }
  }

  const url = `${baseUrl}/evaluations/${encodeURIComponent(
    evaluationId
  )}/final-signatures`;

  // Use axios with multipart
  const resp = await axios.patch(url, fd, {
    headers: {
      Authorization: token,
      "Content-Type": "multipart/form-data",
    },
  });

  return resp.data;
}

const QualifyScreen = () => {
  const { id, evaluationId, employee_name, department, position } =
    useLocalSearchParams();
  const { employee } = useEmployeeContext();
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [signatureType, setSignatureType] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>({
    teamMember: { image: "", signedAt: "" },
    trainer: { image: "", signedAt: "" },
    supervisor: { image: "", signedAt: "" },
    trainingSupervisor: { image: "", signedAt: "" },
    superintendent: { image: "", signedAt: "" },
  });

  const allSigned = Object.values(signatures).every((sig) => !!sig.image);

  const handleSignature = (base64: string) => {
    if (!signatureType) return;
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const formattedDate = `${mm}/${dd}/${yyyy}`;

    setSignatures((prev) => ({
      ...prev,
      [signatureType]: { image: base64, signedAt: formattedDate },
    }));
    setSignatureType(null);
  };

  const handleMarkQualified = async () => {
    try {
      setLoading(true);

      const baseUrl = await getServerIP();
      const token = (await AsyncStorage.getItem("token")) || "";

      await uploadFinalSignaturesMultipart({
        baseUrl,
        evaluationId: String(evaluationId),
        token,
        signatures,
      });

      const firstRoleWithDate = ROLE_ORDER.find((r) => signatures[r]?.signedAt);
      const qualifiedAtDate =
        (firstRoleWithDate && signatures[firstRoleWithDate].signedAt) ||
        new Date().toISOString();

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}/status`,
        { status: "complete", qualifiedAt: qualifiedAtDate },
        { headers: { Authorization: token } }
      );

      router.replace({
        pathname: `/evaluations`,
        params: { complete: "complete" },
      });
    } catch (error: any) {
      console.error("Failed to mark as qualified:", error);
      Alert.alert("Error", error?.message || "Failed to mark as qualified.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 160 }}
        className="px-5 pt-5"
      >
        {/* Back Button */}
        <View className="flex-row items-center mb-6">
          <SinglePressTouchable onPress={() => router.back()} className="mr-3">
            <Icon name="chevron-left" size={28} color="#1a237e" />
          </SinglePressTouchable>
          <Text className="text-2xl font-semibold text-gray-900">
            Final Qualification
          </Text>
        </View>

        {/* Info */}
        <View className="mb-8 space-y-2">
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Name:</Text> {employee_name}
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Department:</Text> {department}
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Job Title:</Text> {position}
          </Text>
        </View>

        {/* Signatures */}
        <View className="gap-y-5">
          {Object.entries(signatures).map(([role, { image, signedAt }]) => (
            <View key={role}>
              <Text className="text-base font-medium text-gray-700 mb-2 capitalize">
                {role.replace(/([A-Z])/g, " $1")}
              </Text>
              <SinglePressTouchable
                onPress={() => setSignatureType(role)}
                className="border border-gray-300 bg-gray-100 rounded-md h-20 justify-center items-center overflow-hidden"
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-400">Tap to Sign</Text>
                )}
              </SinglePressTouchable>
              {signedAt ? (
                <Text className="text-xs text-gray-400 mt-1">
                  Signed at: {signedAt}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {allSigned && (
          <SinglePressTouchable
            onPress={handleMarkQualified}
            disabled={loading}
            className="mt-10 py-4 rounded-md items-center bg-emerald-600"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Mark as Qualified
              </Text>
            )}
          </SinglePressTouchable>
        )}
      </ScrollView>

      <SignatureModal
        visible={!!signatureType}
        onOK={handleSignature}
        onCancel={() => setSignatureType(null)}
      />
    </SafeAreaView>
  );
};

export default QualifyScreen;
