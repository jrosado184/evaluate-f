import { View, Text } from "react-native";
import React, { useMemo } from "react";
import useAuthContext from "@/app/context/AuthContext";

const Greeting = () => {
  const { currentUser } = useAuthContext();

  const { greeting, formattedDate, firstName } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();

    const greetingLabel =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

    const dateLabel = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const rawName = currentUser?.name?.trim() || "";
    const safeFirstName = rawName.split(" ")[0] || "there";

    return {
      greeting: greetingLabel,
      formattedDate: dateLabel,
      firstName: safeFirstName,
    };
  }, [currentUser?.name]);

  return (
    <View className="mb-3">
      <Text className="text-[11px] font-medium uppercase tracking-[1px] text-neutral-400">
        {greeting}
      </Text>
      <Text className="mt-1 text-[17px] font-semibold tracking-[-0.3px] text-[#111827]">
        {firstName}
      </Text>
      <Text className="mt-1 text-[12px] text-neutral-500">{formattedDate}</Text>
    </View>
  );
};

export default Greeting;
