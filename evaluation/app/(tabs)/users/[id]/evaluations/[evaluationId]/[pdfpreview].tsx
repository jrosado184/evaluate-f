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
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import { useTabBar } from "@/app/(tabs)/_layout";
import useEmployeeContext from "@/app/context/EmployeeContext";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import * as Sharing from "expo-sharing";

const PDFPreview = () => {
  const { employee } = useEmployeeContext();
  const { evaluationId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const { setIsTabBarVisible } = useTabBar();
  const [localPdfUri, setLocalPdfUri] = useState<string | null>(null);
  const employeeId = employee?._id;

  useEffect(() => {
    setIsTabBarVisible(false);

    return () => {
      setIsTabBarVisible(true);

      // Clean up the cached PDF file when leaving
      if (localPdfUri) {
        FileSystem.deleteAsync(localPdfUri, { idempotent: true })
          .then()
          .catch((err) =>
            console.error("Error deleting cached PDF file:", err)
          );
      }
    };
  }, [setIsTabBarVisible, localPdfUri]);

  useEffect(() => {
    const downloadPdf = async () => {
      if (!employeeId || !evaluationId) {
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const fileName = `evaluation_${evaluationId}.pdf`;
        const localUri = FileSystem.cacheDirectory + fileName;

        const downloadResumable = FileSystem.createDownloadResumable(
          `${baseUrl}/generated-evaluation?employeeId=${employeeId}&evaluationId=${evaluationId}`,
          localUri,
          {
            headers: { Authorization: token || "" },
          }
        );

        const { uri }: any = await downloadResumable.downloadAsync();
        setLocalPdfUri(uri);
      } catch (error) {
        console.error("Error downloading PDF:", error);
        Alert.alert("Error", "Could not download PDF.");
      } finally {
        setLoading(false);
      }
    };

    downloadPdf();
  }, [employeeId, evaluationId]);

  const handleDownloadToFiles = async () => {
    if (!localPdfUri) {
      Alert.alert("No file", "PDF not yet generated.");
      return;
    }

    try {
      await FileSystem.getContentUriAsync(localPdfUri).then(async (uri) => {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save or share your evaluation PDF",
        });
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Download failed", "Could not save or share the PDF.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
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
        <TouchableOpacity onPress={handleDownloadToFiles}>
          <Icon name="download" size={24} color="#1a237e" />
        </TouchableOpacity>
      </View>

      {/* Loading / WebView / Fallback */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={{ marginTop: 8, color: "#666" }}>Loading PDF…</Text>
        </View>
      ) : localPdfUri ? (
        <WebView
          source={{ uri: localPdfUri }}
          style={{ flex: 1 }}
          originWhitelist={["*"]}
          javaScriptEnabled
          allowFileAccess
          scalesPageToFit
          startInLoadingState
          renderLoading={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#1a237e" />
              <Text style={{ marginTop: 8, color: "#666" }}>
                Loading PDF preview...
              </Text>
            </View>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#666", fontSize: 16 }}>
            PDF not available.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PDFPreview;
