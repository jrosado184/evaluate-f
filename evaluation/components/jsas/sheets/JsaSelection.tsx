import React from "react";
import { FlatList, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import Search from "@/components/Search";
import JsaCard from "@/components/jsas/JsaCard";
import SinglePressTouchable from "@/app/utils/SinglePress";
import useJsaList from "@/hooks/useJsaList";

type Props = {
  onSelectJsa?: (jsa: any) => void;
};

const JsaSelection = ({ onSelectJsa }: Props) => {
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
    <View className="flex-1 bg-white p-5">
      <View className="px-1">
        <Text className="text-xl font-inter-semibold text-neutral-900">
          Select JSA
        </Text>

        <Text className="mt-1 text-[13px] leading-5 font-inter-regular text-neutral-500">
          Choose a Job Safety Assessment from the list.
        </Text>
      </View>

      <Search
        label="jsa's"
        total={total}
        query={query}
        setQuery={handleSearchChange}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="small" />
        </View>
      ) : jsas.length === 0 ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="font-inter-regular text-neutral-500">
            No JSA&apos;s found
          </Text>
        </View>
      ) : (
        <FlatList
          data={jsas}
          keyExtractor={(item, index) => item?._id?.toString?.() ?? `${index}`}
          contentContainerStyle={{ paddingBottom: 32, gap: 4 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={getMoreData}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <SinglePressTouchable onPress={() => onSelectJsa?.(item)}>
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
    </View>
  );
};

export default JsaSelection;
