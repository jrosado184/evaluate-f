import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftButton from "@/components/LeftButton";
import { Text, View } from "react-native";

const AddLocker = () => {
  return (
    <SafeAreaView className="bg-white h-full p-6">
      <View>
        <LeftButton />
        <Text className="font-inter-regular">Add User</Text>
      </View>
    </SafeAreaView>
  );
};

export default AddLocker;
