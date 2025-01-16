import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ActionBar from "./ActionBar";
import SlideUpModal from "./SlideUpModal";

interface SelectInputProps {
  title: string;
  placeholder: string;
  options?: Array<{ label: string; value: string; children?: any }>;
  onSelect: (value: any) => void;
  toggleModal: any;
  setMOdalVisible: any;
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
  toggleModal,
  containerStyles,
  borderColor = "border-gray-400",
  rounded = "rounded-[0.625rem]",
  loadData,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handlePress = async () => {
    if (loadData) await loadData();
    if (toggleModal) {
      toggleModal();
    } else {
      setShowActionSheet(true);
    }
  };

  const handleSelect = (value: any) => {
    if (typeof value === "object" && value.position) {
      setSelectedValue(value.position);
      onSelect(value);
    } else {
      setSelectedValue(value);
      onSelect(value);
    }
    setShowActionSheet(false);
  };

  return (
    <View className={`gap-y-2 ${containerStyles}`}>
      <Text className="text-base font-inter-medium">{title}</Text>
      <TouchableOpacity
        onPress={handlePress}
        className={`border ${borderColor} w-full h-16 flex-row items-center ${rounded}`}
      >
        <Text
          className={`pl-4 font-inter-semibold flex-1 ${
            selectedValue !== null ? "text-neutral-700" : "text-[#929292]"
          }`}
        >
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>
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
