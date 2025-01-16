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
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/EvilIcons";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useGetLockers from "@/app/requests/useGetLockers";
import usePagination from "@/hooks/usePagination";
import AssignCard from "./AssignCard";

const SlideUpModal = ({ visible, onClose }: any) => {
  const screenHeight = Dimensions.get("window").height; // Get screen height
  const slideAnim = useRef(new Animated.Value(screenHeight)).current; // Start animation off-screen

  const {
    lockers,
    setLoading,
    setLockers,
    loading,
    setLockerDetails,
    lockerDetails,
  } = useEmployeeContext();
  const { fetchAndSetLockers, getLockers } = useGetLockers();
  const { limit, page, isSearching, getMoreData, fetchingMoreUsers } =
    usePagination(
      lockers,
      getLockers,
      setLockers,
      setLockerDetails,
      lockerDetails,
      8
    );

  const { addEmployeeInfo } = useEmployeeContext();

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: 0, // Fully visible
        duration: 300, // Animation duration
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    } else {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: screenHeight, // Slide off-screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    setLoading(true);
    !isSearching && fetchAndSetLockers(page, limit);
  }, [getLockers]);

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

  const vacantLockers = lockers?.filter((locker: any) => {
    if (locker.vacant && locker.location === addEmployeeInfo?.location) {
      return locker;
    }
  });

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        {/* Background overlay */}
        <TouchableOpacity style={styles.overlay} onPress={onClose} />

        {/* Slide-up content */}
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
                data={vacantLockers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={renderItem}
                onEndReached={getMoreData}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  fetchingMoreUsers && (
                    <ActivityIndicator size="small" color="#0000ff" />
                  )
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

//*make this component reusable

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
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default SlideUpModal;
