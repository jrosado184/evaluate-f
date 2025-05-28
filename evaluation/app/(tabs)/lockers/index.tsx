import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import Search from "@/components/Search";
import LockerCard from "@/components/LockerCard";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetLockers from "@/app/requests/useGetLockers";
import useScrollHandler from "@/hooks/useScrollHandler";
import Fab from "@/components/Fab";
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import { ActivityIndicator } from "react-native-paper";

const Lockers = () => {
  const {
    lockers,
    setLockers,
    loading,
    setLoading,
    setLockerDetails,
    lockerDetails,
  } = useEmployeeContext();

  const { getLockers } = useGetLockers();

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
              Authorization: token!,
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

      setTimeout(() => {
        getMoreData();
      }, 100);

      return;
    }

    debouncedFetch(value);
  };

  useEffect(() => {
    setLoading(true);
    const loadInitialLockers = async () => {
      const data = await getLockers(1, 4);
      if (data) {
        setLockers(data.results);
        setLockerDetails({
          totalPages: data.totalPages,
          currentPage: 1,
          totalUsers: data.totalLockers,
        });
      }
      setLoading(false);
    };
    loadInitialLockers();
  }, []);

  useEffect(() => {
    if (lockers?.length === 4 && query.trim() === "") {
      getMoreData();
    }
  }, [lockers]);

  useFocusEffect(
    useCallback(() => {
      setIsSearching(false);
      const reloadLockers = async () => {
        const data = await getLockers(1, 4);
        if (data) {
          setLockers(data.results);
          setLockerDetails({
            totalPages: data.totalPages,
            currentPage: 1,
            totalUsers: data.totalLockers,
          });
        }
      };
      reloadLockers();
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
    <SafeAreaView className="p-6 h-[104vh] bg-white">
      <View className="flex-row h-7 justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">Lockers</Text>
      </View>

      <Fab icon="unlock" route="lockers/add_locker" />

      <Search total="lockers" query={query} setQuery={handleSearchChange} />

      {lockers?.length === 0 && !loading ? (
        <View className="h-[50vh] justify-center items-center">
          <Text className="font-inter-regular text-neutral-500">
            No Lockers
          </Text>
        </View>
      ) : !loading ? (
        <Animated.FlatList
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          data={lockers}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderLockerCard}
          onEndReached={getMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <>
              {fetchingMoreUsers && (
                <ActivityIndicator size="small" color="#0000ff" />
              )}
              <View style={{ height: 20 }} />
            </>
          )}
          contentContainerStyle={{ gap: 14 }}
        />
      ) : (
        <UserCardSkeleton amount={5} width="w-full" height="h-40" />
      )}

      {lockers && lockers.length > 4 && (
        <LinearGradient
          colors={["transparent", "white"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 53,
            pointerEvents: "none",
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Lockers;
