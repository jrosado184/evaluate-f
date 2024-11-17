import React from "react";
import { Text, View } from "react-native";

interface TabIconTypes {
  icon: React.ReactElement;
  color: string;
  icon_name: string;
  focused?: boolean;
}

export const TabIcon: React.FC<TabIconTypes> = ({
  icon,
  icon_name,
  focused,
}: TabIconTypes) => {
  return (
    <View className="items-center w-14 justify-center gap-1">
      {React.cloneElement(icon)}
      <Text
        className={`${
          focused
            ? "font-inter-semibold text-[#323FC1]"
            : "font-inter-regular text-[#B4B4B4]"
        } text-sm`}
      >
        {icon_name}
      </Text>
    </View>
  );
};
