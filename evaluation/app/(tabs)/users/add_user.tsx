import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import LeftButton from "@/components/LeftButton";
import FormField from "@/components/FormField";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/Modal";
import Button from "@/components/Button";

const AddUser = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleModal = () => {};
  return (
    <SafeAreaView className="bg-white h-full p-6">
      <View className="flex-row items-center">
        <LeftButton />
        <Text className="font-inter-regular text-[1.6rem]">Add user</Text>
      </View>
      <View className="w-full">
        <FormField
          styles="my-4"
          title="Name"
          inputStyles="pl-4"
          placeholder="Enter name"
          rounded="rounded-[0.625rem]"
        />
        <FormField
          styles="my-4"
          title="ID Number"
          inputStyles="pl-4"
          placeholder="Enter ID number"
          rounded="rounded-[0.625rem]"
        />
        <FormField
          styles="my-4"
          title="Position"
          inputStyles="pl-4"
          placeholder="Enter position"
          rounded="rounded-[0.625rem]"
        />
        <FormField
          styles="my-4"
          title="Location"
          inputStyles="pl-4"
          placeholder="Enter position"
          rounded="rounded-[0.625rem]"
        />
        {/*make this a select field component*/}
        <View className="my-4">
          <Text className="text-base font-inter-medium">Assign Locker</Text>
          <View
            className={`my-4 border border-gray-400 w-full h-16 flex-row items-center rounded-[0.625rem]`}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="flex-row items-center justify-between"
            >
              <Text className="pl-4 text-[#929292] font-inter-semibold flex-1">
                Assign Locker
              </Text>
              <Icon name="arrow-drop-down" className="pr-2" size={28} />
            </TouchableOpacity>
          </View>
          <View className="w-full items-center ">
            <Button
              title="Add User"
              styles="my-8 w-full rounded-[0.625rem]"
              inputStyles="w-full"
            />
          </View>
        </View>
      </View>
      <SlideUpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AddUser;
