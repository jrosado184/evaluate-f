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
 * Expected options shape (tree):
 * [{
 *   label: "Department A",
 *   value: "deptA",
 *   children: [
 *     { label: "Job 1", value: "job1", department: "Department A" },
 *     { label: "Job 2", value: "job2", department: "Department A" }
 *   ]
 * }]
 */
export interface TreeNode {
  label: string;
  value?: any;
  department?: string;
  children?: TreeNode[];
}

interface ActionBarProps {
  showActionSheet: boolean;
  setShowActionsheet: (value: boolean) => void;
  options: TreeNode[]; // hierarchical data
  onSelect: (value: any) => void; // leaf -> value OR { position, department }
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

  // Walk the tree using the breadcrumb labels.
  const findOptionsAtLevel = (path: string[], root: TreeNode[]): TreeNode[] => {
    return (path || []).reduce<TreeNode[]>((level, label) => {
      const found = level.find((n) => n.label === label);
      return found?.children ?? [];
    }, root);
  };

  // Current list to render for the active level.
  const currentOptions = useMemo<TreeNode[]>(
    () => findOptionsAtLevel(breadcrumbs, options),
    [breadcrumbs, options]
  );

  // Reset to root each time the sheet opens or options change.
  useEffect(() => {
    if (showActionSheet) {
      setBreadcrumbs([]);
    }
  }, [showActionSheet, options]);

  const handleSelect = (node: TreeNode) => {
    // If this node has children, drill down.
    if (node.children && node.children.length > 0) {
      setBreadcrumbs((prev) => [...prev, node.label]);
      return;
    }
    // Leaf selected: emit standardized value and close.
    const selectedValue =
      node.department != null
        ? { position: node.value, department: node.department }
        : node.value;
    onSelect(selectedValue);
    setShowActionsheet(false);
  };

  const handleBack = () => {
    if (breadcrumbs.length === 0) return;
    const next = breadcrumbs.slice(0, -1);
    setBreadcrumbs(next);
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
          ...(style || {}),
        }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {/* Header */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 12,
            paddingBottom: 8,
          }}
        >
          {breadcrumbs.length > 0 ? (
            <SinglePressTouchable
              onPress={handleBack}
              className="flex-row items-center"
            >
              <Icon name="chevron-left" size={20} />
              <Text className="text-[1rem]">Back</Text>
            </SinglePressTouchable>
          ) : (
            title && (
              <Text className="font-inter-bold text-[1rem]">
                {`Select ${title}`}
              </Text>
            )
          )}

          {/* Optional breadcrumb trail */}
          {breadcrumbs.length > 0 && (
            <Text className="text-xs text-gray-500 mt-1">{breadcrumbs}</Text>
          )}
        </View>

        <ScrollView className="h-48 w-full">
          {(currentOptions.length ? currentOptions : options).map(
            (option, index) => (
              <ActionsheetItem
                key={`${option.label}-${index}`}
                onPress={() => handleSelect(option)}
              >
                <ActionsheetItemText className="font-inter-regular text-[1rem] p-1">
                  {option.label}
                </ActionsheetItemText>
              </ActionsheetItem>
            )
          )}
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ActionBar;
