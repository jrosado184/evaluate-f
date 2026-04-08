import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import PasswordField from "./PasswordField";
import SinglePressTouchable from "@/app/utils/SinglePress";

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  passwords: PasswordState;
  setPasswords: React.Dispatch<React.SetStateAction<PasswordState>>;
  showCurrentPassword: boolean;
  setShowCurrentPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPassword: boolean;
  setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
};

const ChangePasswordCard = ({
  passwords,
  setPasswords,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
}: Props) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
      <View className="mb-4 flex-row items-center">
        <View className="rounded-2xl bg-[#F3F5F8] p-2.5">
          <Icon name="lock" size={18} color="#171717" />
        </View>
        <Text className="ml-3 text-[16px] font-semibold text-neutral-900">
          Change Password
        </Text>
      </View>

      <View className={isTablet ? "gap-3" : "gap-3"}>
        <PasswordField
          label="Current Password"
          value={passwords.currentPassword}
          onChangeText={(text) =>
            setPasswords((prev) => ({ ...prev, currentPassword: text }))
          }
          secureTextEntry={!showCurrentPassword}
          onToggle={() => setShowCurrentPassword((prev) => !prev)}
        />

        <View className={isTablet ? "flex-row gap-3" : "gap-3"}>
          <View style={{ flex: 1 }}>
            <PasswordField
              label="New Password"
              value={passwords.newPassword}
              onChangeText={(text) =>
                setPasswords((prev) => ({ ...prev, newPassword: text }))
              }
              secureTextEntry={!showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
            />
          </View>

          <View style={{ flex: 1 }}>
            <PasswordField
              label="Confirm Password"
              value={passwords.confirmPassword}
              onChangeText={(text) =>
                setPasswords((prev) => ({ ...prev, confirmPassword: text }))
              }
              secureTextEntry={!showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          </View>
        </View>
      </View>

      <SinglePressTouchable
        onPress={onSubmit}
        className="mt-5 items-center justify-center rounded-[18px] bg-neutral-900 py-4"
      >
        <Text className="text-[15px] font-semibold text-white">
          Update Password
        </Text>
      </SinglePressTouchable>
    </View>
  );
};

export default ChangePasswordCard;
