import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { Animated, Easing } from "react-native";
import { Tabs } from "expo-router";
import HomeIcon from "@/constants/icons/HomeIcon";
import UsersIcon from "@/constants/icons/UsersIcon";
import LockIcon from "@/constants/icons/LockIcon";
import ProfileIcon from "@/constants/icons/ProfileIcon";
import { TabIcon } from "@/components/navigation/TabBarIcon";

export const unstable_settings = {
  initialRouteName: "home",
};

const TabBarContext = createContext({
  isTabBarVisible: true,
  setIsTabBarVisible: (visible: boolean) => {},
  scrollY: 0,
});

export const useTabBar = () => useContext(TabBarContext);

export default function TabsLayout() {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(tabBarTranslate, {
      toValue: isTabBarVisible ? 0 : 100,
      duration: 145,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <TabBarContext.Provider
      value={{ isTabBarVisible, setIsTabBarVisible, scrollY: 0 }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: "absolute",
            transform: [{ translateY: tabBarTranslate }],
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Home"
                icon={
                  <HomeIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#1a237e" : "#B4B4B4"}
                    strokeColor={focused ? "#1a237e" : "#B4B4B4"}
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Users"
                icon={
                  <UsersIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#1a237e" : "#B4B4B4"}
                    strokeColor={focused ? "#1a237e" : "#B4B4B4"}
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Lockers"
                icon={
                  <LockIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#1a237e" : "#B4B4B4"}
                    strokeColor={focused ? "#1a237e" : "#B4B4B4"}
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Profile"
                icon={
                  <ProfileIcon
                    width={32}
                    height={32}
                    fillColor={focused ? "#1a237e" : "#B4B4B4"}
                    strokeColor={focused ? "#1a237e" : "#B4B4B4"}
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
}
