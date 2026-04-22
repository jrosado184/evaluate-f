import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import debounce from "lodash.debounce";

import Search from "@/components/Search";
import JsaCard from "@/components/jsas/JsaCard";
import useGetJsas from "@/app/requests/useGetJsas";

const JsaScreen = () => {
  const { getJsas } = useGetJsas();

  const [query, setQuery] = useState("");
  const [jsas, setJsas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const loadJsas = async (searchTerm = "") => {
    try {
      setLoading(true);

      const data: any = await getJsas(1, 8, searchTerm || undefined);

      if (data) {
        setJsas(data.data ?? []);
        setTotal(data.pagination?.total ?? 0);
      } else {
        setJsas([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(jsas);
    loadJsas();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        await loadJsas(searchTerm);
      }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    async (value: string) => {
      setQuery(value);

      if (!value.trim()) {
        debouncedSearch.cancel();
        await loadJsas();
        return;
      }

      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  return (
    <SafeAreaView className="p-6 h-[104vh] bg-white">
      <View className="flex-row h-7 justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">JSA's</Text>
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
            No JSA's found
          </Text>
        </View>
      ) : (
        <FlatList
          data={jsas}
          keyExtractor={(item, index) => item?._id?.toString?.() ?? `${index}`}
          contentContainerStyle={{ paddingBottom: 100, gap: 8 }}
          renderItem={({ item }) => (
            <JsaCard
              name={item?.name}
              position={item?.position}
              department={item?.department}
              questionsCount={item.questions.length}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default JsaScreen;
