import { StatusBar, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import Greeting from "@/components/Greeting";
import Shortcuts from "@/components/Shortcuts";

import Activities from "@/components/Activities";
const home = () => {
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <StatusBar barStyle="dark-content" />
      <View>
        <Header />
        <Greeting />
        <Shortcuts />
        <Activities />
      </View>
    </SafeAreaView>
  );
};

export default home;
