import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { avatar_url } from "@/constants/links";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SinglePressTouchable from "@/app/utils/SinglePress";

const Profile = () => {
  const logout = async () => {
    AsyncStorage.clear();
  };
  return (
    <SafeAreaView className="p-6">
      <View className="items-center py-20 gap-6">
        <View className="w-24 h-24 border border-black rounded-full">
          <Image
            className="w-full h-full rounded-full bg-black"
            resizeMode="contain"
            source={{
              uri: avatar_url,
            }}
          />
        </View>
        <Text className="font-inter-semibold text-[1.3rem]">Javier Rosado</Text>
        <View className="my-8 gap-y-3">
          <View className="border border-[#616161] w-[22rem] h-14 rounded-lg justify-center pl-4">
            <Text>Change Password</Text>
          </View>
          <View className="border border-[#616161] w-[22rem] h-14 rounded-lg justify-center pl-4">
            <Text>View actiity</Text>
          </View>
          <View className="border border-[#616161] w-[22rem] h-14 rounded-lg justify-center pl-4">
            <Text>View actiity</Text>
          </View>
        </View>
        <SinglePressTouchable activeOpacity={0.8}>
          <View className="w-28 h-10 rounded-lg border border-[#616161] items-center justify-center">
            <Text>Log out</Text>
          </View>
        </SinglePressTouchable>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
