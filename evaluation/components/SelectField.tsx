// components/SelectField.tsx
// @ts-nocheck
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import ActionBar from "./ActionBar";
import useSelect from "@/hooks/useSelect";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface SelectFieldProps {
  title: string;
  placeholder: string;
  options?: any;
  onSelect?: (value: any) => void;
  selectedValue: any;

  // Use this ONLY for static mode, or when openExternally=true
  toggleModal?: (open: boolean) => void;

  containerStyles?: string;
  borderColor?: string;
  rounded?: string;

  // Async loader (switches to async mode if provided)
  loadData?: (args?: {
    query?: string;
    page?: number;
    signal?: AbortSignal;
  }) => Promise<{
    results: Option[];
    currentPage: number;
    totalPages: number;
    total: number;
  }>;

  searchable?: boolean;

  returnOption?: boolean;

  openExternally?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
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
  searchable = false,
  returnOption = false,
  openExternally = false,
}) => {
  const isAsync = !!loadData;

  // ============ ASYNC (server) ============
  const {
    handlePress, // opens the sheet
    handleSelect, // calls onSelect + closes the sheet
    showActionSheet,
    setShowActionSheet,
    options: lazyOptions,
    isLoading,
    error,
    loadMore,
    hasMore,
    query,
    setSearch,
  } = useSelect(
    isAsync ? loadData : undefined,
    undefined, // do not bubble open/close upward in async mode
    (opt: any) => {
      const out = returnOption ? opt : opt?.value ?? opt;
      onSelect?.(out);
    }
  );

  // ============ STATIC (local) ============
  const [localQuery, setLocalQuery] = useState("");
  const [localOpen, setLocalOpen] = useState(false);

  const openStatic = useCallback(() => {
    if (openExternally) {
      toggleModal?.(true);
      return;
    }
    setLocalOpen(true);
    toggleModal?.(true);
  }, [openExternally, toggleModal]);

  const closeStatic = useCallback(() => {
    setLocalOpen(false);
    toggleModal?.(false);
  }, [toggleModal]);

  const filteredStaticOptions = useMemo(() => {
    if (!searchable || !localQuery.trim()) return options;
    const q = localQuery.toLowerCase();
    return options.filter(
      (o) =>
        String(o.label).toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q)
    );
  }, [options, searchable, localQuery]);

  // ============ COMMON DISPLAY ============
  const displayOptions: Option[] = useMemo(() => {
    if (isAsync) {
      if (error)
        return [
          { label: error || "Error loading options", value: "__error__" },
        ];
      const opts = lazyOptions?.length ? lazyOptions : options;
      return opts.length
        ? opts
        : [{ label: "No options found", value: "__empty__" }];
    }
    const opts = filteredStaticOptions;
    return opts.length
      ? opts
      : [{ label: "No options found", value: "__empty__" }];
  }, [isAsync, error, lazyOptions, options, filteredStaticOptions]);

  const displayLabel = useMemo(() => {
    if (selectedValue == null || selectedValue === "") return placeholder;
    if (typeof selectedValue === "string" || typeof selectedValue === "number")
      return String(selectedValue);
    if (selectedValue?.label) return selectedValue.label;
    return String(selectedValue);
  }, [selectedValue, placeholder]);

  const onSelectStatic = useCallback(
    (opt: any) => {
      if (!opt || ["__loading__", "__empty__", "__error__"].includes(opt.value))
        return;
      const out = returnOption ? opt : opt?.value ?? opt;
      onSelect?.(out);
      closeStatic();
    },
    [onSelect, closeStatic, returnOption]
  );

  const showSpinner = isAsync && isLoading;

  return (
    <View className={`gap-y-2 ${containerStyles}`}>
      <Text className="text-base font-inter-regular">{title}</Text>

      <SinglePressTouchable
        onPress={isAsync ? handlePress : openStatic}
        className={`border ${borderColor} w-full h-16 flex-row items-center ${rounded} px-4`}
      >
        <View className="flex-1 flex-row items-center">
          {showSpinner && (
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

      {/* Only render ActionBar if we're NOT using an external modal */}
      {!openExternally &&
        (isAsync ? (
          <ActionBar
            title={title}
            showActionSheet={showActionSheet}
            setShowActionsheet={setShowActionSheet}
            options={displayOptions}
            onSelect={(opt: any) => {
              if (
                !opt ||
                ["__loading__", "__empty__", "__error__"].includes(opt.value)
              )
                return;
              handleSelect(opt);
            }}
            searchable={searchable}
            query={query}
            onSearchChange={setSearch}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        ) : (
          <ActionBar
            title={title}
            showActionSheet={localOpen}
            setShowActionsheet={(v: boolean) =>
              v ? setLocalOpen(true) : closeStatic()
            }
            options={displayOptions}
            onSelect={onSelectStatic}
            searchable={searchable}
            query={localQuery}
            onSearchChange={setLocalQuery}
            loadMore={undefined}
            hasMore={false}
            isLoading={false}
          />
        ))}
    </View>
  );
};

export default SelectField;
