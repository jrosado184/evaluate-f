import { Text, View } from "react-native";
import React, { Component } from "react";
import BellIcon from "@/constants/icons/BellIcon";

interface NotificationTypes {
  amount?: number;
}

const Notification: React.FC<NotificationTypes> = ({ amount }) => {
  return (
    <View className="relative">
      <BellIcon width={28} height={28} fillColor="black" />
      {amount && (
        <View className="absolute right-[-1.3rem] top-[-0.5rem] w-10 h-[1.6rem] border border-black bg-red-600 rounded-full justify-center items-center">
          <Text className="font-inter-semibold text-white">
            {amount < 10 ? amount : <Text>{"9+"}</Text>}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Notification;
