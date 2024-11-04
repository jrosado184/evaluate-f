import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const home = () => {
  return (
    <SafeAreaView>
      <View>
        <Image
          resizeMode="contain"
          className="w-[12rem]"
          source={require("../../constants/icons/logo.png")}
        />
      </View>
    </SafeAreaView>
  );
};

export default home;
