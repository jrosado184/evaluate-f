import React, { useCallback, useEffect, useState } from "react";
import { Text, View, Animated } from "react-native";
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
import SinglePressTouchable from "@/app/utils/SinglePress";
import SlideUpModal from "@/components/SlideUpModal";
import SuccessModal from "@/components/SuccessModal";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

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
          `${baseUrl}/lockers?page=1&limit=8&search=${encodeURIComponent(
            searchTerm
          )}`,
          {
            headers: { Authorization: token! },
          }
        );
        setLockers(res.data.results);
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
      setTimeout(() => getMoreData(), 100);
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
          totalLockers: data.totalLockers,
        });
      }
      setLoading(false);
    };
    loadInitialLockers();
  }, []);

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
            totalLockers: data.totalLockers,
          });
        }
      };
      reloadLockers();
    }, [])
  );

  const handleAssignPress = (vacant: boolean, lockerId: string) => {
    if (vacant) {
      setSelectedLockerId(lockerId);
      setModalVisible(true);
      setQuery("");
    }
  };

  const handleAssignmentComplete = async () => {
    const data = await getLockers(1, 4);
    if (data) {
      setLockers(data.results);
      setLockerDetails({
        totalPages: data.totalPages,
        currentPage: 1,
        totalLockers: data.totalLockers,
      });
      setShowToast(true);
    }
  };

  const renderLockerCard = useCallback(({ item }: any) => {
    return (
      <SinglePressTouchable
        key={item._id}
        activeOpacity={0.8}
        onPress={() => {
          if (!item.vacant && item.assigned_employee?._id) {
            router.push(`/lockers/${item._id}`);
          } else {
            handleAssignPress(item.vacant, item._id);
          }
        }}
      >
        <LockerCard
          button="arrow"
          locker_number={item.locker_number}
          Assigned_to={item.assigned_employee?.employee_name}
          assigned_by={item.assigned_by}
          last_updated={formatISODate(item.last_updated)}
          vacant={item.vacant}
          status={item.status}
          location={item.location}
        />
      </SinglePressTouchable>
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
          ListFooterComponent={
            fetchingMoreUsers ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : null
          }
          contentContainerStyle={{ gap: 14, paddingBottom: 85 }}
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

      <SlideUpModal
        mode="assignEmployee"
        onAssignmentComplete={handleAssignmentComplete}
        visible={modalVisible}
        lockerId={selectedLockerId}
        onClose={() => {
          setModalVisible(false);
          setSelectedLockerId("");
          setQuery("");
        }}
      />

      <SuccessModal
        show={showToast}
        setShow={setShowToast}
        message="Locker assigned successfully"
      />
    </SafeAreaView>
  );
};

export default Lockers;
