import SinglePressTouchable from "@/app/utils/SinglePress";
import React, { useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
  folderName: string;
  setFolderName: (name: string) => void;
}

const NewFolderModal: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
  folderName,
  setFolderName,
}) => {
  const inputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);

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
      }).start();
    }
  }, [visible]);

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
          Create New Folder
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
          <SinglePressTouchable onPress={onClose} className="justify-center">
            <Text className="text-base text-neutral-500 font-inter-regular">
              Cancel
            </Text>
          </SinglePressTouchable>

          <SinglePressTouchable
            onPress={() => onCreate(folderName)}
            className="bg-blue-600 px-5 py-2 rounded-lg justify-center"
          >
            <Text className="text-white font-inter-semibold text-base">
              Create
            </Text>
          </SinglePressTouchable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default NewFolderModal;
