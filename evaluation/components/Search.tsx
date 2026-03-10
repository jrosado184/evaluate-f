import React from "react";
import { View, Text } from "react-native";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Sort from "./Sort";

interface SearchProps {
  noFilter?: boolean;
  total: string;
  setQuery: (value: string) => void;
  query: string;
}

const Search: React.FC<SearchProps> = ({
  total,
  query,
  setQuery,
  noFilter,
}) => {
  const { userDetails, lockerDetails } = useEmployeeContext();

  const totalCount =
    total === "lockers"
      ? (lockerDetails?.totalLockers ?? 0)
      : (userDetails?.totalUsers ?? 0);

  const label = total === "lockers" ? "Lockers" : "Employees";

  return (
    <View className="w-full -center">
      <FormField
        value={query}
        placeholder={`Search ${label.toLowerCase()}...`}
        handleChangeText={setQuery}
      />

      {!noFilter && (
        <View className="mt-3 pl-1 flex-row items-center justify-between px-1 py-2">
          <View>
            <Text className="mt-0.5 text-[15px] font-bold text-gray-800">
              {totalCount} {label}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Search;
