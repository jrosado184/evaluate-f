// components/ActionBar.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "./ui/actionsheet";
import {
  FlatList,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";

export interface TreeNode {
  label: string;
  value?: any;
  children?: TreeNode[] | any;
  id?: string;
  __k?: string;
}

interface ActionBarProps {
  showActionSheet: boolean;
  setShowActionsheet: (value: boolean) => void;
  options: TreeNode[];
  onSelect: (value: any) => void;
  style?: object;
  title?: string;

  // search + pagination
  searchable?: boolean;
  query?: string;
  onSearchChange?: (text: string) => void;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  showActionSheet,
  setShowActionsheet,
  options,
  onSelect,
  title = "Select an Option",
  style,

  searchable = true,
  query = "",
  onSearchChange,
  loadMore,
  hasMore = false,
  isLoading = false,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  const findOptionsAtLevel = (path: string[], root: TreeNode[]): TreeNode[] => {
    return (path || []).reduce<TreeNode[]>((level, label) => {
      const found = level.find((n) => n.label === label);
      return found?.children && Array.isArray(found.children)
        ? found.children
        : [];
    }, root);
  };

  const currentOptions = useMemo<TreeNode[]>(
    () => findOptionsAtLevel(breadcrumbs, options),
    [breadcrumbs, options]
  );

  useEffect(() => {
    if (showActionSheet) setBreadcrumbs([]);
  }, [showActionSheet]);

  const handleSelect = (node: TreeNode) => {
    if (Array.isArray(node.children) && node.children.length > 0) {
      setBreadcrumbs((prev) => [...prev, node.label]);
      return;
    }
    onSelect(node);
    setShowActionsheet(false);
  };

  const handleBack = () => {
    if (!breadcrumbs.length) return;
    setBreadcrumbs((prev) => prev.slice(0, -1));
  };

  const list = (currentOptions.length ? currentOptions : options) || [];
  const atRoot = breadcrumbs.length === 0;

  // Stable footer (avoid remounts/jumps)
  const Footer = () => (
    <View className="py-3 items-center">
      {isLoading ? (
        <ActivityIndicator />
      ) : hasMore && atRoot ? (
        <Text className="text-gray-500">Scroll for more…</Text>
      ) : null}
    </View>
  );

  // Momentum guard for iOS double-fire
  const calledDuringMomentum = useRef(false);

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
          ...(style || {}),
        }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View
          style={{ width: "100%", paddingHorizontal: 12, paddingBottom: 8 }}
        >
          {breadcrumbs.length ? (
            <SinglePressTouchable
              onPress={handleBack}
              className="flex-row items-center"
            >
              <Icon name="chevron-left" size={20} />
              <Text className="text-[1rem]">Back</Text>
            </SinglePressTouchable>
          ) : (
            title && (
              <Text className="font-inter-bold text-[1rem]">{`Select ${title}`}</Text>
            )
          )}
          {breadcrumbs.length > 0 && (
            <Text className="text-xs text-gray-500 mt-1">
              {breadcrumbs.join(" / ")}
            </Text>
          )}

          {atRoot && searchable && typeof onSearchChange === "function" && (
            <TextInput
              value={query}
              onChangeText={onSearchChange}
              placeholder="Search…"
              className="border border-gray-300 rounded-xl px-3 h-12 mt-3"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              blurOnSubmit={true}
              returnKeyType="search"
            />
          )}
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) =>
            String(
              item.__k ??
                item.id ??
                item.value ??
                `${item.label}|${item?.children?.dept_code ?? ""}|${
                  item?.children?.matching_task_codes?.[0] ?? ""
                }`
            )
          }
          renderItem={({ item }) => (
            <ActionsheetItem onPress={() => handleSelect(item)}>
              <ActionsheetItemText className="font-inter-regular text-[1rem] p-1">
                {item.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          )}
          style={{ width: "100%", maxHeight: 320 }}
          removeClippedSubviews={false}
          maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
          onMomentumScrollBegin={() => {
            calledDuringMomentum.current = false;
          }}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (!atRoot || !hasMore || isLoading) return;
            if (calledDuringMomentum.current) return;
            calledDuringMomentum.current = true;
            loadMore?.();
          }}
          ListFooterComponent={Footer}
          initialNumToRender={20}
          windowSize={8}
        />
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ActionBar;
