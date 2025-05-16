import { ScrollView, StatusBar, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import Greeting from "@/components/Greeting";
import Shortcuts from "@/components/Shortcuts";
import Activities from "@/components/Activities";

export default function HomeScreen() {
  return (
    <ScrollView className="bg-neutral-50">
      <SafeAreaView className="p-6 bg-neutral-50">
        <Header />
        <Greeting />
        <Shortcuts />
        <Activities />
      </SafeAreaView>
    </ScrollView>
  );
}
