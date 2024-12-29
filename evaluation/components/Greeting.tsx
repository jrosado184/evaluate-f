import { View, Text } from "react-native";
import React from "react";
import useAuthContext from "@/app/context/AuthContext";
import formatISODate from "@/app/conversions/ConvertIsoDate";

const Greeting = () => {
  const { currentUser } = useAuthContext();
  const today = new Date();
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  return (
    <View className="my-2 gap-2">
      <Text className="font-inter-semibold text-[1.2rem]">{`Welcome, ${currentUser.name}`}</Text>
      <Text className="font-inter-regular text-gray-500">{formattedDate}</Text>
    </View>
  );
};

export default Greeting;
