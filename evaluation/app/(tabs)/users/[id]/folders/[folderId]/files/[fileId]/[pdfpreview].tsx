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
import { useTabBar } from "@/app/(tabs)/_layout";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const PDFPreview = () => {
  const { employee } = useEmployeeContext();
  const { fileId, folderId } = useLocalSearchParams();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setIsTabBarVisible } = useTabBar();
  const employeeId = employee?._id;

  useEffect(() => {
    setIsTabBarVisible(false);
    return () => setIsTabBarVisible(true);
  }, [setIsTabBarVisible]);

  useEffect(() => {
    const fetchFilledPDF = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const { data } = await axios.post(
          `${baseUrl}/generated-evaluation`,
          { fileId, employeeId, folderId },
          { headers: { Authorization: token || "" } }
        );
        if (data?.fileUrl) {
          setFileUrl(baseUrl + data.fileUrl);
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

    if (employeeId && fileId && folderId) fetchFilledPDF();
  }, [employeeId, fileId, folderId]);

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const fileName = `evaluation_${fileId}.pdf`;
      const localUri = FileSystem.cacheDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(fileUrl, localUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share your evaluation PDF",
        });
      } else {
        Alert.alert("Can't share", "Sharing isn't available on this device.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Download failed", "Could not download or share the PDF.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <TouchableOpacity onPress={router.back}>
          <Icon name="chevron-left" size={28} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>PDF Preview</Text>
        <TouchableOpacity onPress={handleDownload}>
          <Icon name="download" size={24} color="#1a237e" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={{ marginTop: 8, color: "#666" }}>Generating PDF…</Text>
        </View>
      )}

      {!loading && fileUrl && (
        <WebView
          originWhitelist={["*"]}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          javaScriptEnabled
          source={{ uri: fileUrl }}
          style={{ flex: 1 }}
        />
      )}
    </SafeAreaView>
  );
};

export default PDFPreview;
