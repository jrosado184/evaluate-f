import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { Animated, Easing } from "react-native";
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
  // When visible, translateY is 0; when hidden, translateY is 100 (adjust as needed).
  const tabBarTranslate = useRef(
    new Animated.Value(isTabBarVisible ? 0 : 100)
  ).current;

  useEffect(() => {
    Animated.timing(tabBarTranslate, {
      toValue: isTabBarVisible ? 0 : 100,
      duration: 145,
      useNativeDriver: true, // transform properties support the native driver
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [isTabBarVisible, tabBarTranslate]);

  return (
    <TabBarContext.Provider
      value={{ isTabBarVisible, setIsTabBarVisible, scrollY: 0 }}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            // Apply the animated translateY instead of bottom
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
