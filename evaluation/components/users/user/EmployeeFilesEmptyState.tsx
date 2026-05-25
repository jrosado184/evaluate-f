// components/employee-files/EmployeeFilesEmptyState.tsx
import React from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const EmployeeFilesEmptyState = () => {
  return (
    <View className="items-center py-12">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-xl bg-neutral-100">
        <Icon name="folder" size={30} color="#9CA3AF" />
      </View>

      <Text className="text-base font-semibold text-neutral-700">
        No files yet.
      </Text>

      <Text className="mt-1 text-center text-sm text-neutral-500">
        Create or assign a file for this employee.
      </Text>
    </View>
  );
};

export default EmployeeFilesEmptyState;
