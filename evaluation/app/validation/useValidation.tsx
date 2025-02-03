import useEmployeeContext from "../context/EmployeeContext";

const useValidation = (errors: any) => {
  const { addEmployeeInfo } = useEmployeeContext();

  const addEmployeeValidation: any = [
    { key: "employee_name", message: "Employee name is required" },
    { key: "employee_id", message: "Employee ID is required" },
    { key: "position", message: "Employee position is required" },
    {
      key: "locker_number",
      condition:
        typeof addEmployeeInfo !== "object" &&
        addEmployeeInfo?.location &&
        !addEmployeeInfo.locker_number,
      message: "Employee locker number is required",
    },
  ];
  const newErrors: Record<string, string> = { ...errors };

  addEmployeeValidation.forEach(
    ({ key, condition = !addEmployeeInfo?.[key], message }: any) => {
      if (condition) {
        newErrors[key] = message;
      }
    }
  );
  return { newErrors };
};

export default useValidation;
