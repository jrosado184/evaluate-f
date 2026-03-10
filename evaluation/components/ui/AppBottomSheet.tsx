import React, { forwardRef, useCallback } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import SinglePressTouchable from "@/app/utils/SinglePress";

type AppBottomSheetProps = {
  snapPoints: Array<string | number>;
  title?: string;
  iconName?: string;
  enablePanDownToClose?: boolean;
  onHeaderPress?: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  scroll?: boolean;

  showHeader?: boolean;
  headerRight?: React.ReactNode;

  backgroundStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;

  backdropPressBehavior?: "none" | "close" | "collapse" | number;
} & Partial<
  Pick<
    BottomSheetModalProps,
    | "index"
    | "enableDynamicSizing"
    | "keyboardBehavior"
    | "keyboardBlurBehavior"
    | "handleIndicatorStyle"
    | "handleStyle"
  >
>;

const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  (
    {
      snapPoints,
      title,
      iconName = "x",
      enablePanDownToClose = true,
      onHeaderPress,
      onDismiss,
      children,
      scroll = true,
      showHeader = true,
      headerRight,
      backgroundStyle,
      contentContainerStyle,
      titleStyle,
      backdropPressBehavior = "close",
      index = 0,
      enableDynamicSizing = false,
      keyboardBehavior = "interactive",
      keyboardBlurBehavior = "restore",
      handleIndicatorStyle,
      handleStyle,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={backdropPressBehavior}
        />
      ),
      [backdropPressBehavior],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={enableDynamicSizing}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        backdropComponent={renderBackdrop}
        topInset={insets.top}
        onDismiss={onDismiss}
        backgroundStyle={[styles.sheetBg, backgroundStyle]}
        handleIndicatorStyle={[styles.handle, handleIndicatorStyle]}
        handleStyle={[styles.handleWrap, handleStyle]}
      >
        <View style={styles.container}>
          {showHeader && (
            <View style={styles.sheetHeader}>
              <View style={styles.headerLeft}>
                {onHeaderPress ? (
                  <SinglePressTouchable
                    onPress={onHeaderPress}
                    className="mr-4"
                  >
                    <Icon name={iconName as any} size={24} color="#111827" />
                  </SinglePressTouchable>
                ) : null}

                {!!title && (
                  <Text
                    numberOfLines={1}
                    style={[styles.sheetTitle, titleStyle]}
                  >
                    {title}
                  </Text>
                )}
              </View>

              {headerRight ? <View>{headerRight}</View> : null}
            </View>
          )}

          {scroll ? (
            <BottomSheetScrollView
              style={styles.body}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.scrollContentContainer,
                contentContainerStyle,
              ]}
            >
              {children}
            </BottomSheetScrollView>
          ) : (
            <View style={[styles.body, contentContainerStyle]}>{children}</View>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetBg: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  handle: {
    width: 44,
  },
  handleWrap: {
    paddingTop: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    minHeight: 48,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});

export default AppBottomSheet;
