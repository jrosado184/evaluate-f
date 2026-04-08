import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { getAvatarMeta } from "@/app/helpers/avatar";

type Props = {
  name?: string;
  email?: string;
  employeeId?: string | number;
  role?: string;
};

const InfoBlock = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => {
  return (
    <View
      className="rounded-[18px] bg-[#FAFBFC] px-4 py-4"
      style={{
        borderWidth: 1,
        borderColor: "#E3E8EF",
      }}
    >
      <Text className="mb-1 text-[12px] font-medium text-neutral-500">
        {label}
      </Text>
      <Text className="text-[15px] font-semibold text-neutral-900">
        {value || "-"}
      </Text>
    </View>
  );
};

const ProfileSummaryCard = ({ name, email, employeeId, role }: Props) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { initials, bg, text } = getAvatarMeta(name || "");

  return (
    <View
      className="rounded-[24px] bg-white p-5"
      style={{
        borderWidth: 1,
        borderColor: "#E3E8EF",
        shadowColor: "#0F172A",
        shadowOpacity: 0.03,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
    >
      <View className={isTablet ? "flex-row items-center" : "items-center"}>
        <View
          className={`items-center justify-center rounded-full border ${bg}`}
          style={{
            width: isTablet ? 96 : 88,
            height: isTablet ? 96 : 88,
            borderColor: "#E5E7EB",
          }}
        >
          <Text
            className={`font-bold ${text}`}
            style={{
              fontSize: isTablet ? 30 : 28,
              letterSpacing: 0.4,
            }}
          >
            {initials}
          </Text>
        </View>

        <View className={isTablet ? "ml-5 flex-1" : "mt-5 items-center"}>
          <Text className="text-[22px] font-semibold text-neutral-900">
            {name || "User"}
          </Text>

          <View
            className="mt-2 rounded-full w-20 items-center bg-neutral-100 px-3 py-1.5"
            style={{
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text className="text-[13px] font-medium capitalize text-neutral-600">
              {role || "No role"}
            </Text>
          </View>
        </View>
      </View>

      <View className={isTablet ? "mt-6 flex-row gap-3" : "mt-6 gap-3"}>
        <View style={{ flex: 1 }}>
          <InfoBlock label="Email" value={email} />
        </View>
        <View style={{ flex: 1 }}>
          <InfoBlock label="Employee ID" value={employeeId} />
        </View>
      </View>
    </View>
  );
};

export default ProfileSummaryCard;
