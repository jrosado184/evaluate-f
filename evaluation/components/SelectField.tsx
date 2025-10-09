// @ts-nocheck
import React, { useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import ActionBar from "./ActionBar";
import useSelect from "@/hooks/useSelect";
import SinglePressTouchable from "@/app/utils/SinglePress";

/**
 * Props for SelectInput
 */
interface SelectInputProps {
  title: string;
  placeholder: string;
  options?: Array<{ label: string; value: string; children?: any }>;
  onSelect?: (value: any) => void; // Returns the full selected option
  selectedValue: any;
  toggleModal?: (open: boolean) => void;
  containerStyles?: string;
  borderColor?: string;
  rounded?: string;
  loadData?: (
    query?: string
  ) => Promise<Array<{ label: string; value: string; children?: any }>>;
  searchable?: boolean; // optional: allow in-ActionBar search
}

/**
 * Lightweight SelectInput Component optimized for async dropdowns.
 * - Uses lazy loading via `useSelect`
 * - Gracefully handles loading, empty, and error states
 * - Compatible with ActionBar + backend `/options` endpoints
 */
const SelectInput: React.FC<SelectInputProps> = ({
  title,
  placeholder,
  options = [],
  onSelect,
  selectedValue,
  toggleModal,
  containerStyles = "",
  borderColor = "border-gray-400",
  rounded = "rounded-[0.625rem]",
  loadData,
  searchable = true,
}) => {
  const {
    handlePress,
    handleSelect,
    showActionSheet,
    setShowActionSheet,
    options: lazyOptions,
    isLoading,
    error,
  } = useSelect(loadData, toggleModal, onSelect);

  // useMemo to avoid rerender thrashing
  const displayOptions = useMemo(() => {
    if (isLoading) return [{ label: "Loading…", value: "__loading__" }];
    if (error)
      return [{ label: error || "Error loading options", value: "__error__" }];
    const opts = lazyOptions?.length ? lazyOptions : options;
    return opts.length
      ? opts
      : [{ label: "No options found", value: "__empty__" }];
  }, [isLoading, error, lazyOptions, options]);

  const displayLabel = useMemo(() => {
    if (!selectedValue) return placeholder;
    if (typeof selectedValue === "string") return selectedValue;
    if (selectedValue?.label) return selectedValue.label;
    return String(selectedValue);
  }, [selectedValue, placeholder]);

  return (
    <View className={`gap-y-2 ${containerStyles}`}>
      {/* Title */}
      <Text className="text-base font-inter-regular">{title}</Text>

      {/* Touchable Input */}
      <SinglePressTouchable
        onPress={handlePress}
        className={`border ${borderColor} w-full h-16 flex-row items-center ${rounded} px-4`}
      >
        <View className="flex-1 flex-row items-center">
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#888"
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            numberOfLines={1}
            className={`font-inter-regular flex-1 ${
              selectedValue ? "text-neutral-800" : "text-[#929292]"
            }`}
          >
            {displayLabel}
          </Text>
        </View>
      </SinglePressTouchable>

      {/* Dropdown ActionSheet */}
      <ActionBar
        title={title}
        showActionSheet={showActionSheet}
        setShowActionsheet={setShowActionSheet}
        options={displayOptions}
        searchable={searchable}
        onSelect={(opt: any) => {
          if (
            !opt ||
            ["__loading__", "__empty__", "__error__"].includes(opt.value)
          )
            return;
          handleSelect(opt); // Pass full object
        }}
      />
    </View>
  );
};

export default SelectInput;
