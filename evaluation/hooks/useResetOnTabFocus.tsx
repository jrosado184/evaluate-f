import { useCallback } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";

const useResetOnTabFocus = (tabName: string, rootScreenName: string) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const state = navigation.getState();
      const isNestedInStack = state.routes[state.index]?.state?.index > 0;

      if (isNestedInStack && route.name === tabName) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: rootScreenName }],
          })
        );
      }
    }, [navigation, route.name, tabName, rootScreenName])
  );
};

export default useResetOnTabFocus;
