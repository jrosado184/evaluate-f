import {
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  View,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserCard from "@/components/UserCard";
import { router } from "expo-router";
import Search from "@/components/Search";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetUsers from "@/app/requests/useGetUsers";
import useScrollHandler from "@/hooks/useScrollHandler";
import Fab from "@/components/Fab";
import { useTabBar } from "../_layout";

const Users = () => {
  const { getUsers, fetchAndSetUsers } = useGetUsers();
  const {
    loading,
    employees,
    setUserDetails,
    setEmployees,
    setLoading,
    userDetails,
  } = useEmployeeContext();

  const {
    limit,
    page,
    getMoreData,
    setIsSearching,
    isSearching,
    fetchingMoreUsers,
  } = usePagination(
    employees,
    getUsers,
    setEmployees,
    setUserDetails,
    userDetails
  );

  const { onScrollHandler } = useScrollHandler();

  const { isTabBarVisible } = useTabBar();

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
          knife_number={item.knife_number}
          status={item.status}
          button="arrow"
        />
      </TouchableOpacity>
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    !isSearching && fetchAndSetUsers(page);
  }, [getUsers]);

  return (
    <SafeAreaView
      className={`p-6 bg-white h-[105vh] ${
        employees.length < 4 && "h-[105vh]"
      }`}
    >
      <View className="flex-row h-10 justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">Users</Text>
      </View>
      <Fab icon="user-plus" route="users/add_user" />
      {isTabBarVisible && (
        <Search
          total="users"
          setData={setEmployees}
          getData={getUsers}
          onSearch={(value: any) => setIsSearching(value)}
          type="employees"
        />
      )}
      {employees.length === 0 && !loading ? (
        <View className="h-[40vh] justify-center items-center">
          <Text className="font-inter-regular text-neutral-500">
            No Employees
          </Text>
        </View>
      ) : !loading ? (
        <FlatList
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
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
          contentContainerStyle={{ paddingBottom: 8, gap: 14 }}
        />
      ) : (
        <UserCardSkeleton amount={5} width="w-full" height="h-40" />
      )}
    </SafeAreaView>
  );
};

export default Users;
