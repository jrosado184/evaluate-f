import { View, Text, Image, useWindowDimensions } from "react-native";
import React from "react";
import { router } from "expo-router";

import Notification from "./Notification";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { getAvatarMeta } from "@/app/helpers/avatar";
import useAuthContext from "@/app/context/AuthContext";

const Header = () => {
  const amount = 25;
  const { currentUser } = useAuthContext();
  const { initials, bg, text } = getAvatarMeta(currentUser?.name);
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  return (
    <View
      className={`mb-6 w-full flex-row items-center justify-between ${isTablet && "my-6"}`}
    >
      <View className="flex-1 pr-4">
        <Image
          resizeMode="contain"
          source={require("../constants/icons/logo.png")}
          style={{
            width: isTablet ? 180 : 150,
            height: isTablet ? 44 : 38,
          }}
        />
      </View>
      <View className="flex-row items-center gap-4">
        <View
          className="mr-3 rounded-[18px] border border-[#E5E7EB] bg-white px-2 py-2"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.03,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <Notification amount={amount} />
        </View>

        <SinglePressTouchable onPress={() => router.push("/profile")}>
          <View
            className={`items-center justify-center rounded-full border border-neutral-200 ${bg}`}
            style={{
              width: isTablet ? 50 : 46,
              height: isTablet ? 50 : 46,
            }}
          >
            <Text
              className={`font-semibold ${text}`}
              style={{
                fontSize: isTablet ? 16 : 15,
                letterSpacing: 0.3,
              }}
            >
              {initials}
            </Text>
          </View>
        </SinglePressTouchable>
      </View>
    </View>
  );
};

export default Header;
