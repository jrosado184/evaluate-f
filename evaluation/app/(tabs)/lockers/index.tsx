import React from "react";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";

import Search from "@/components/Search";
import JsaCard from "@/components/jsas/JsaCard";
import useJsaList from "@/hooks/useJsaList";

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

  return (
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
          keyExtractor={(item, index) => item?._id?.toString?.() ?? `${index}`}
          contentContainerStyle={{ paddingBottom: 100, gap: 4 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={getMoreData}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <JsaCard
              name={item?.name}
              position={item?.position}
              department={item?.department}
              questionsCount={item?.questions?.length}
            />
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
  );
};

export default JsaScreen;
