import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Search from "@/components/Search";
import UserCard from "@/components/UserCard";
import Fab from "@/components/Fab";
import SuccessModal from "@/components/SuccessModal";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AddUserSheetContent from "@/components/ui/sheets/AddUserSheetContent";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import UserCardSkeleton from "@/app/skeletons/CardSkeleton";
import usePagination from "@/hooks/usePagination";
import useGetUsers from "@/app/requests/useGetUsers";
import useScrollHandler from "@/hooks/useScrollHandler";
import useActionContext from "@/app/context/ActionsContext";
import debounce from "lodash.debounce";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import { ActivityIndicator } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import SinglePressTouchable from "@/app/utils/SinglePress";
import useAuthContext from "@/app/context/AuthContext";
import { can } from "@/app/helpers/can";
import { PERMISSIONS } from "@/app/config/permissions";

const Users = () => {
  const { getUsers, fetchAndSetUsers } = useGetUsers(4);

  const {
    loading,
    employees,
    setUserDetails,
    setEmployee,
    setEmployees,
    setLoading,
    userDetails,
    sortingBy,
    setSuccessfullyAddedEmployee,
  } = useEmployeeContext();

  const { currentUser } = useAuthContext();

  const [query, setQuery] = useState("");
  const [addUserSheetView, setAddUserSheetView] = useState<
    "form" | "lockerSelection"
  >("form");

  const { onScrollHandler } = useScrollHandler();
  const { actionsMessage, setActionsMessage } = useActionContext();
  const swipeableRefs = useRef(new Map<string, Swipeable | any>());

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = ["94%"];

  const computeSort = () => {
    switch (sortingBy) {
      case "Lockers":
        return "locker_number";
      case "Unassigned":
        return "unassigned";
      default:
        return "default";
    }
  };

  const sort = computeSort();

  const { getMoreData, setIsSearching, fetchingMoreUsers, resetPagination } =
    usePagination(
      employees,
      (page: any) => getUsers(page, computeSort()),
      setEmployees,
      setUserDetails,
      userDetails,
    );

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
          },
        );

        setEmployees(res.data?.users);
        setUserDetails({
          ...userDetails,
          totalUsers: res?.data?.totalUsers,
        });
        setIsSearching(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleSearchChange = async (value: string) => {
    setQuery(value);

    if (value.trim() === "") {
      debouncedFetch.cancel();
      resetPagination();

      const data = await getUsers(1, sort);
      if (data) {
        setEmployees(data.results);
        setUserDetails((prev: any) => ({
          ...prev,
          currentPage: 1,
          totalPages: data.totalPages,
          totalUsers: data.totalUsers,
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
    fetchAndSetUsers(1, sort);
  }, [sort]);

  useEffect(() => {
    if (employees.length === 4 && query.trim() === "") {
      getMoreData();
    }
  }, [employees]);

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      setQuery("");
      setIsSearching(false);

      setLoading(true);
      fetchAndSetUsers(1, sort);

      setSuccessfullyAddedEmployee(false);
    }, []),
  );

  const openAddUserSheet = useCallback(() => {
    setAddUserSheetView("form");
    requestAnimationFrame(() => {
      sheetRef.current?.present();
    });
  }, []);

  const closeAddUserSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const refreshUsersList = useCallback(async () => {
    try {
      resetPagination();
      setQuery("");
      setIsSearching(false);

      setLoading(true);
      fetchAndSetUsers(1, sort);
    } catch (err) {
      console.error("Refresh users error:", err);
    }
  }, [resetPagination, setIsSearching, setLoading, fetchAndSetUsers, sort]);

  const deleteUser = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const response: any = await axios.delete(
        `${baseUrl}/employees/${userId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setEmployees((prev: any) =>
        prev.filter((user: any) => user._id !== userId),
      );
      setUserDetails({
        totalUsers: response?.data?.totalUsers,
      });
      setActionsMessage("User deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete user");
    }
  };

  const handleSwipeableWillOpen = (openedSwipeable: Swipeable | null) => {
    swipeableRefs.current.forEach((ref) => {
      if (ref && ref !== openedSwipeable) {
        ref.close();
      }
    });
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    userId: string,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          {
            transform: [{ translateX }],
            flexDirection: "row",
            height: "95%",
            marginRight: 5,
            width: "20%",
          },
        ]}
      >
        <SinglePressTouchable
          onPress={() => {
            Alert.alert(
              "Delete User",
              "Are you sure you want to delete this user?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    const swipeable = swipeableRefs.current.get(userId);
                    if (swipeable) {
                      swipeable.close?.();
                    }
                  },
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteUser(userId),
                },
              ],
            );
          }}
          style={{
            width: 70,
            backgroundColor: "#EF4444",
            justifyContent: "center",
            alignItems: "center",
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Delete</Text>
        </SinglePressTouchable>
      </Animated.View>
    );
  };

  const renderUserCard = useCallback(({ item }: any) => {
    return (
      <Swipeable
        ref={(ref) => swipeableRefs.current.set(item._id, ref)}
        friction={0.8}
        overshootRight
        rightThreshold={10}
        onSwipeableWillOpen={() =>
          handleSwipeableWillOpen(swipeableRefs.current.get(item._id))
        }
        renderRightActions={(progress) =>
          renderRightActions(progress, item._id)
        }
        containerStyle={{ width: "100%" }}
      >
        <SinglePressTouchable
          key={item?._id}
          onPress={() => {
            setEmployee(item);
            router.push(`/users/${item?._id}`);
          }}
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
            date_of_hire={formatISODate(item?.date_of_hire)}
            button="arrow"
          />
        </SinglePressTouchable>
      </Swipeable>
    );
  }, []);

  return (
    <SafeAreaView className="p-6 h-[104vh] bg-white">
      <View className="flex-row h-7 justify-between items-center w-full">
        <Text className="pl-2 font-inter-regular text-[1.6rem]">Users</Text>
      </View>

      {can(currentUser, PERMISSIONS.USERS_CREATE) && (
        <Fab icon="user-plus" onPress={openAddUserSheet} />
      )}
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
              <View style={{ height: `${employees.length < 5 ? 80 : 40}` }} />
            </>
          )}
          contentContainerStyle={{ gap: 4 }}
        />
      ) : (
        <UserCardSkeleton amount={5} width="w-full" height="h-40" />
      )}

      <SuccessModal
        clearMessage={() => setActionsMessage("")}
        message={actionsMessage}
      />

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

      <AppBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={addUserSheetView === "form"}
        title={addUserSheetView === "form" ? "Add User" : "Select Locker"}
        iconName={addUserSheetView === "form" ? "x" : "arrow-left"}
        onHeaderPress={() => {
          if (addUserSheetView === "lockerSelection") {
            setAddUserSheetView("form");
            return;
          }

          closeAddUserSheet();
        }}
        onDismiss={() => setAddUserSheetView("form")}
        scroll={false}
      >
        <AddUserSheetContent
          view={addUserSheetView}
          setView={setAddUserSheetView}
          onClose={closeAddUserSheet}
          onSuccess={async () => {
            closeAddUserSheet();
            await refreshUsersList();
          }}
        />
      </AppBottomSheet>
    </SafeAreaView>
  );
};

export default Users;
