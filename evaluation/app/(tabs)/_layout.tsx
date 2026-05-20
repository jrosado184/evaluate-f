import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { Animated, Easing } from "react-native";
import { router, Tabs, usePathname } from "expo-router";
import HomeIcon from "@/constants/icons/HomeIcon";
import UsersIcon from "@/constants/icons/UsersIcon";
import JSAIcon from "@/constants/icons/JSAIcon";
import EvaluationsIcon from "@/constants/icons/EvaluationIcon";
import { TabIcon } from "@/components/navigation/TabBarIcon";

export const unstable_settings = {
  initialRouteName: "home",
};

const TabBarContext = createContext({
  isTabBarVisible: true,
  setIsTabBarVisible: (_visible: boolean) => {},
  scrollY: 0,
});

export const useTabBar = () => useContext(TabBarContext);

const ACTIVE_COLOR = "#1a237e";
const INACTIVE_COLOR = "#B4B4B4";

export default function TabsLayout() {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();

  useEffect(() => {
    Animated.timing(tabBarTranslate, {
      toValue: isTabBarVisible ? 0 : 100,
      duration: 145,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible, tabBarTranslate]);

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
                    fillColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    strokeColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="users"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              if (pathname !== "/users") {
                router.replace("/(tabs)/users");
              }
            },
          }}
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
                    fillColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    strokeColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="jsas"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              if (pathname !== "/jsas") {
                router.replace("/(tabs)/jsas");
              }
            },
          }}
          options={{
            title: "JSAs",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="JSAs"
                icon={
                  <JSAIcon
                    width={32}
                    height={32}
                    fillColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    strokeColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                }
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="evaluations"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              if (pathname !== "/evaluations") {
                router.replace("/(tabs)/evaluations");
              }
            },
          }}
          options={{
            title: "Evaluations",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                icon_name="Evaluations"
                icon={
                  <EvaluationsIcon
                    width={32}
                    height={32}
                    fillColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    strokeColor={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
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
