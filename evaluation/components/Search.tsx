import { View, Text, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/GlobalContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import debounce from "lodash.debounce";
import getusers from "@/app/requests/useGetUsers";
import useGetUsers from "@/app/requests/useGetUsers";

const Search = ({ total, onSearch }: any) => {
  const { setEmployees, userDetails } = useEmployeeContext();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const { getUsers } = useGetUsers();

  const getSearchedUsers = async (user: any) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    axios
      .get(`${baseUrl}/employees/search?query=${user}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setLoading(false);
        setEmployees(res.data);
        onSearch(true);
      })
      .catch((error: any) => {
        console.log(error);
        throw Error(error);
      });
  };

  const debouncedFetch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length >= 2) {
        getSearchedUsers(searchTerm).finally(() => setLoading(false));
      } else {
        onSearch(false);
      }
    }, 300),
    []
  );

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim() === "") {
      setLoading(true);
      const data = await getUsers(1, 4);
      if (data) {
        setEmployees(data.results);
      }
    }
    onSearch(false);
    debouncedFetch(value);
  };

  //fix search be able to search by last name as well

  return (
    <View className="w-full items-center justify-start">
      <FormField
        styles="rounded-full w-full"
        value={query}
        placeholder="Search..."
        handleChangeText={(e: any) => handleSearch(e)}
        rounded="rounded-full h-[3.3rem]"
        inputStyles="pl-5 text-[1.1rem]"
      />
      <View className="justify-between items-center w-[100%] flex-row my-4">
        <Text className="pl-2 text-neutral-500">{`Total ${total}: ${userDetails.totalUsers}`}</Text>
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
