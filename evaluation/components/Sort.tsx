// components/Sort.tsx
import { View, Text } from "react-native";
import React, { useState } from "react";
import ActionBar, { TreeNode } from "./ActionBar";
import useEmployeeContext from "@/app/context/EmployeeContext";
import SinglePressTouchable from "@/app/utils/SinglePress";

const Sort = () => {
  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const { sortingBy, setSortingBy } = useEmployeeContext();
  const [selectedSort, setSelectedSort] = useState<string>("Default");

  const sortOptions: TreeNode[] = [
    { label: "Default", value: "Default" },
    { label: "Lockers", value: "Lockers" },
  ];

  const handleSortSelect = (value: string) => {
    setSelectedSort(value);
    setSortingBy(value);
  };

  return (
    <View className="gap-2 flex-row items-center">
      <Text className="text-neutral-500 font-inter-regular">Sort By</Text>

      <SinglePressTouchable
        activeOpacity={0.8}
        onPress={() => setShowActionsheet(true)}
        className="border border-neutral-400 w-24 h-8 rounded-lg mr-2 justify-center items-center z-10"
      >
        <Text className="font-inter-regular text-sm">
          {sortingBy || selectedSort}
        </Text>
      </SinglePressTouchable>

      <ActionBar
        showActionSheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        options={sortOptions}
        onSelect={handleSortSelect} // gets just the value
        selectMode="value" // <-- this is the key
        title="Sort By"
        searchable={false} // no need for search here
      />
    </View>
  );
};

export default Sort;
