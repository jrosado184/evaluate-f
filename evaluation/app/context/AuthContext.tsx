import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  _id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  createdBy: string;
  createdAt: string;
  updatedAt: any;
  token?: string;
};

type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: (currentUser: User | null) => void;
  isAuthLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUser");

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("currentUser");
      await AsyncStorage.removeItem("token");
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default useAuthContext;
