import { View, Text } from "react-native";
import React from "react";
import Card from "./Card";
import QRIcon from "@/constants/icons/QRIcon";
import KeyboardIcon from "@/constants/icons/KeyboardIcon";
import LockIcon from "@/constants/icons/LockIcon";
import LockSimpleIcon from "@/constants/icons/LockSimpleIcon";
import UsersIcon from "@/constants/icons/UsersIcon";

const Shortcuts = () => {
  return (
    <View className="w-full flex-row flex-wrap justify-between items-center gap-y-4 my-6">
      <Card title="Scan QR" icon={<QRIcon width={38} height={38} />} />
      <Card
        title="Enter Manually"
        icon={<KeyboardIcon width={38} height={38} />}
      />
      <Card title="Lockers" icon={<LockSimpleIcon width={38} height={38} />} />
      <Card title="Users" icon={<UsersIcon width={38} height={38} />} />
    </View>
  );
};

export default Shortcuts;
