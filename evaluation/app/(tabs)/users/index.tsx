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
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetUsers from "@/app/requests/useGetUsers";

const Users = () => {
  const { getUsers } = useGetUsers();
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
  } = usePagination(getUsers, setEmployees, setUserDetails, userDetails);

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

  const fetchAndSetUsers = async (page: number) => {
    const data = await getUsers(page, limit);
    if (data) {
      setUserDetails({
        totalUsers: data.totalEmployees,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
      setEmployees(() => {
        setLoading(false);
        if (page === 1) {
          return data.results;
        }
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    !isSearching && fetchAndSetUsers(page);
  }, [getUsers]);

  return (
    <SafeAreaView
      className={`p-6 bg-neutral-50 ${employees.length < 4 && "h-[100vh]"}`}
    >
      <Text className="pl-2 font-inter-medium text-[2rem]">Users</Text>
      <Search
        total="users"
        setData={setEmployees}
        getData={getUsers}
        onSearch={(value: any) => setIsSearching(value)}
        type="employees"
      />
      {employees.length === 0 && !loading ? (
        <View className="h-[40vh] justify-center items-center">
          <Text className="font-inter-regular text-neutral-500">
            No Employees
          </Text>
        </View>
      ) : !loading ? (
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
