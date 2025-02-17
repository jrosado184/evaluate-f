import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import "../global.css";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";

interface FormFieldProps {
  title?: string;
  value?: any;
  handleChangeText?: any;
  keyboadtype?: string;
  styles?: string;
  placeholder?: string;
  rounded?: string;
  inputStyles?: string;
  icon?: any;
  optional?: boolean;
}
/**
 * Form fields that take props.
 *
 * @param {string} inputStyles - Styles for the input box
 * @param {string} title - Title for input label
 * @param {string} value - Input value
 * @param {string} handleChangeText - Function that triggers the inputs onChange
 * @param {string} styles - Parent container styles
 * @param {string} placeholder - Placeholder text
 * @param {string} icon - Icon
 * @param {string} rounded - Rounded styles
 */

const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  handleChangeText,
  styles,
  placeholder,
  rounded,
  inputStyles,
  icon,
  optional,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`space-y-2 gap-2 ${styles}`}>
      <Text className="text-base font-inter-medium">
        {title}{" "}
        {optional && <Text className="text-neutral-400">(Optional)</Text>}
      </Text>
      <View
        className={`border border-gray-400 w-full h-16 flex-row items-center ${rounded}`}
      >
        {icon && <View className="pl-4">{icon}</View>}
        <TextInput
          className={`font-inter-semibold flex-1 ${inputStyles}`}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#929292"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
        />
        {title === "Password" && (
          <TouchableOpacity
            className="pr-4"
            onPress={() => {
              setShowPassword(!showPassword);
            }}
          >
            {!showPassword ? (
              <AntDesign name="eye" size={15} color="black" />
            ) : (
              <Entypo name="eye-with-line" size={15} color="black" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
