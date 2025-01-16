import React, { useEffect, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "./ui/actionsheet";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface ActionBarProps {
  showActionSheet: boolean;
  setShowActionsheet: (value: boolean) => void;
  options: Array<any>; // Hierarchical data
  onSelect: (value: any) => void;
  style?: object;
  title?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({
  showActionSheet,
  setShowActionsheet,
  options,
  onSelect,
  title = "Select an Option",
  style,
}) => {
  const [currentOptions, setCurrentOptions] = useState<Array<any>>(options);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<string>>([]);

  useEffect(() => {
    // Synchronize currentOptions with options prop when it changes
    setCurrentOptions(options);
  }, [options]);

  const handleSelect = (option: any) => {
    if (option.children) {
      setCurrentOptions(option.children);
      setBreadcrumbs((prev) => [...prev, option.label]);
    } else {
      const selectedValue = option.department
        ? { position: option.value, department: option.department }
        : option.value;
      onSelect(selectedValue);
      setShowActionsheet(false);
    }
  };

  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      setBreadcrumbs((prev) => prev.slice(0, -1));
      setCurrentOptions(findOptionsAtLevel(breadcrumbs.slice(0, -1), options));
    }
  };

  const findOptionsAtLevel = (
    path: Array<string>,
    options: Array<any>
  ): Array<any> => {
    return path.reduce((currentLevelOptions, label) => {
      const selectedOption = currentLevelOptions.find(
        (opt) => opt.label === label
      );
      return selectedOption?.children || [];
    }, options);
  };

  return (
    <Actionsheet
      isOpen={showActionSheet}
      onClose={() => setShowActionsheet(false)}
    >
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          marginBottom: 80,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          ...style,
        }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {breadcrumbs.length > 0 && (
          <ActionsheetItemText
            className="font-inter-regular w-full"
            style={{ padding: 10 }}
            onPress={handleBack}
          >
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
            >
              <Icon name="chevron-left" size={20} />
              <Text className="text-[1rem]">Back</Text>
            </TouchableOpacity>
          </ActionsheetItemText>
        )}

        {title && breadcrumbs.length === 0 && (
          <ActionsheetItemText
            className="font-inter-bold text-[1rem]"
            style={{ paddingBottom: 5 }}
          >
            {`Select ${title}`}
          </ActionsheetItemText>
        )}
        <ScrollView className="h-48 w-full">
          {currentOptions?.map((option, index) => (
            <ActionsheetItem key={index} onPress={() => handleSelect(option)}>
              <ActionsheetItemText className="font-inter-regular text-[1rem] p-1">
                {option.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ActionBar;
