import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ActionBar from "./ActionBar";

interface SelectInputProps {
  title: string; // Title displayed above the select input
  placeholder: string; // Placeholder text for the select
  options?: Array<{ label: string; value: string }>; // List of options for the select
  onSelect: (value: string) => void; // Callback when an option is selected
  modalVisible?: boolean; // Whether a modal is visible
  onModalOpen?: () => void; // Function to trigger modal opening
  containerStyles?: string; // Optional custom styles for the container
  borderColor?: string; // Border color for the input
  rounded?: string; // Rounded border styles
}

const SelectInput: React.FC<SelectInputProps> = ({
  title,
  placeholder,
  options = [],
  onSelect,
  modalVisible = false,
  onModalOpen,
  containerStyles,
  borderColor = "border-gray-400",
  rounded = "rounded-[0.625rem]",
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handlePress = () => {
    if (modalVisible && onModalOpen) {
      onModalOpen(); // Open modal if modalVisible is true
    } else {
      setShowActionSheet(true); // Show ActionBar otherwise
    }
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    setShowActionSheet(false);
  };

  return (
    <View className={`gap-y-2 ${containerStyles}`}>
      <Text className="text-base font-inter-medium">{title}</Text>
      <TouchableOpacity
        onPress={handlePress}
        className={`border ${borderColor} w-full h-16 flex-row items-center ${rounded}`}
      >
        <Text className="pl-4 text-[#929292] font-inter-semibold flex-1">
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
