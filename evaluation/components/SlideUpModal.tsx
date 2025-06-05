import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Modal,
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/EvilIcons";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useGetUsers from "@/app/requests/useGetUsers";
import usePagination from "@/hooks/usePagination";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Search from "@/components/Search";
import debounce from "lodash.debounce";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import AssignEmployeeCard from "./employees/AssignEmployeeCard";
import LockerCard from "./LockerCard";
import SuccessModal from "./SuccessModal";

const SlideUpModal = ({
  visible,
  onClose,
  lockerId,
  onLockerSelected,
  onAssignmentComplete,
  mode = "assignEmployee",
}: {
  visible: boolean;
  onClose: () => void;
  lockerId?: string;
  onLockerSelected?: (locker: any) => void;
  onAssignmentComplete?: () => void;
  mode?: "assignEmployee" | "assignLocker";
}) => {
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const {
    setLoading,
    loading,
    employees,
    lockers,
    setEmployees,
    setLockers,
    setUserDetails,
    userDetails,
  } = useEmployeeContext();

  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTrigger, setToastTrigger] = useState(0);

  const { getUsers } = useGetUsers(8);
  const {
    getMoreData,
    getInitialData,
    resetPagination,
    fetchingMoreUsers,
    setIsSearching,
  } = usePagination(
    mode === "assignEmployee" ? employees : lockers,
    getUsers,
    mode === "assignEmployee" ? setEmployees : setLockers,
    setUserDetails,
    userDetails,
    8
  );

  const debouncedFetch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        setSearchLoading(true);
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const url =
          mode === "assignEmployee"
            ? `${baseUrl}/employees/search?query=${searchTerm}&type=employees`
            : `${baseUrl}/lockers/search?query=${searchTerm}`;

        const res = await axios.get(url, {
          headers: { Authorization: token! },
        });

        const results = mode === "assignEmployee" ? res.data.users : res.data;
        setFilteredItems(results || []);
        setIsSearching(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [mode]
  );

  useEffect(() => {
    if (visible && lockerId) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setLoading(true);
      if (mode === "assignEmployee") {
        setEmployees([]);
      } else {
        setLockers([]);
      }
      resetPagination();
      getInitialData().finally(() => setLoading(false));
    }
  }, [visible, mode, lockerId]);

  useEffect(() => {
    if (query.trim() === "") {
      setIsSearching(false);
    } else {
      debouncedFetch(query);
    }
  }, [query]);

  const handleAssign = async (employeeId: string) => {
    if (!lockerId) {
      Alert.alert("Error", "No locker selected.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const response = await axios.post(
        `${baseUrl}/lockers/assign`,
        { lockerId, employeeId },
        {
          headers: {
            Authorization: token!,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        onAssignmentComplete?.(); // refresh parent
        setToastMessage("Locker successfully assigned!");
        setToastTrigger(Date.now());
        handleClose();
      }
    } catch (error: any) {
      console.error(
        "Assignment failed:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Failed to assign locker"
      );
    }
  };

  const handleLockerSelection = (locker: any) => {
    onLockerSelected?.(locker);
    handleClose();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuery(""); // clear query
      onClose();
    });
  };

  const renderItem = useCallback(
    ({ item }: any) =>
      mode === "assignEmployee" ? (
        <SinglePressTouchable
          key={item._id}
          onPress={() => handleAssign(item._id)}
          activeOpacity={0.8}
        >
          <AssignEmployeeCard {...item} assigned={!!item.locker_id} />
        </SinglePressTouchable>
      ) : (
        <SinglePressTouchable
          key={item._id}
          onPress={() => handleLockerSelection(item)}
          activeOpacity={0.8}
        >
          <LockerCard {...item} />
        </SinglePressTouchable>
      ),
    [mode, lockerId]
  );

  if (!visible || !lockerId) return null;

  return (
    <>
      <Modal transparent visible={visible} animationType="none">
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <SinglePressTouchable style={styles.overlay} onPress={handleClose} />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View className="gap-1 flex-row items-center">
              <View className="flex-row items-center w-full justify-between">
                <View className="flex-row items-center">
                  <SinglePressTouchable onPress={handleClose}>
                    <Icon name="close" size={32} className="pr-4" />
                  </SinglePressTouchable>
                  <Text className="font-inter-medium">
                    {mode === "assignEmployee"
                      ? "Select Employee"
                      : "Select Locker"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="my-2">
              <Search
                noFilter
                total={mode === "assignEmployee" ? "employees" : "lockers"}
                query={query}
                setQuery={setQuery}
              />
            </View>

            <View className="flex-1 my-3 justify-center items-center">
              {loading || searchLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <FlatList
                  data={
                    query.trim() === ""
                      ? mode === "assignEmployee"
                        ? employees
                        : lockers
                      : filteredItems
                  }
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={renderItem}
                  onEndReached={() => {
                    if (
                      query.trim() === "" &&
                      !fetchingMoreUsers &&
                      userDetails.currentPage < userDetails.totalPages
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
        </Animated.View>
      </Modal>

      <SuccessModal
        message={toastMessage}
        trigger={toastTrigger}
        clearMessage={() => setToastMessage("")}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
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
