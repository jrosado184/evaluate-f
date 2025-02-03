import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/SlideUpModal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import { router } from "expo-router";
import useJobsContext from "@/app/context/JobsContext";
import useGetJobs from "@/app/requests/useGetJobs";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";
import useSelect from "@/hooks/useSelect";
import addEmployee from "@/app/requests/addEmployee";
import Error from "@/components/Error";
import useValidation from "@/app/validation/useValidation";

const AddUser = () => {
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
  const { setSelectedValue } = useSelect();

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEmployeeInfo = (field: string, value: any) => {
    setAddEmployeeInfo({
      ...addEmployeeInfo,
      assigned_by: currentUser.name,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: "",
      existing_employee: "",
    });
  };

  const handleAddUser = async () => {
    console.log("hi");
    setLoading(true);
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      setLoading(false);
      return;
    }
    const result = await addEmployee(addEmployeeInfo);
    if (
      result.status === 400 &&
      result.data.message === "Employee already exists"
    ) {
      setErrors({
        existing_employee: "Employee already exists",
      });
    }
    if (result.status === 201) {
      setLoading(false);
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

  //When locker is selected and user is added remove locker from available lockers

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

  return (
    <SafeAreaView className="bg-white h-full p-6">
      <TouchableOpacity
        onPress={router.back}
        className="flex-row h-10 items-center"
      >
        <Icon name="chevron-left" size={29} />
        <Text className="text-[1.3rem]">Add user</Text>
      </TouchableOpacity>
      <View className="w-full gap-8 my-4">
        <View className={errors.employee_id && "h-28"}>
          <FormField
            title="Name"
            inputStyles="pl-4"
            placeholder="Enter name"
            rounded="rounded-[0.625rem]"
            handleChangeText={(value: any) =>
              handleEmployeeInfo("employee_name", value)
            }
          />
          <Error hidden={!errors.employee_name} title={errors.employee_name} />
        </View>
        <View className={errors.employee_id && "h-28"}>
          <FormField
            title="ID Number"
            inputStyles="pl-4"
            placeholder="Enter ID number"
            rounded="rounded-[0.625rem]"
            handleChangeText={(value: any) =>
              handleEmployeeInfo(
                "employee_id",
                typeof value === "number" ? value : parseInt(value)
              )
            }
          />
          <Error hidden={!errors.employee_id} title={errors.employee_id} />
        </View>
        <View className={errors.position && "h-28"}>
          <SelectField
            title="Position"
            placeholder="Select Position"
            options={options}
            onSelect={(value: { position: string; department: string }) => {
              setAddEmployeeInfo((prev: any) => ({
                ...prev,
                position: value.position,
                department: value.department,
              }));
              setErrors((prev: any) => ({
                ...prev,
                position: "",
              }));
            }}
            selectedValue={addEmployeeInfo?.position}
            loadData={fetchJobs}
          />
          <Error hidden={!errors.position} title={errors.position} />
        </View>
        <SelectField
          title="Location"
          placeholder="Select Locker Location"
          options={[
            { label: "Fabrication Womens B", value: "Fabrication Womens B" },
            { label: "Fabrication Mens B", value: "Fabrication Mens B" },
          ]}
          onSelect={(value: any) => {
            setAddEmployeeInfo((prev: any) => ({
              ...prev,
              location: value,
              locker_number: null,
            }));
          }}
          selectedValue={addEmployeeInfo?.location}
        />
        <View className={errors.existing_employee && "h-28"}>
          <SelectField
            title="Locker Number"
            placeholder="Select Locker"
            onSelect={(value: any) => {
              setSelectedValue(parseInt(value));
              setAddEmployeeInfo((prev: any) => ({
                ...prev,
                locker_number:
                  typeof value === "number" ? value : parseInt(value),
              }));
            }}
            selectedValue={addEmployeeInfo?.locker_number}
            toggleModal={() => setModalVisible(true)}
          />
          <Error
            hidden={!errors.locker_number && !errors.existing_employee}
            title={errors.locker_number || errors.existing_employee}
          />
        </View>
        <View>
          <View className="w-full items-center">
            <Button
              isLoading={loading}
              handlePress={handleAddUser}
              title="Add User"
              styles="my-8 w-full rounded-[0.625rem]"
              inputStyles="w-full"
            />
          </View>
        </View>
      </View>
      <SlideUpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AddUser;
