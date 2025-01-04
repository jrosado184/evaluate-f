import React, { useRef, useState, useEffect } from "react";
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
import FormField from "./FormField";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Checkbox from "expo-checkbox"; // Install this with `expo install expo-checkbox`
import Sort from "./Sort";
import WarningIcon from "@/constants/icons/WarningIcon";
import Gender from "react-native-vector-icons/MaterialIcons";
import CheckIcon from "@/constants/icons/CheckIcon";

const SlideUpModal = ({ visible, onClose }: any) => {
  const screenHeight = Dimensions.get("window").height; // Get screen height
  const slideAnim = useRef(new Animated.Value(screenHeight)).current; // Start animation off-screen

  const list = ["Locker Number", "Designation", "Location"];

  const { lockers } = useEmployeeContext();

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

  const renderItem = () => (
    <View className="flex-row items-center py-3 border-b border-gray-300"></View>
  );

  console.log(lockers);

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
          <View className="gap-2">
            <View className="flex-row items-center w-full justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={32} className="pr-4" />
                </TouchableOpacity>
                <Text className="font-inter-medium">Choose Locker</Text>
              </View>
              <View className="pr-2 flex-row items-center gap-2">
                <Text>Filter by</Text>
                <View className="w-16 h-7 rounded-lg border border-black"></View>
              </View>
            </View>
          </View>
          <View className="h-full my-8 gap-4">
            {/* List */}
            {/* <FlatList
              data={lockers}
              renderItem={renderItem}
              keyExtractor={(item) => item.locker_umber}
            /> */}
            <View className="h-28 w-[100%] flex-row justify-between p-4 py-1 border border-gray-300 rounded-lg">
              <View className="my-2 gap-1 flex-row justify-between w-full">
                <View className="w-[50%] gap-1">
                  <Text className="font-inter-medium text-[1.2rem]">
                    Locker:{" "}
                    <Text className="font-inter-bold text-[1.2rem]">34</Text>
                  </Text>
                  <Text>Fabriaction Mens C</Text>
                </View>
                <View className="justify-between items-end gap-4">
                  <View className="flex-row gap-2 items-center">
                    <Gender color="#005FCC" name="male" size={24} />
                    <CheckIcon />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-20 h-8 border border-gray-400 justify-center items-center rounded-md my-2"
                  >
                    <Text className="text-sm">Assign</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="h-28 w-[100%] flex-row justify-between p-4 py-1 border border-gray-300 rounded-lg">
              <View className="my-2 gap-1 flex-row justify-between w-full">
                <View className="w-[50%] gap-1">
                  <Text className="font-inter-medium text-[1.2rem]">
                    Locker:{" "}
                    <Text className="font-inter-bold text-[1.2rem]">34</Text>
                  </Text>
                  <Text className="font-inter-regular">
                    Fabriaction Womens A
                  </Text>
                </View>
                <View className="justify-between items-end gap-4">
                  <View className="flex-row gap-2 items-center">
                    <Gender color="#E91E63" name="female" size={24} />
                    <CheckIcon />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-20 h-8 border border-gray-400 justify-center items-center rounded-md my-2"
                  >
                    <Text className="text-sm">Assign</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
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
