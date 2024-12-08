import {
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserCard from "@/components/UserCard";
import { router } from "expo-router";
import Search from "@/components/Search";
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetUsers from "@/app/requests/useGetUsers";

const Users = () => {
  const { getUsers } = useGetUsers();
  //States
  const {
    loading,
    employees,
    userDetails,
    setUserDetails,
    setEmployees,
    setLoading,
  } = useEmployeeContext();

  let page = 1;
  const [fetchingMoreUsers, setFetchingMoreUsers] = useState<Boolean>(false);
  const [nextPage, setNextPage] = useState(page + 1);
  const [limit, setLimit] = useState(4);
  const [isSearching, setIsSearching] = useState(false);

  //User Card
  const renderUserCard = useCallback(({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => router.push(`/users/${item._id}`)}
        activeOpacity={0.8}
      >
        <UserCard
          position={item.position}
          name={item.employee_name}
          department={item.department}
          employee_id={item.employee_id}
          last_update={formatISODate(item.last_updated)}
          locker_number={item.locker_number}
          status={item.status}
          button="arrow"
        />
      </TouchableOpacity>
    );
  }, []);

  //Functions
  const getMoreData = async () => {
    if (fetchingMoreUsers || isSearching) return; // Avoid multiple triggers
    setFetchingMoreUsers(true);

    const data = await getUsers(nextPage, limit);
    if (data) {
      setEmployees((prev: any) => [...prev, ...data.results]);
      setNextPage((prev: number) => prev + 1);
    }
    setFetchingMoreUsers(false);
  };

  const fetchAndSetUsers = async (page: number) => {
    const data = await getUsers(page, limit);
    if (data) {
      setUserDetails({
        totalUsers: data.totalEmployees,
        pages: data.totalPages,
        currentPage: data.currentPage,
      });
      setEmployees((prevEmployees: any) => {
        setLoading(false);
        if (page === 1) {
          return data.results;
        }
      });
    }
  };

  const handleSearch = (isSearchActive: boolean) => {
    setIsSearching(isSearchActive);
    if (!isSearchActive) {
      // fetchAndSetUsers(1);
      // setNextPage(2);
    }
  };

  useEffect(() => {
    setLoading(true);
    !isSearching && fetchAndSetUsers(page);
  }, []);

  //UI
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Text className="pl-2 font-inter-medium text-[2rem]">Users</Text>
      <Search total="users" onSearch={handleSearch} />
      {!loading ? (
        <FlatList
          data={employees}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderUserCard}
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

export default Users;
