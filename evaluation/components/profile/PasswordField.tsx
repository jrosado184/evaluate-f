import React from "react";
import { View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  onToggle: () => void;
};

const PasswordField = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  onToggle,
}: PasswordFieldProps) => {
  return (
    <View
      className="rounded-[18px] bg-[#FAFBFC] px-4 py-3"
      style={{
        borderWidth: 1,
        borderColor: "#E3E8EF",
      }}
    >
      <Text className="mb-2 text-[12px] font-medium text-neutral-500">
        {label}
      </Text>

      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#A3A3A3"
          className="flex-1 text-[15px] font-semibold text-neutral-900"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SinglePressTouchable onPress={onToggle} className="ml-3">
          <Icon
            name={secureTextEntry ? "eye-off" : "eye"}
            size={18}
            color="#737373"
          />
        </SinglePressTouchable>
      </View>
    </View>
  );
};

export default PasswordField;
