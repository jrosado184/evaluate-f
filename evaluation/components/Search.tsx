import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/GlobalContext";

const Search = ({ total }: any) => {
  const { employees } = useEmployeeContext();
  const handleSearch = () => {};
  return (
    <View className="w-full items-center justify-start">
      <FormField
        styles="rounded-full w-full"
        value=""
        placeholder="Search..."
        handleChangeText={handleSearch}
        rounded="rounded-full h-[3.3rem]"
        inputStyles="pl-5 text-[1.1rem]"
      />
      <View className="justify-between items-center w-[100%] flex-row my-4">
        <Text className="pl-2 text-neutral-500">{`Total ${total}: ${employees.length}`}</Text>
        <View className="gap-2 flex-row items-center">
          <Text>Sort By</Text>
          <TouchableOpacity className="w-24 mr-2 h-8 border border-gray-400 rounded-lg items-center justify-center">
            <Text className="text-sm">Last Name</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Search;
