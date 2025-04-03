import React, { useState, createContext, useContext } from "react";
import { Tabs } from "expo-router";
import HomeIcon from "@/constants/icons/HomeIcon";
import UsersIcon from "@/constants/icons/UsersIcon";
import LockIcon from "@/constants/icons/LockIcon";
import ProfileIcon from "@/constants/icons/ProfileIcon";
import { TabIcon } from "@/components/navigation/TabBarIcon";

// Create a context for tab bar visibility
const TabBarContext = createContext({
  isTabBarVisible: true,
  setIsTabBarVisible: (visible: boolean) => {},
  scrollY: 0,
});

export const useTabBar = () => useContext(TabBarContext);

const TabsLayout = () => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const scrollY = 0;

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
            opacity: isTabBarVisible ? 1 : 0,
            height: 90,
            paddingBottom: 20,
            paddingTop: 19,
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
