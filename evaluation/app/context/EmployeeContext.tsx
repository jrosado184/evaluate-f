import React, { createContext, useState, useContext, ReactNode } from "react";
import formatISODate from "../conversions/ConvertIsoDate";

type Employee = {
  _id: string;
  employee_name: string;
  locker_number: string;
  employee_id: number;
  knife_number: string | null;
  department: string;
  position: string;
  assigned_by: string;
  last_updated: string;
};

// Define the context type
type EmployeeContextType = {
  loading: any;
  employee: Employee | undefined;
  addEmployeeInfo: Employee | undefined | any;
  employees: Employee[];
  locker: any;
  lockers: any;
  userDetails: any;
  lockerDetails: any;
  sortingBy: string;
  successfullyAddedEmployee: any;
  setLoading: (loading: boolean) => void;
  setEmployee: (employee: Employee) => void;
  setAddEmployeeInfo: (addEmployeeInfo: any) => void;
  setLocker: (locker: any) => void;
  setEmployees: (employees: any) => void;
  setLockers: (lockers: any) => void;
  setLockerDetails: (lockers: any) => void;
  setUserDetails: (userDetails: any) => void;
  setSortingBy: (sortingBy: string) => void;
  setSuccessfullyAddedEmployee: (successfullyAddedEmployee: boolean) => void;
};

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

// Provider component
export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<any>([]);
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [addEmployeeInfo, setAddEmployeeInfo] = useState<any>({
    employee_name: "",
    locker_number: null,
    employee_id: null,
    department: "",
    position: "",
    knife_number: "N/A",
    added_by: "",
    last_updated: formatISODate(Date.now()),
    createdAt: formatISODate(Date.now()),
  });
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
  const [sortingBy, setSortingBy] = useState("Default");
  const [successfullyAddedEmployee, setSuccessfullyAddedEmployee] =
    useState<boolean>(false);

  return (
    <EmployeeContext.Provider
      value={{
        loading,
        employee,
        addEmployeeInfo,
        setAddEmployeeInfo,
        employees,
        locker,
        lockers,
        lockerDetails,
        userDetails,
        sortingBy,
        successfullyAddedEmployee,
        setLoading,
        setEmployee,
        setLocker,
        setLockers,
        setLockerDetails,
        setEmployees,
        setUserDetails,
        setSortingBy,
        setSuccessfullyAddedEmployee,
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
