import React, { useEffect, useState } from "react";
import useJobsContext from "@/app/context/JobsContext";
import useGetJobs from "@/app/requests/useGetJobs";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useValidation from "@/app/validation/useValidation";
import useAuthContext from "@/app/context/AuthContext";
import addEmployee from "@/app/requests/addEmployee";
import { router, useNavigation } from "expo-router";
import useActionContext from "@/app/context/ActionsContext";

const useAddUser = () => {
  const { jobs } = useJobsContext();
  const { fetchJobs } = useGetJobs();
  const [options, setOptions] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState<any>({
    employee_name: "",
    employee_id: "",
    position: "",
    locker_number: "",
    existing_employee: "",
  });
  const {
    setAddEmployeeInfo,
    addEmployeeInfo,
    setEmployees,
    setSuccessfullyAddedEmployee,
    successfullyAddedEmployee,
    loading,
    setLoading,
  } = useEmployeeContext();
  const { newErrors } = useValidation(errors);
  const { currentUser } = useAuthContext();
  const { setActionsMessage } = useActionContext();

  const navigation: any = useNavigation();

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEmployeeInfo = (field: string, value: any) => {
    setAddEmployeeInfo({
      ...addEmployeeInfo,
      added_by: currentUser.name,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: "",
      existing_employee: "",
    });
  };

  const handleAddUser = async () => {
    setLoading(true);
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      setLoading(false);
      return;
    }
    const result = await addEmployee(addEmployeeInfo);
    if (
      result.status === 400 &&
      result.data.message === "Employee with that ID already exists"
    ) {
      setErrors({
        existing_employee: "Employee with that ID already exists",
      });
    }
    if (result.status === 201) {
      setLoading(false);
      setActionsMessage("Added user successfully");
      router.replace("/(tabs)/users");
      setEmployees(result.data);
      if (!loading) setSuccessfullyAddedEmployee(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    //sets the positions structure
    if (jobs && jobs.length > 0) {
      setOptions(
        jobs.map((job: any) => ({
          label: job.name,
          value: job.name,
          children: job.positions.map((position: string) => ({
            label: position,
            value: position,
            department: job.name,
          })),
        }))
      );
    }
  }, [jobs]);

  useEffect(() => {
    return () => {
      setAddEmployeeInfo({});
    };
  }, [setAddEmployeeInfo]);

  useEffect(() => {
    setLoading(false);
    if (successfullyAddedEmployee) {
      const timer = setTimeout(() => {
        setSuccessfullyAddedEmployee(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successfullyAddedEmployee]);
  return {
    options,
    modalVisible,
    setModalVisible,
    errors,
    setErrors,
    handleAddUser,
    handleEmployeeInfo,
  };
};

export default useAddUser;
