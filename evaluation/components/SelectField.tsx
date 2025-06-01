import React from "react";
import { View, Text } from "react-native";
import ActionBar from "./ActionBar";
import useSelect from "@/hooks/useSelect";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface SelectInputProps {
  title: string;
  placeholder: string;
  options?: Array<{ label: string; value: string; children?: any }>;
  onSelect?: (value: any) => void;
  selectedValue: any;
  toggleModal?: any;
  containerStyles?: string;
  borderColor?: string;
  rounded?: string;
  loadData?: any;
}

const SelectInput: React.FC<SelectInputProps> = ({
  title,
  placeholder,
  options = [],
  onSelect,
  selectedValue,
  toggleModal,
  containerStyles,
  borderColor = "border-gray-400",
  rounded = "rounded-[0.625rem]",
  loadData,
}) => {
  const { handlePress, handleSelect, showActionSheet, setShowActionSheet } =
    useSelect(loadData, toggleModal, onSelect);

  return (
    <View className={`gap-y-2 ${containerStyles}`}>
      <Text className="text-base font-inter-regular">{title}</Text>
      <SinglePressTouchable
        onPress={handlePress}
        className={`border ${borderColor} w-full h-16 flex-row items-center ${rounded}`}
      >
        <Text
          className={`pl-4 font-inter-regular flex-1 ${
            selectedValue ? "text-neutral-700" : "text-[#929292]"
          }`}
        >
          {selectedValue || placeholder}
        </Text>
      </SinglePressTouchable>
      <ActionBar
        showActionSheet={showActionSheet}
        setShowActionsheet={setShowActionSheet}
        options={options}
        onSelect={handleSelect}
        title={title}
      />
    </View>
  );
};

export default SelectInput;
