import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Search from "@/components/Search";
import LockerCard from "@/components/LockerCard";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import useGetLockers from "@/app/requests/useGetLockers";
import usePagination from "@/hooks/usePagination";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import useScrollHandler from "@/hooks/useScrollHandler";
import Fab from "@/components/Fab";
import { View } from "moti";
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";

const Lockers = () => {
  const {
    lockers,
    setLockers,
    loading,
    setLoading,
    setLockerDetails,
    lockerDetails,
  } = useEmployeeContext();
  const { getLockers, fetchAndSetLockers } = useGetLockers();

  const { getMoreData, setIsSearching, fetchingMoreUsers, resetPagination } =
    usePagination(
      lockers,
      getLockers,
      setLockers,
      setLockerDetails,
      lockerDetails,
      4
    );

  const { onScrollHandler } = useScrollHandler();

  const [query, setQuery] = useState("");

  const debouncedFetch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const res = await axios.get(
          `${baseUrl}/employees/search?query=${searchTerm}&type=lockers`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setLockers(res.data);
        setIsSearching(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300),
    []
  );

  const handleSearchChange = async (value: string) => {
    setQuery(value);

    if (value.trim() === "") {
      debouncedFetch.cancel();
      resetPagination();

      const data = await getLockers(1, 4);
      if (data) {
        setLockers(data.results);
        setLockerDetails((prev: any) => ({
          ...prev,
          currentPage: 1,
          totalPages: data.totalPages,
        }));
      }

      setIsSearching(false);

      // Force pagination in case scroll doesn't trigger it
      setTimeout(() => {
        getMoreData();
      }, 100);

      return;
    }

    debouncedFetch(value);
  };

  useEffect(() => {
    setLoading(true);
    fetchAndSetLockers(1, 4);
  }, []);

  useEffect(() => {
    // Auto-trigger getMoreData if exactly 4 lockers after clearing search
    if (lockers?.length === 4 && query.trim() === "") {
      getMoreData();
    }
  }, [lockers]);

  useFocusEffect(
    useCallback(() => {
      setIsSearching(false);
      fetchAndSetLockers(1, 4);
    }, [])
  );

  const renderLockerCard = useCallback(({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => router.push(`/lockers/${String(item._id)}`)}
        activeOpacity={0.8}
      >
        <LockerCard
          button={"arrow"}
          locker_number={item.locker_number}
          Assigned_to={item.assigned_to}
          assigned_by={item.assigned_by}
          last_updated={formatISODate(item.last_updated)}
          vacant={item.vacant}
          status={item.status}
          location={item.location}
        />
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView
      className={`p-6 bg-white h-[105vh] ${lockers?.length < 4 && "h-[105vh]"}`}
    >
      <View className="flex-row justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">Lockers</Text>
      </View>

      <Fab icon="unlock" route="lockers/add_locker" />

      <Search total="lockers" query={query} setQuery={handleSearchChange} />

      {lockers?.length === 0 && !loading ? (
        <View className="h-[40vh] justify-center items-center">
          <Text className="font-inter-regular text-neutral-500">
            No Lockers
          </Text>
        </View>
      ) : !loading ? (
        <FlatList
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          data={lockers}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderLockerCard}
          onEndReached={getMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            fetchingMoreUsers ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 8, gap: 14 }}
        />
      ) : (
        <UserCardSkeleton amount={5} width="w-full" height="h-40" />
      )}
    </SafeAreaView>
  );
};

export default Lockers;
