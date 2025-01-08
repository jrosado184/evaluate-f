import React from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "./ui/actionsheet";

interface ActionBarProps {
  showActionSheet: boolean;
  setShowActionsheet: (value: boolean) => void;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void; //
  style?: object;
  title: string;
}

const ActionBar: React.FC<ActionBarProps> = ({
  showActionSheet,
  setShowActionsheet,
  options,
  onSelect,
  title = "Select an Option",
  style,
}) => {
  const handlePress = (value: string) => {
    onSelect(value);
    setShowActionsheet(false);
  };

  return (
    <>
      <Actionsheet
        isOpen={showActionSheet}
        onClose={() => setShowActionsheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent
          style={{
            marginBottom: 30,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            ...style,
          }}
        >
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {title && (
            <ActionsheetItemText
              className="font-inter-bold"
              style={{ padding: 10 }}
            >
              {title}
            </ActionsheetItemText>
          )}

          {options?.map((option, index) => (
            <ActionsheetItem
              key={index}
              onPress={() => handlePress(option.value)}
            >
              <ActionsheetItemText className="font-inter-regular">
                {option.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

export default ActionBar;
