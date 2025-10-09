// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "./ui/actionsheet";
import { ScrollView, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";

/**
 * We support EITHER flat options OR hierarchical (with children).
 * For our jobs list we use FLAT options: { label, value, children?: {dept_name, dept_code, task_code} }
 */
export interface TreeNode {
  label: string;
  value?: any;
  children?: TreeNode[] | any; // allow arbitrary payload (we keep it intact)
}

interface ActionBarProps {
  showActionSheet: boolean;
  setShowActionsheet: (value: boolean) => void;
  options: TreeNode[];
  onSelect: (value: any) => void; // we return the FULL node untouched
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
  }, [showActionSheet, options]);

  const handleSelect = (node: TreeNode) => {
    // If node has array children, drill down; else return FULL node unchanged
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
        </View>

        <ScrollView className="h-48 w-full">
          {list.map((option, index) => (
            <ActionsheetItem
              key={`${option.label}-${index}`}
              onPress={() => handleSelect(option)}
            >
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
