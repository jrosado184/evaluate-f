import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import ActionBar from "./ActionBar";
import useEmployeeContext from "@/app/context/EmployeeContext";

const Sort = () => {
  const [showActionsheet, setShowActionsheet] = React.useState(false);

  const { sortingBy } = useEmployeeContext();

  return (
    <View className="gap-2 flex-row items-center">
      <Text className="text-neutral-500 font-inter-regular">Sort By</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowActionsheet(true)}
        className="border border-neutral-400 w-24 h-8 rounded-lg mr-2 justify-center items-center z-10"
      >
        <Text className="font-inter-regular text-sm">{sortingBy}</Text>
        <ActionBar
          showActionSheet={showActionsheet}
          setShowActionSheet={setShowActionsheet}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Sort;
