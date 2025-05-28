import React, { useRef, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
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

  // 🔧 Pass current location into pagination
  const { getMoreData, resetPagination, fetchingMoreUsers } = usePagination(
    lockers,
    (page: number, limit: number) =>
      getLockers(page, limit, addEmployeeInfo?.location),
    setLockers,
    setLockerDetails,
    lockerDetails,
    8
  );

  // 🟡 Reset when modal opens
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

  // 🟡 Optional: refresh if location changes while modal is open
  useEffect(() => {
    if (visible) {
      setLockers([]);
      resetPagination();
      getMoreData();
    }
  }, [addEmployeeInfo?.location]);

  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity key={item._id} activeOpacity={0.8}>
        <AssignCard
          locker_number={item.locker_number}
          location={item.location}
          onClose={onClose}
        />
      </TouchableOpacity>
    ),
    []
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View className="gap-1 flex-row items-center">
            <View className="flex-row items-center w-full justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={32} className="pr-4" />
                </TouchableOpacity>
                <Text className="font-inter-medium">Choose Locker</Text>
              </View>
            </View>
          </View>

          <View className="flex-1 my-3">
            {!loading && (
              <FlatList
                data={lockers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={renderItem}
                onEndReached={getMoreData}
                onEndReachedThreshold={0.5}
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
