import React from "react";
import { Tabs, Redirect } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import HomeIcon from "@/constants/icons/HomeIcon";
import UsersIcon from "@/constants/icons/UsersIcon";
import LockIcon from "@/constants/icons/LockIcon";
import ProfileIcon from "@/constants/icons/ProfileIcon";

interface TabIconTypes {
  icon: React.ReactElement;
  color: string;
  icon_name: string;
  focused?: boolean;
}

const TabIcon: React.FC<TabIconTypes> = ({
  icon,
  color,
  icon_name,
  focused,
}) => {
  return (
    <View className="items-center justify-center gap-1">
      {React.cloneElement(icon)}
      <Text
        className={`${
          focused
            ? "font-inter-semibold text-[#323FC1]"
            : "font-inter-regular text-[#B4B4B4]"
        } text-sm`}
      >
        {icon_name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            paddingBottom: 20,
            paddingTop: 10,
            height: 90,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Home"
                icon={
                  <HomeIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#323FC1" : "#B4B4B4"}
                    strokeColor={focused ? "#323FC1" : "#B4B4B4"}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Users"
                icon={
                  <UsersIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#323FC1" : "#B4B4B4"}
                    strokeColor={focused ? "#323FC1" : "#B4B4B4"}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="lockers"
          options={{
            title: "Lockers",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Lockers"
                icon={
                  <LockIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#323FC1" : "#B4B4B4"}
                    strokeColor={focused ? "#323FC1" : "#B4B4B4"}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Profile"
                icon={
                  <ProfileIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#323FC1" : "#B4B4B4"}
                    strokeColor={focused ? "#323FC1" : "#B4B4B4"}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
