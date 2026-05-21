import React from "react";
import { View, Text } from "react-native";
import FormField from "./FormField";

interface SearchProps {
  noFilter?: boolean;
  total?: number | string;
  setQuery: (value: string) => void;
  query: string;
  label?: string;
}

const Search: React.FC<SearchProps> = ({
  total = 0,
  label = "items",
  query,
  setQuery,
  noFilter = false,
}) => {
  return (
    <View className="w-full">
      <FormField
        value={query}
        placeholder={`Search ${label.toLowerCase()}...`}
        handleChangeText={setQuery}
      />

      {!noFilter && (
        <View className="mt-3 flex-row items-center justify-between px-1 py-2">
          <Text className="mt-0.5 text-[15px] font-bold text-gray-800">
            {total} {label}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Search;
