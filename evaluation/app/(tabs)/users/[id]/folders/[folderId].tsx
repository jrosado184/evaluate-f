import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

const FolderDetails = () => {
  const { id: userId, folderId } = useLocalSearchParams();

  return (
    <SafeAreaView className="p-6 bg-neutral-50 h-full">
      <TouchableOpacity
        onPress={router.back}
        className="flex-row items-center h-10"
      >
        <Icon name="chevron-left" size={29} />
        <Text className="text-[1.3rem]">Back</Text>
      </TouchableOpacity>
      <Text>User ID: {userId}</Text>
      <Text>Folder ID: {folderId}</Text>
    </SafeAreaView>
  );
};

export default FolderDetails;
