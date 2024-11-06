import { View, Text, Image } from "react-native";
import React from "react";
import Notification from "./Notification";
import { avatar_url } from "@/constants/links";

const Header = () => {
  const amount = 0;

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
        <Notification />
        <View className="w-[3rem] h-[3rem] mb-2 border border-black rounded-full">
          <Image
            className="w-full h-full rounded-full bg-black"
            resizeMode="contain"
            source={{
              uri: avatar_url,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Header;
