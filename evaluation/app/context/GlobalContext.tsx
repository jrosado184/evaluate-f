import React, { createContext, useState, useContext, ReactNode } from "react";

type Employee = {
  _id: string;
  employee_name: string;
  locker_number: string;
  employee_id: string;
  knife_number: string | null;
  department: string;
  position: string;
  assigned_by: string;
  history: any[];
  last_updated: string;
};

type Locker = {
  _id: string;
  assigned_to: string;
  locker_number: string;
  employee_id: string;
  knife_number: string | null;
  department: string;
  position: string;
  assigned_by: string;
  history: any[];
  last_updated: string;
  status: string;
  vacant: boolean;
};

// Define the context type
type EmployeeContextType = {
  loading: any;
  employee: Employee | undefined;
  employees: Employee[];
  locker: any;
  lockers: any;
  userDetails: any;
  lockerDetails: any;
  setLoading: (loading: boolean) => void;
  setEmployee: (employee: Employee) => void;
  setLocker: (locker: any) => void;
  setEmployees: (employees: any) => void;
  setLockers: (lockers: any) => void;
  setLockerDetails: (lockers: any) => void;
  setUserDetails: (userDetails: any) => void;
};

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

// Provider component
export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<any>([]);
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [locker, setLocker] = useState();
  const [lockers, setLockers] = useState<any>();
  const [loading, setLoading] = useState<boolean | null>();
  const [userDetails, setUserDetails] = useState<any>({
    totalPages: null,
    totalUsers: null,
    currentPage: null,
  });
  const [lockerDetails, setLockerDetails] = useState({
    totalPages: null,
    totalUsers: null,
    currentPage: null,
  });

  return (
    <EmployeeContext.Provider
      value={{
        loading,
        employee,
        employees,
        locker,
        lockers,
        lockerDetails,
        userDetails,
        setLoading,
        setEmployee,
        setLocker,
        setLockers,
        setLockerDetails,
        setEmployees,
        setUserDetails,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// Hook to use the context
const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error(
      "useEmployeeContext must be used within an EmployeeProvider"
    );
  }
  return context;
};

export default useEmployeeContext;
