import { View, Text, TouchableOpacity, Modal } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/GlobalContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import debounce from "lodash.debounce";
import RNPickerSelect from "react-native-picker-select";

const Search = ({ total, onSearch, getData, setData, type }: any) => {
  const { employees, setEmployees, userDetails, lockerDetails } =
    useEmployeeContext();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const sortingOptions = ["Default", "Lockers", "Unassigned"];
  const [sortingBy, setSortingBy] = useState(sortingOptions[0]);

  const pickerRef = useRef<RNPickerSelect>(null);

  const getSearchedUsers = async (user: any) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
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

        <View className="gap-2 flex-row items-center">
          <Text className="text-neutral-500 font-inter-regular">Sort By</Text>
          <TouchableOpacity
            onPress={() => setModal(!modal)}
            className="border border-neutral-400 w-24 h-8 rounded-lg mr-2 justify-center items-center z-10"
          >
            <Text className="font-inter-regular text-sm">{sortingBy}</Text>
            {modal && (
              <View className="relative right-24 top-2 bg-neutral-100">
                <View className="w-36 h-24 border border-neutral-400 bg-neutral-50 absolute rounded-lg justify-around p-2">
                  {sortingOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSortingBy(option)}
                    >
                      <Text className="font-inter-regular text-sm">
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="justify-center absolute left-14 bottom-[1px] w-0 h-0"></View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Search;
