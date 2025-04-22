import React, { useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  View,
  Dimensions,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  folderName: string;
  setFolderName: (name: string) => void;
}

const EditFolderModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  folderName,
  setFolderName,
}) => {
  const inputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Overlay with fade */}
        <Animated.View
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        />

        {/* Modal content */}
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
            Edit Folder Name
          </Text>

          <TextInput
            ref={inputRef}
            placeholder="Folder name"
            value={folderName}
            onChangeText={setFolderName}
            className="border border-neutral-300 rounded-lg px-4 py-3 text-base font-inter-regular mb-6"
            placeholderTextColor="#999"
          />

          <View className="flex-row justify-end gap-5">
            <TouchableOpacity onPress={onClose} className="justify-center">
              <Text className="text-base text-neutral-500 font-inter-regular">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSubmit(folderName)}
              className="bg-blue-600 px-5 py-2 rounded-lg justify-center"
            >
              <Text className="text-white font-inter-semibold text-base">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditFolderModal;
