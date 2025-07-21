import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
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
import { Swipeable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Feather";

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
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const { toast } = useGlobalSearchParams(); // <-- GET QUERY PARAM

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
    }, [toast])
  );

  useEffect(() => {
    if (toast === "unassigned") {
      setShowToast(true); // open SuccessModal
      router.replace("/(tabs)/lockers");
    }
  }, [toast]);

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

  const handleDeleteLocker = async (lockerId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      await axios.delete(`${baseUrl}/lockers/${lockerId}`, {
        headers: { Authorization: token! },
      });

      const updated = lockers.filter((l) => l._id !== lockerId);
      setLockers(updated);
    } catch (err) {
      console.error("Failed to delete locker:", err);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    lockerId: string
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
          height: "95%",
          marginRight: 5,
          width: "20%",
        }}
      >
        <SinglePressTouchable
          onPress={() => {
            Alert.alert(
              "Delete Locker",
              "Are you sure you want to delete this locker?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    const swipeable = swipeableRefs.current.get(lockerId);
                    if (swipeable) swipeable.close();
                  },
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteLocker(lockerId),
                },
              ]
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

  const renderLockerCard = useCallback(
    ({ item }: any) => {
      return (
        <Swipeable
          ref={(ref) => {
            if (ref && item._id) swipeableRefs.current.set(item._id, ref);
          }}
          renderRightActions={(progress) =>
            renderRightActions(progress, item._id)
          }
          onSwipeableWillOpen={() => {
            swipeableRefs.current.forEach((ref, id) => {
              if (id !== item._id) ref?.close?.();
            });
          }}
        >
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
              assigned_to={item.assigned_employee?.employee_name}
              assigned_by={item.assigned_by}
              last_updated={formatISODate(item.last_updated)}
              vacant={item.vacant}
              status={item.status}
              location={item.location}
            />
          </SinglePressTouchable>
        </Swipeable>
      );
    },
    [lockers]
  );

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
        message={
          toast === "unassigned"
            ? "Locker unassigned successfully"
            : "Locker assigned successfully"
        }
      />
    </SafeAreaView>
  );
};

export default Lockers;
