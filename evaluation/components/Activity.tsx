import { View, Text, Image, ImageSourcePropType } from "react-native";
import React from "react";
import { avatar_url } from "@/constants/links";

interface ActivityTypes {
  Icon?: ImageSourcePropType;
  name: string;
  title: string;
}

const Activity: React.FC<ActivityTypes> = ({ Icon, name, title }) => {
  return (
    <View className="my-3">
      <View className="border border-[#616161] w-full h-[4.5rem] rounded-lg flex-row">
        <View className="w-10 h-10 border border-black rounded-full m-3">
          <Image
            className="w-full h-full rounded-full bg-black"
            resizeMode="contain"
            source={
              Icon || {
                uri: avatar_url,
              }
            }
          />
        </View>
        <View className="my-3">
          <Text className="font-inter-regular text-gray-700">{name}</Text>
          <Text className="font-inter-medium">{title}</Text>
        </View>
      </View>
    </View>
  );
};

export default Activity;
