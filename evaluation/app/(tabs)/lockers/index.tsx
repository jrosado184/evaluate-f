import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
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

const Lockers = () => {
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
          Assigned_to={item.Assigned_to}
          assigned_by={item.assigned_by}
          last_updated={formatISODate(item.last_updated)}
          vacant={item.vacant}
          status={item.status}
        />
      </TouchableOpacity>
    );
  }, []);

  const { getLockers } = useGetLockers();

  const {
    lockers,
    setLockers,
    loading,
    setLoading,
    setLockerDetails,
    lockerDetails,
  } = useEmployeeContext();

  const {
    page,
    isSearching,
    limit,
    getMoreData,
    fetchingMoreUsers,
    setIsSearching,
  } = usePagination(getLockers, setLockers, setLockerDetails, lockerDetails);

  const { onScrollHandler } = useScrollHandler();

  const fetchAndSetLockers = async (page: any) => {
    const data = await getLockers(page, limit);
    if (data) {
      setLockerDetails({
        totalUsers: data.totalEmployees,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
      setLockers(() => {
        setLoading(false);
        if (page === 1) {
          return data.results;
        }
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    !isSearching && !loading && fetchAndSetLockers(page);
  }, []);

  return (
    <SafeAreaView
      className={`p-6 bg-white h-[105vh] ${lockers?.length < 4 && "h-[105vh]"}`}
    >
      <View className="flex-row justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.9rem]">Lockers</Text>
      </View>
      <Fab icon="unlock" />
      <Search
        total="lockers"
        getData={getLockers}
        setData={setLockers}
        onSearch={(value: any) => setIsSearching(value)}
        type="lockers"
      />
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
          onEndReached={getMoreData} // Trigger when the user scrolls near the bottom
          onEndReachedThreshold={0.5} // Trigger when halfway to the end
          ListFooterComponent={
            fetchingMoreUsers && (
              <ActivityIndicator size="small" color="#0000ff" />
            )
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
