import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import formatISODate from "@/app/conversions/ConvertIsoDate";
import { Swipeable } from "react-native-gesture-handler";
import SuccessModal from "@/components/SuccessModal";
import useEmployeeContext from "@/app/context/EmployeeContext";

const FolderDetails = () => {
  const { id: userId, folderId } = useLocalSearchParams();
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTrigger, setToastTrigger] = useState(0);

  const translateY = useRef(new Animated.Value(400)).current;
  const openSwipeableRef = useRef<Swipeable | null>(null);

  const fileStatus = (status: string) => {
    switch (status) {
      case "not started":
        return "Not started";
      case "in_progress":
        return "In progress";
      case "complete":
        return "Complete";
      default:
        return status;
    }
  };

  const fetchFolderFiles = async () => {
    if (!userId || !folderId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.get(`${baseUrl}/employees/${userId}`, {
        headers: { Authorization: token },
      });
      const folder = res.data.folders.find((f: any) => f._id === folderId);
      if (folder) setFiles(folder.files || []);
    } catch (err: any) {
      console.error("Failed to load files:", err.message);
    }
  };

  useEffect(() => {
    fetchFolderFiles();
  }, []);

  useEffect(() => {
    if (uploadVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 400,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [uploadVisible]);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.assets?.length) {
      setSelectedFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId || !folderId) return;
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    const formData = new FormData();
    const fileToUpload: any = {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "application/pdf",
    };
    formData.append("file", fileToUpload);
    formData.append("addedBy", "Trainer");
    try {
      await axios.post(
        `${baseUrl}/employees/${userId}/folders/${folderId}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setUploadVisible(false);
      setSelectedFile(null);
      fetchFolderFiles();
    } catch (err: any) {
      console.error("Upload error:", err.message);
      Alert.alert("Upload Failed", "Could not upload the PDF.");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const previousFiles = [...files];

    Alert.alert("Delete File", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedFiles = files.filter((file) => file._id !== fileId);
          setFiles(updatedFiles); // Optimistic update
          try {
            const token = await AsyncStorage.getItem("token");
            const baseUrl = await getServerIP();
            await axios.delete(
              `${baseUrl}/employees/${userId}/folders/${folderId}/files/${fileId}`,
              { headers: { Authorization: token } }
            );
            setToastMessage("File deleted successfully");
            setToastTrigger(Date.now());
          } catch {
            setFiles(previousFiles); // Rollback on error
            Alert.alert("Error", "Failed to delete file.");
          }
        },
      },
    ]);
  };

  const handleFilePress = (file: any) => {
    if (!file || !file._id || !file.status) return;

    if (!folderId) {
      Alert.alert("Error", "Missing folderId");
      return;
    }

    const fileId = file._id;

    if (file.status === "not started") {
      router.push(
        `/users/${userId}/folders/${folderId}/files/${fileId}/edit-form?step=1`
      );
    } else {
      // in_progress or complete → go to summary screen
      router.push(`/users/${userId}/folders/${folderId}/files/${fileId}`);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    fileId: string
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 8],
      extrapolate: "clamp",
    });
    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
          height: "100%",
          marginRight: 20,
          maxHeight: 61,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => handleDeleteFile(fileId)}
          className="justify-center items-center w-20 h-full bg-red-500 rounded-r-lg"
        >
          <Text className="text-white font-inter-semibold text-sm">Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFileItem = ({ item }: any) => {
    let swipeRef: Swipeable | null = null;

    const handleSwipeableOpen = (ref: Swipeable) => {
      if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
        openSwipeableRef.current.close();
      }
      openSwipeableRef.current = ref;
    };

    return (
      <Swipeable
        ref={(ref) => (swipeRef = ref)}
        friction={2}
        overshootRight={false}
        rightThreshold={40}
        containerStyle={{ width: "100%" }}
        renderRightActions={(progress) =>
          renderRightActions(progress, item._id)
        }
        onSwipeableWillOpen={() => swipeRef && handleSwipeableOpen(swipeRef)}
      >
        <TouchableOpacity
          onPress={() => handleFilePress(item)}
          activeOpacity={0.8}
          className="w-full items-center bg-white"
        >
          <View className="w-[90vw] border border-gray-300 rounded-lg bg-white px-4 py-3 mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-2">
                <Text className="text-base font-inter-medium">{item.name}</Text>
                <Text className="text-sm text-neutral-500">
                  {`Uploaded on ${formatISODate(item.uploadedAt)}`}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  item.status === "complete" ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-xs font-inter-semibold ${
                    item.status === "complete"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {fileStatus(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView className="bg-neutral-50 h-full w-full">
      {/* Top back button */}
      <View className="p-6">
        <TouchableOpacity
          onPress={() => {
            if (files.length > 0) {
              router.push(`/users/${userId}`);
            } else {
              router.back();
            }
          }}
          className="flex-row items-center h-10"
        >
          <Icon name="chevron-left" size={29} />
          <Text className="text-[1.3rem]">Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item._id}
        renderItem={renderFileItem}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {!uploadVisible && (
        <View
          style={{
            position: "absolute",
            bottom: 120,
            right: 28,
            zIndex: 99,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setUploadVisible(true)}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#1a237e",
              justifyContent: "center",
              alignItems: "center",
              shadowOpacity: 0.2,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 2 },
              elevation: 6,
            }}
          >
            <Icon name="upload" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Modal */}
      {uploadVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="absolute inset-0 z-50"
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateY }],
              width: "90%",
              maxWidth: 400,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Text className="text-lg font-inter-semibold mb-4 text-center">
              Upload PDF File
            </Text>

            <TouchableOpacity
              onPress={pickDocument}
              className="border border-neutral-300 rounded-lg px-4 py-3 mb-5"
            >
              <Text className="text-center text-base text-blue-600">
                {selectedFile?.name || "Select PDF"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-end items-center gap-5">
              <TouchableOpacity
                onPress={() => {
                  setUploadVisible(false);
                  setSelectedFile(null);
                }}
              >
                <Text className="text-base text-neutral-500 font-inter-regular">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpload}
                disabled={!selectedFile}
                style={{
                  backgroundColor: selectedFile ? "#1a237e" : "#9ca3af",
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text className="text-white font-inter-semibold text-base">
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {/* Success Toast */}
      <View className="w-[90%] -my-20 justify-center items-center">
        <SuccessModal
          message={toastMessage}
          trigger={toastTrigger}
          clearMessage={() => setToastMessage("")}
        />
      </View>
    </SafeAreaView>
  );
};

export default FolderDetails;
