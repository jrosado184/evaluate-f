import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import React from "react";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";
import { useTabBar } from "@/app/(tabs)/_layout";
import { useRouter } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";

type FabProps = {
  icon: string;
  route?: string;
  onPress?: () => void;
};

const Fab = ({ icon, route, onPress }: FabProps) => {
  const { loading } = useEmployeeContext();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();

  const bottomPosition = useRef(
    new Animated.Value(isTabBarVisible ? 150 : 82),
  ).current;

  useEffect(() => {
    Animated.timing(bottomPosition, {
      toValue: isTabBarVisible ? 150 : 82,
      duration: 145,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [bottomPosition, isTabBarVisible]);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (route) {
      router.push(`/${route}` as any);
    }
  };

  if (loading) return null;

  return (
    <Animated.View style={[styles.fabContainer, { bottom: bottomPosition }]}>
      <SinglePressTouchable
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.fabButton}
      >
        <Icon name={icon} size={19} color="white" />
      </SinglePressTouchable>
    </Animated.View>
  );
};

export default Fab;

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 28,
    zIndex: 999,
    elevation: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
});
