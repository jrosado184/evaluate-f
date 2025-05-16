const usePersonalInfoValidation = (formData: Record<string, string>) => {
  const requiredFields = [
    { key: "trainingType", message: "Training type is required" },
    { key: "teamMemberName", message: "Team member name is required" },
    { key: "employeeId", message: "Employee ID is required" },
    { key: "hireDate", message: "Hire date is required" },
    { key: "jobTitle", message: "Job title is required" },
    { key: "department", message: "Department is required" },
    { key: "lockerNumber", message: "Locker number is required" },
    { key: "jobStartDate", message: "Job start date is required" },
    {
      key: "projectedTrainingHours",
      message: "Projected training hours are required",
    },
    {
      key: "projectedQualifyingDate",
      message: "Projected qualifying date is required",
    },
  ];

  const newErrors: Record<string, string> = {};

  requiredFields.forEach(({ key, message }) => {
    if (!formData[key] || formData[key].trim() === "") {
      newErrors[key] = message;
    }
  });

  return { newErrors };
};

export default usePersonalInfoValidation;
