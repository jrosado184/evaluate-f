import { StatusBar } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import Greeting from "@/components/Greeting";
import Shortcuts from "@/components/Shortcuts";

import Activities from "@/components/Activities";
const home = () => {
  return (
    <SafeAreaView className="p-5">
      <StatusBar barStyle="dark-content" />
      <Header />
      <Greeting />
      <Shortcuts />
      <Activities />
    </SafeAreaView>
  );
};

export default home;
