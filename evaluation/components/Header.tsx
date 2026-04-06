import { View, Text, Image } from "react-native";
import React from "react";
import Notification from "./Notification";
import { avatar_url } from "@/constants/links";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { getAvatarMeta } from "@/app/helpers/avatar";
import useAuthContext from "@/app/context/AuthContext";

const Header = () => {
  const amount = 25;
  const { currentUser } = useAuthContext();
  const { initials, bg, text } = getAvatarMeta(currentUser?.name);

  return (
    <View className="flex-row justify-between items-start w-full">
      <View className="gap-2">
        <Image
          resizeMode="contain"
          className="w-[10rem] h-[3rem]"
          source={require("../constants/icons/logo.png")}
        />
      </View>
      <View
        className={`flex-row items-center justify-center ${
          amount > 0 ? "gap-8" : "gap-5"
        }`}
      >
        <Notification amount={amount} />
        <View
          className={`w-[3rem] h-[3rem] mb-2 border border-neutral-300 rounded-full justify-center items-center ${bg}`}
        >
          <SinglePressTouchable onPress={() => router.push("/profile")}>
            <Text className={`font-bold tracking-[0.4px] ${text}`}>
              {initials}
            </Text>
          </SinglePressTouchable>
        </View>
      </View>
    </View>
  );
};

export default Header;
