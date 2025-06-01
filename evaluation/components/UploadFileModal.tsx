import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: DocumentPicker.DocumentPickerAsset, name: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onUpload,
}) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const inputRef = useRef<TextInput>(null);

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 10);
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
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(() => {
        setFile(null);
        setFilename("");
        setLoading(false);
      });
    }
  }, [visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        setFile(result.assets[0]);
        setFilename(result.assets[0].name.replace(".pdf", ""));
      }
    } catch (err) {
      console.error("Document picker error", err);
    }
  };

  const handleSubmit = () => {
    if (!file || !filename.trim()) return;
    setLoading(true);
    onUpload(file, filename.trim());
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="absolute inset-0 z-50"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
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
          Upload PDF
        </Text>

        <SinglePressTouchable
          onPress={pickDocument}
          className="border border-blue-500 px-4 py-2 rounded-md mb-4"
        >
          <Text className="text-blue-500 text-center font-inter-regular">
            {file ? "Change File" : "Choose PDF"}
          </Text>
        </SinglePressTouchable>

        {file && (
          <Text className="text-sm mb-2 text-neutral-700 text-center">
            {file.name}
          </Text>
        )}

        <TextInput
          ref={inputRef}
          placeholder="File name"
          value={filename}
          onChangeText={setFilename}
          className="border border-neutral-300 rounded-lg px-4 py-3 text-base font-inter-regular mb-6"
          placeholderTextColor="#999"
        />

        <View className="flex-row justify-end gap-5">
          <SinglePressTouchable onPress={onClose}>
            <Text className="text-base text-neutral-500 font-inter-regular">
              Cancel
            </Text>
          </SinglePressTouchable>
          <SinglePressTouchable
            onPress={handleSubmit}
            disabled={loading || !file || !filename.trim()}
            className={`px-5 py-2 rounded-lg justify-center ${
              loading || !file || !filename.trim()
                ? "bg-blue-300"
                : "bg-blue-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-inter-semibold text-base">
                Upload
              </Text>
            )}
          </SinglePressTouchable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default UploadModal;
