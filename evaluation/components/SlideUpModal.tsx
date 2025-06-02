import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Modal,
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/EvilIcons";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useGetLockers from "@/app/requests/useGetLockers";
import usePagination from "@/hooks/usePagination";
import AssignCard from "./AssignCard";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Search from "@/components/Search";
import debounce from "lodash.debounce";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";

const SlideUpModal = ({ visible, onClose }: any) => {
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const {
    lockers,
    setLoading,
    setLockers,
    loading,
    setLockerDetails,
    lockerDetails,
    addEmployeeInfo,
  } = useEmployeeContext();

  const { getLockers } = useGetLockers();

  const { getMoreData, resetPagination, fetchingMoreUsers, setIsSearching } =
    usePagination(
      lockers,
      (page: number, limit: number) =>
        getLockers(page, limit, addEmployeeInfo?.location),
      setLockers,
      setLockerDetails,
      lockerDetails,
      8
    );

  const [query, setQuery] = useState("");
  const [filteredLockers, setFilteredLockers] = useState<any[]>([]);

  // Server-side search
  const debouncedFetch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const res = await axios.get(
          `${baseUrl}/lockers/search?query=${searchTerm}&location=${addEmployeeInfo?.location}`,
          {
            headers: {
              Authorization: token!,
            },
          }
        );

        setFilteredLockers(res.data);
        setIsSearching(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300),
    [addEmployeeInfo?.location]
  );

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setLoading(true);
      setLockers([]); // Clear old results
      resetPagination();
      getMoreData().finally(() => setLoading(false));
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Refresh if location changes while modal is open
  useEffect(() => {
    if (visible) {
      setLockers([]);
      resetPagination();
      getMoreData();
    }
  }, [addEmployeeInfo?.location]);

  // When query changes, trigger search or reset
  useEffect(() => {
    if (query.trim() === "") {
      setIsSearching(false);
    } else {
      debouncedFetch(query);
    }
  }, [query]);

  const renderItem = useCallback(
    ({ item }: any) => (
      <SinglePressTouchable key={item._id} activeOpacity={0.8}>
        <AssignCard
          locker_number={item.locker_number}
          location={item.location}
          onClose={onClose}
        />
      </SinglePressTouchable>
    ),
    []
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <SinglePressTouchable style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View className="gap-1 flex-row items-center">
            <View className="flex-row items-center w-full justify-between">
              <View className="flex-row items-center">
                <SinglePressTouchable onPress={onClose}>
                  <Icon name="close" size={32} className="pr-4" />
                </SinglePressTouchable>
                <Text className="font-inter-medium">Choose Locker</Text>
              </View>
            </View>
          </View>

          <View className="my-2">
            <Search
              total="lockers"
              query={query}
              setQuery={setQuery}
              placeholder="Search Locker Number"
            />
          </View>

          <View className="flex-1 my-3">
            {!loading && (
              <FlatList
                data={query.trim() === "" ? lockers : filteredLockers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={renderItem}
                onEndReached={() => {
                  if (
                    query.trim() === "" &&
                    !fetchingMoreUsers &&
                    lockerDetails.currentPage < lockerDetails.totalPages
                  ) {
                    getMoreData();
                  }
                }}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  fetchingMoreUsers ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : null
                }
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "90%",
  },
});

export default SlideUpModal;
