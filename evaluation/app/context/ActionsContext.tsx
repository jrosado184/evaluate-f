import React, { createContext, useState, useContext, ReactNode } from "react";

type Actions = {};

// Define the context type
type ActionsContextType = {
  actionsMessage: any;
  setActionsMessage: (actionMessage: any) => void;
};

// Create the context
const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

// Provider component
export const ActionsProvider = ({ children }: { children: ReactNode }) => {
  const [actionsMessage, setActionsMessage] = useState<Actions | null>();

  return (
    <ActionsContext.Provider
      value={{
        actionsMessage,
        setActionsMessage,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
};

// Hook to use the context
const useActionContext = () => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error("useActionContext must be used within an AuthContext");
  }
  return context;
};

export default useActionContext;
