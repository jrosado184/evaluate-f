import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
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

type SignatureData = {
  image: string;
  signedAt: string;
};

const QualifyScreen = () => {
  const { id, evaluationId } = useLocalSearchParams();
  const { employee } = useEmployeeContext();
  const { currentUser } = useAuthContext();
  const router = useRouter();

  const traineeName = employee?.employee_name;
  const department = employee?.department;
  const position = employee?.position;

  const [signatureType, setSignatureType] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>({
    teamMember: { image: "", signedAt: "" },
    trainer: { image: "", signedAt: "" },
    supervisor: { image: "", signedAt: "" },
    trainingSupervisor: { image: "", signedAt: "" },
    superintendent: { image: "", signedAt: "" },
  });

  const allSigned = Object.values(signatures).every((sig) => sig.image);

  const handleSignature = (base64: string) => {
    if (signatureType) {
      const now = new Date();
      const formattedDate = `${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;

      setSignatures((prev) => ({
        ...prev,
        [signatureType]: { image: base64, signedAt: formattedDate },
      }));
      setSignatureType(null);
    }
  };

  const handleMarkQualified = async () => {
    try {
      const baseUrl = await getServerIP();
      const token = await AsyncStorage.getItem("token");

      // Use the date from the final signatures
      const firstSignatureKey = Object.keys(signatures)[0];
      const qualifiedAtDate =
        signatures[firstSignatureKey]?.signedAt || new Date().toISOString();

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "final_signatures",
          data: { signatures },
        },
        {
          headers: {
            Authorization: token!,
          },
        }
      );

      // Also update the status AND add qualifiedAt
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}/status`,
        {
          status: "complete",
          qualifiedAt: qualifiedAtDate, // include qualifiedAt in the final update
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      router.replace(`/users/${id}/evaluations/${evaluationId}`);
    } catch (error) {
      console.error("Failed to mark as qualified:", error);
      Alert.alert("Error", "Failed to mark as qualified.");
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
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Icon name="chevron-left" size={28} color="#1a237e" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-gray-900">
            Final Qualification
          </Text>
        </View>

        {/* Info */}
        <View className="mb-8 space-y-2">
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Name:</Text> {traineeName}
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
              <TouchableOpacity
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
              </TouchableOpacity>
              {signedAt && (
                <Text className="text-xs text-gray-400 mt-1">
                  Signed at: {signedAt}
                </Text>
              )}
            </View>
          ))}
        </View>

        {allSigned && (
          <TouchableOpacity
            onPress={handleMarkQualified}
            className="bg-[#1a237e] mt-10 py-4 rounded-md items-center"
          >
            <Text className="text-white text-lg font-semibold">
              Mark as Qualified
            </Text>
          </TouchableOpacity>
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
