import React, { useState, createContext, useContext, useRef } from "react";
import { Animated } from "react-native";
import { Tabs, useNavigation } from "expo-router";
import HomeIcon from "@/constants/icons/HomeIcon";
import UsersIcon from "@/constants/icons/UsersIcon";
import LockIcon from "@/constants/icons/LockIcon";
import ProfileIcon from "@/constants/icons/ProfileIcon";
import { TabIcon } from "@/components/navigation/TabBarIcon";

// Create a context for tab bar visibility
const TabBarContext = createContext({
  isTabBarVisible: true,
  setIsTabBarVisible: (visible: boolean) => {},
  scrollY: new Animated.Value(0), // Track scroll position
});

export const useTabBar = () => useContext(TabBarContext);

const TabsLayout = () => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Faster animation for hiding
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 90],
    extrapolate: "clamp",
  });

  const tabBarOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [4, 0],
    extrapolate: "clamp",
  });

  return (
    <TabBarContext.Provider
      value={{ isTabBarVisible, setIsTabBarVisible, scrollY }}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: isTabBarVisible ? 0 : -100,
            width: "100%",
            transform: [{ translateY: tabBarTranslateY }],
            opacity: tabBarOpacity,
            height: 90,
            paddingBottom: 20,
            paddingTop: 19,
            display: isTabBarVisible ? "flex" : "none",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }: any) => (
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
            tabBarIcon: ({ color, focused }: any) => (
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
            tabBarIcon: ({ color, focused }: any) => (
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
            tabBarIcon: ({ color, focused }: any) => (
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
    </TabBarContext.Provider>
  );
};

export default TabsLayout;
