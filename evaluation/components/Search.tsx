import { View, Text } from "react-native";
import React from "react";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Sort from "./Sort";

interface SearchProps {
  noFilter?: boolean;
  total: string;
  setQuery: any;
  query: any;
}

const Search: React.FC<SearchProps> = ({
  total,
  query,
  setQuery,
  noFilter,
}: any) => {
  const { userDetails, lockerDetails } = useEmployeeContext();

  return (
    <View className="w-full items-center justify-start">
      <FormField
        value={query}
        placeholder="Search..."
        handleChangeText={setQuery}
      />
      <View
        className={`${
          noFilter && "hidden"
        } flex justify-between items-center w-[100%] flex-row my-4`}
      >
        <Text className="pl-2 text-neutral-500">{`Total ${total}: ${
          total === "lockers"
            ? lockerDetails.totalUsers
            : userDetails.totalUsers
        }`}</Text>
        <Sort />
      </View>
    </View>
  );
};

export default Search;
