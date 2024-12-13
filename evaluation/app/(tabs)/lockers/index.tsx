import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { router } from "expo-router";
import UserCard from "@/components/UserCard";
import Search from "@/components/Search";
import LockerCard from "@/components/LockerCard";
import VacantCard from "@/components/VacantCard";
import getusers from "@/app/requests/useGetUsers";
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import useGetLockers from "@/app/requests/useGetLockers";
import usePagination from "@/hooks/usePagination";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";

const Lockers = () => {
  const renderLockerCard = useCallback(({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => router.push(`/lockers/${item._id}`)}
        activeOpacity={0.8}
      >
        <LockerCard
          button={"arrow"}
          locker_number={item.locker_number}
          assigned_to={item.Assigned_to}
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

  const { page, limit, getMoreData, fetchingMoreUsers } = usePagination(
    getLockers,
    setLockers,
    setLockerDetails,
    lockerDetails
  );

  const fetchAndSetLockers = async () => {
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
    fetchAndSetLockers();
  }, []);

  //everything working great, hook and gettting more redesign vacant lockers and hook it up to the data
  //conect the search and link up lockers and users

  return (
    <SafeAreaView className={`p-6 bg-neutral-50`}>
      <Text className="pl-2 font-inter-medium text-[2rem]">Lockers</Text>
      <Search total="lockers" onSearch={null} />
      {!loading ? (
        <FlatList
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
          contentContainerStyle={{ paddingBottom: 130, gap: 14 }}
        />
      ) : (
        <UserCardSkeleton amount={5} width="w-full" height="h-40" />
      )}
    </SafeAreaView>
  );
};

export default Lockers;
