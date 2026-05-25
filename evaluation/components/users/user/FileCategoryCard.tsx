import React from "react";

import { Text, View } from "react-native";

import Icon from "react-native-vector-icons/Feather";

import SinglePressTouchable from "@/app/utils/SinglePress";

import { FileCategory } from "./EmployeeFilesHub";

type Props = {
  category: FileCategory;

  isActive: boolean;

  isTablet?: boolean;

  onPress: () => void;
};

const FileCategoryCard = ({
  category,
  isActive,
  isTablet = false,
  onPress,
}: Props) => {
  return (
    <SinglePressTouchable
      onPress={onPress}
      className={[
        isTablet ? "w-full min-h-[86px]" : "w-36",

        "border p-3 rounded-xl",

        isActive ? "border-blue-600 bg-blue-50" : "border-neutral-200 bg-white",
      ].join(" ")}
    >
      <View
        className={[
          "mb-2 h-9 w-9 items-center justify-center rounded-lg",

          isActive ? "bg-blue-100" : "bg-neutral-100",
        ].join(" ")}
      >
        <Icon
          name={category.icon as any}
          size={18}
          color={isActive ? "#2563EB" : "#6B7280"}
        />
      </View>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className={[
          "text-sm font-semibold",

          isActive ? "text-blue-700" : "text-neutral-900",
        ].join(" ")}
      >
        {category.title}
      </Text>

      <Text className="mt-1 text-xs text-neutral-500"></Text>
    </SinglePressTouchable>
  );
};

export default FileCategoryCard;
