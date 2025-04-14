import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import UserCard from "@/components/UserCard";
import { router, useFocusEffect } from "expo-router";
import Search from "@/components/Search";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetUsers from "@/app/requests/useGetUsers";
import useScrollHandler from "@/hooks/useScrollHandler";
import Fab from "@/components/Fab";
import SuccessModal from "@/components/SuccessModal";
import useActionContext from "@/app/context/ActionsContext";
import debounce from "lodash.debounce";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";

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

  const { getMoreData, setIsSearching, fetchingMoreUsers, resetPagination } =
    usePagination(
      employees,
      getUsers,
      setEmployees,
      setUserDetails,
      userDetails
    );

  const [query, setQuery] = useState("");
  const { onScrollHandler } = useScrollHandler();
  const { successfullyAddedEmployee, setSuccessfullyAddedEmployee } =
    useEmployeeContext();
  const { actionsMessage } = useActionContext();

  const debouncedFetch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const res = await axios.get(
          `${baseUrl}/employees/search?query=${searchTerm}&type=employees`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setEmployees(res.data);
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

      const data = await getUsers(1, 4);
      if (data) {
        setEmployees(data.results);
        setUserDetails((prev) => ({
          ...prev,
          currentPage: 1,
          totalPages: data.totalPages,
        }));
      }

      setIsSearching(false);

      // Force trigger pagination in case scroll doesn't
      setTimeout(() => {
        getMoreData();
      }, 100);

      return;
    }

    debouncedFetch(value);
  };

  useEffect(() => {
    setLoading(true);
    fetchAndSetUsers(1);
  }, []);

  useEffect(() => {
    // Auto-trigger pagination if exactly 4 items on reset
    if (employees.length === 4 && query.trim() === "") {
      getMoreData();
    }
  }, [employees]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSuccessfullyAddedEmployee(false);
      };
    }, [])
  );

  const renderUserCard = useCallback(({ item }: any) => {
    return (
      <TouchableOpacity
        key={item?._id}
        onPress={() => router.push(`/users/${item?._id}`)}
        activeOpacity={0.8}
      >
        <UserCard
          position={item?.position}
          name={item?.employee_name}
          department={item?.department}
          employee_id={item?.employee_id}
          last_update={formatISODate(item?.last_updated)}
          locker_number={item?.locker_number}
          knife_number={item?.knife_number}
          status={item?.status}
          button="arrow"
        />
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView className="p-6 h-[104vh] bg-white">
      <View className="flex-row h-7 justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">Users</Text>
      </View>

      <Fab icon="user-plus" route="users/add_user" />

      <Search total="users" query={query} setQuery={handleSearchChange} />

      {employees?.length === 0 && !loading ? (
        <View className="h-[50vh] justify-center items-center">
          <Text className="font-inter-regular text-neutral-500">
            No Employees
          </Text>
        </View>
      ) : !loading ? (
        <Animated.FlatList
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          data={employees}
          keyExtractor={(item) => item?._id?.toString()}
          renderItem={renderUserCard}
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

      <SuccessModal message={actionsMessage} />

      {employees && employees.length > 4 && (
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

export default Users;
