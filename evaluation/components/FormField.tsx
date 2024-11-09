import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import "../global.css";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";

interface FormFieldProps {
  title?: string;
  value: string;
  handleChangeText: any;
  keyboadtype?: string;
  styles?: string;
  placeholder: string;
  rounded?: string;
  inputStyles?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  handleChangeText,
  styles,
  placeholder,
  rounded,
  inputStyles,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`space-y-2 gap-2 ${styles}`}>
      <Text className="text-base font-inter-medium">{title}</Text>
      <View
        className={`border border-gray-400 w-full h-16 flex-row items-center ${rounded}`}
      >
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
