import React, { useMemo, useRef } from "react";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import Search from "@/components/Search";
import JsaCard from "@/components/jsas/JsaCard";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import JsaAssignmentSheetContent from "@/components/jsas/JsaAssignmentSheetContent";
import SinglePressTouchable from "@/app/utils/SinglePress";
import useJsaList from "@/hooks/useJsaList";
import useBottomSheetFlow from "@/hooks/bottom sheet/useBottomSheetFlow";
import { sheetConfig } from "@/components/jsas/config/screenConfig";

type JsaSheetView = "employeeSelection" | "AssignJSA" | "viewCompletedJsa";

type JsaSheetData = {
  jsa: any | null;
  employee: any | null;
};

const JsaScreen = () => {
  const {
    query,
    jsas,
    loading,
    searching,
    fetchingMore,
    total,
    handleSearchChange,
    getMoreData,
  } = useJsaList();

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const {
    view: sheetView,
    setView: setSheetView,
    data: sheetData,
    setData: setSheetData,
    open: openSheetFlow,
    reset: resetSheetFlow,
  } = useBottomSheetFlow<JsaSheetView, JsaSheetData>("employeeSelection");

  const selectedJsa = sheetData?.jsa ?? null;
  const selectedEmployee = sheetData?.employee ?? null;

  const openAssignSheet = (jsa: any) => {
    openSheetFlow(
      {
        jsa,
        employee: null,
      },
      "employeeSelection",
    );
    sheetRef.current?.present();
  };

  const closeAssignSheet = () => {
    sheetRef.current?.dismiss();
  };

  const handleDismiss = () => {
    resetSheetFlow();
  };

  const currentSheet = sheetConfig[sheetView];

  return (
    <>
      <SafeAreaView className="flex-1 p-6 bg-white">
        <View className="flex-row h-7 justify-between items-center w-full">
          <Text className="pl-2 font-inter-regular text-[1.6rem]">
            JSA&apos;s
          </Text>
        </View>

        <Search
          label="jsa's"
          total={total}
          query={query}
          setQuery={handleSearchChange}
        />

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" />
          </View>
        ) : jsas.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-regular text-neutral-500">
              No JSA&apos;s found
            </Text>
          </View>
        ) : (
          <FlatList
            data={jsas}
            keyExtractor={(item, index) =>
              item?._id?.toString?.() ?? `${index}`
            }
            contentContainerStyle={{ paddingBottom: 100, gap: 4 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={getMoreData}
            onEndReachedThreshold={0.35}
            renderItem={({ item }) => (
              <SinglePressTouchable onPress={() => openAssignSheet(item)}>
                <JsaCard
                  name={item?.name}
                  position={item?.position}
                  department={item?.department}
                  questionsCount={item?.questions?.length}
                />
              </SinglePressTouchable>
            )}
            ListHeaderComponent={
              searching ? (
                <View className="pb-3">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
            ListFooterComponent={
              fetchingMore ? (
                <View className="py-4">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>

      <AppBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={currentSheet.enablePanDownToClose}
        title={currentSheet.title}
        iconName={currentSheet.iconName}
        onHeaderPress={() => {
          if (sheetView === "AssignJSA" || sheetView === "viewCompletedJsa") {
            setSheetView("employeeSelection");
            return;
          }

          closeAssignSheet();
        }}
        onDismiss={handleDismiss}
        scroll={currentSheet.scroll}
      >
        <JsaAssignmentSheetContent
          view={sheetView}
          setView={setSheetView}
          jsa={selectedJsa}
          onClose={closeAssignSheet}
          onSuccess={() => {
            closeAssignSheet();
          }}
        />
      </AppBottomSheet>
    </>
  );
};

export default JsaScreen;
