import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import LeftButton from "@/components/LeftButton";
import FormField from "@/components/FormField";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/Modal";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";

const AddUser = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleModal = () => {};
  return (
    <SafeAreaView className="bg-white h-full p-6">
      <View className="flex-row items-center">
        <LeftButton />
        <Text className="font-inter-regular text-[1.6rem]">Add user</Text>
      </View>
      <View className="w-full gap-8 my-4">
        <FormField
          title="Name"
          inputStyles="pl-4"
          placeholder="Enter name"
          rounded="rounded-[0.625rem]"
        />
        <FormField
          title="ID Number"
          inputStyles="pl-4"
          placeholder="Enter ID number"
          rounded="rounded-[0.625rem]"
        />
        <SelectField
          title="Position"
          placeholder="Select Position"
          options={[
            { label: "Locker 1", value: "locker1" },
            { label: "Locker 2", value: "locker2" },
            { label: "Locker 3", value: "locker3" },
          ]}
          onSelect={(value) => console.log(`Selected: ${value}`)}
          modalVisible={modalVisible}
          onModalOpen={() => setModalVisible(true)}
        />
        <SelectField
          title="Location"
          placeholder="Select Locker Location"
          options={[
            { label: "Fabrication Womens A", value: "locker1" },
            { label: "Fabrication Womens B", value: "locker1" },
            { label: "Harvest Mens A", value: "locker1" },
            { label: "Fabrication Mens B", value: "locker2" },
            { label: "Fabrication Mens C", value: "locker3" },
          ]}
          onSelect={(value: any) => console.log(`Selected: ${value}`)}
          modalVisible={false}
          onModalOpen={() => setModalVisible(true)}
        />
        <SelectField
          title="Locker Number"
          placeholder="Select Locker"
          onSelect={(value: any) => console.log(`Selected: ${value}`)}
          modalVisible={true}
          onModalOpen={() => setModalVisible(true)}
        />
        <View>
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
