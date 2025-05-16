import { useEffect, useRef } from "react";
import { TouchableOpacity, Animated, Easing, StyleSheet } from "react-native";
import React from "react";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";
import { useTabBar } from "@/app/(tabs)/_layout";
import { useRouter } from "expo-router";

const Fab = ({ icon, route }: any) => {
  const { loading } = useEmployeeContext();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();

  const bottomPosition = useRef(
    new Animated.Value(isTabBarVisible ? 150 : 82)
  ).current;

  useEffect(() => {
    Animated.timing(bottomPosition, {
      toValue: isTabBarVisible ? 150 : 82,
      duration: 145,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // ❗ Important: must be false because we are animating `bottom`
    }).start();
  }, [isTabBarVisible]);

  return (
    <>
      {!loading && (
        <Animated.View
          style={[styles.fabContainer, { bottom: bottomPosition }]}
        >
          <TouchableOpacity
            onPress={() => router.push(`/${route}`)}
            activeOpacity={0.8}
            style={styles.fabButton}
          >
            <Icon name={icon} size={19} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
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
