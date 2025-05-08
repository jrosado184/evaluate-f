import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";
import useEmployeeContext from "@/app/context/EmployeeContext";

const PDFPreview = () => {
  const { employee } = useEmployeeContext();
  const { fileId, folderId } = useLocalSearchParams();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const employeeId = employee?._id;

  useEffect(() => {
    const fetchFilledPDF = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const response = await axios.post(
          `${baseUrl}/generated-evaluation`,
          { fileId, employeeId, folderId },
          {
            headers: {
              Authorization: token || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.fileUrl) {
          setFileUrl(`${baseUrl}${response.data.fileUrl}`);
        } else {
          throw new Error("Missing fileUrl in response");
        }
      } catch (err: any) {
        console.error("PDF preview error:", err.message);
        Alert.alert("Error", "Could not load filled PDF.");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && fileId && folderId) {
      fetchFilledPDF();
    }
  }, [fileId, employeeId, folderId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={router.back}>
          <Icon name="chevron-left" size={28} />
        </TouchableOpacity>
        <Text className="text-lg font-inter-semibold">PDF Preview</Text>
        <View style={{ width: 28 }} />
      </View>

      {fileUrl ? (
        <WebView
          originWhitelist={["*"]}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          javaScriptEnabled
          source={{ uri: fileUrl }}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a237e" />
          <Text className="mt-2 text-sm text-gray-500">Generating PDF...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PDFPreview;
