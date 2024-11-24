import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the employee type
type Employee = {
  _id: string;
  employee_name: string;
  locker_number: number;
  employee_id: number;
  knife_number: number | null;
  department: string;
  position: string;
  assigned_by: string;
  history: any[];
  last_updated: string;
};

// Define the context type
type EmployeeContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => boolean;
  employee: Employee | undefined;
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updateData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  setEmployee: (employee: Employee) => void;
  setEmployees: (employees: Employee[]) => void;
};

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

// Provider component
export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [loading, setLoading] = useState<boolean>();

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  };

  const updateEmployee = (id: string, updateData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee._id === id ? { ...employee, ...updateData } : employee
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee._id !== id));
  };

  return (
    <EmployeeContext.Provider
      value={{
        loading,
        setLoading,
        employee,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        setEmployees,
        setEmployee,
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
