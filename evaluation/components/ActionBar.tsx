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
import useEmployeeContext from "@/app/context/EmployeeContext";

function ActionBar({ showActionSheet, setShowActionSheet }: any) {
  const { setSortingBy } = useEmployeeContext();

  const handlePress = (value?: any) => {
    setSortingBy(value);
    setShowActionSheet(false);
    !value && setSortingBy("Default");
  };
  return (
    <>
      <Actionsheet isOpen={showActionSheet} onClose={handlePress}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={() => handlePress("Default")}>
            <ActionsheetItemText className="font-inter-regular">
              Default
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={() => handlePress("Lockers")}>
            <ActionsheetItemText className="font-inter-regular">
              Lockers
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={() => handlePress("Unassigned")}>
            <ActionsheetItemText className="font-inter-regular">
              Unassigned
            </ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

export default ActionBar;
