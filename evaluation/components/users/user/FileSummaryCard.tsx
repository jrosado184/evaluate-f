// components/employee-files/FileSummaryCard.tsx
import React from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

import SinglePressTouchable from "@/app/utils/SinglePress";
import { FileCategory, FileCategoryKey } from "./EmployeeFilesHub";

type Props = {
  categories: FileCategory[];
  onSelectCategory: (key: FileCategoryKey) => void;
};

const FileSummaryCard = ({ categories, onSelectCategory }: Props) => {
  return (
    <View className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <Text className="text-base font-semibold text-neutral-900">
        File Summary
      </Text>

      <View className="mt-4 gap-3">
        {categories.map((category) => (
          <SinglePressTouchable
            key={category.key}
            onPress={() => onSelectCategory(category.key)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-white">
                <Icon name={category.icon as any} size={17} color="#2563EB" />
              </View>

              <Text className="text-sm font-medium text-neutral-800">
                {category.title}
              </Text>
            </View>

            <Text className="text-sm font-semibold text-neutral-500">
              {category.count}
            </Text>
          </SinglePressTouchable>
        ))}
      </View>
    </View>
  );
};

export default FileSummaryCard;
