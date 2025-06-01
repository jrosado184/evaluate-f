import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import ErrorText from "./ErrorText";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface FormFieldProps {
  title?: string;
  value?: any;
  handleChangeText?: any;
  keyboardType?: any;
  styles?: string;
  placeholder?: string;
  rounded?: string;
  inputStyles?: string;
  icon?: any;
  optional?: boolean;
  secure?: boolean;
  editable?: boolean;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  handleChangeText,
  keyboardType = "default",
  styles = "",
  placeholder,
  rounded = "rounded-md",
  inputStyles = "",
  icon,
  optional,
  secure = false,
  editable = true,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = title?.toLowerCase() === "password";

  return (
    <View className={`space-y-2 ${styles}`}>
      <Text className="text-base font-semibold text-gray-800">
        {title}{" "}
        {optional && <Text className="text-neutral-400">(Optional)</Text>}
      </Text>
      <View
        className={`w-full h-14 flex-row items-center px-4 ${
          error ? "border border-red-500" : "border border-gray-300"
        } ${rounded} ${!editable && "bg-gray-50"}`}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className={`flex-1 text-gray-500 ${
            editable && "text-gray-900"
          } ${inputStyles} placeholder:text-gray-700`}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          style={{
            textAlignVertical: "center",
          }}
        />
        {isPassword && (
          <SinglePressTouchable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <Entypo name="eye-with-line" size={18} color="#6b7280" />
            ) : (
              <AntDesign name="eye" size={18} color="#6b7280" />
            )}
          </SinglePressTouchable>
        )}
      </View>
      {error && <ErrorText title={error} hidden={!error} />}
    </View>
  );
};

export default FormField;
