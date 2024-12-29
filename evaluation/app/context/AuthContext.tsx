import React, { createContext, useState, useContext, ReactNode } from "react";

type User = {
  _id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  createdBy: string;
  createdAt: string;
  updatedAt: any;
};

// Define the context type
type AuthContextType = {
  currentUser: any;
  setCurrentUser: (currentUser: any) => void;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    _id: "",
    name: "",
    employee_id: "",
    email: "",
    role: "",
    createdBy: "",
    createdAt: "",
    updatedAt: "",
  });

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the context
const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContext");
  }
  return context;
};

export default useAuthContext;
