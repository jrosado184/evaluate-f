// app/components/ui/AppBottomSheet.tsx
// @ts-nocheck
import React, { forwardRef, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import SinglePressTouchable from "@/app/utils/SinglePress";

type Props = {
  snapPoints: any[];
  title: string;
  iconName: string;
  enablePanDownToClose?: boolean;
  onHeaderPress: () => void;
  onDismiss?: () => void;

  children: React.ReactNode;

  // Optional: allow turning off internal scrolling if your child handles it
  scroll?: boolean;
};

const AppBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    {
      snapPoints,
      title,
      iconName,
      enablePanDownToClose = true,
      onHeaderPress,
      onDismiss,
      children,
      scroll = true,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        topInset={insets.top}
        onDismiss={onDismiss}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        handleStyle={{ paddingTop: 6 }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.sheetHeader}>
            <SinglePressTouchable onPress={onHeaderPress} className="mr-4">
              <Icon name={iconName as any} size={26} color="#1a237e" />
            </SinglePressTouchable>
            <Text style={styles.sheetTitle}>{title}</Text>
          </View>

          {scroll ? (
            <BottomSheetScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {children}
            </BottomSheetScrollView>
          ) : (
            <View style={{ flex: 1 }}>{children}</View>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  handle: { width: 44 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
});

export default AppBottomSheet;
