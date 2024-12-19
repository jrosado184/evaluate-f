import { View, Text } from "react-native";
import React, { useCallback, useState } from "react";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/GlobalContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import debounce from "lodash.debounce";

const Search = ({ total, onSearch, getData, setData, type }: any) => {
  const { userDetails, lockerDetails } = useEmployeeContext();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const getSearchedUsers = async (user: any) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    //user us the person being searched
    //type is "lockers" or "users", passed in through props
    axios
      .get(`${baseUrl}/employees/search?query=${user}&type=${type}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setLoading(false);
        setData(res.data);
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
      const data = await getData(1, 4);
      if (data) {
        setData(data.results);
      }
    }
    onSearch(false);
    debouncedFetch(value);
  };

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
        <Text className="pl-2 text-neutral-500">{`Total ${total}: ${
          total === "lockers"
            ? lockerDetails.totalUsers
            : userDetails.totalUsers
        }`}</Text>
      </View>
    </View>
  );
};

export default Search;
