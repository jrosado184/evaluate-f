import React, { useState, useRef, useEffect } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/SlideUpModal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import { router } from "expo-router";
import useGetJobs from "@/app/requests/useGetJobs";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useSelect from "@/hooks/useSelect";
import Error from "@/components/ErrorText";
import useAddUser from "@/hooks/useAddUser";
import useActionContext from "@/app/context/ActionsContext";
import updateEmployee from "@/app/requests/updateEmployee";
import useValidation from "@/app/validation/useValidation";
import SinglePressTouchable from "@/app/utils/SinglePress";

const UpdateUser = () => {
  const { setSelectedValue } = useSelect();
  const {
    errors,
    setErrors,
    handleEmployeeInfo,
    options,
    modalVisible,
    setModalVisible,
  } = useAddUser();
  const { fetchJobs } = useGetJobs();
  const { setActionsMessage } = useActionContext();
  const { newErrors } = useValidation(errors);

  const [loading, setLoading] = useState(false);

  const {
    employee,
    addEmployeeInfo,
    setAddEmployeeInfo,
    setSuccessfullyAddedEmployee,
  } = useEmployeeContext();

  const currentEmployeeData = useRef(employee);

  useEffect(() => {}, [addEmployeeInfo]);

  const handleUpdateRequest = async () => {
    setErrors(newErrors);
    const hasChanges =
      JSON.stringify(currentEmployeeData.current) !==
      JSON.stringify(addEmployeeInfo);

    if (!hasChanges) {
      setActionsMessage("No changes made");
      setSuccessfullyAddedEmployee(true);
      router.replace("/(tabs)/users");
      return;
    }

    setLoading(true);
    await updateUser();
  };

  const updateUser = async () => {
    try {
      const { _id, ...updateData } = addEmployeeInfo;
      const response = await updateEmployee(updateData, _id);

      if (
        response.status === 400 &&
        response.data.message === "Employee with that ID already exists"
      ) {
        setErrors({
          existing_employee: "Employee with that ID already exists",
        });
      } else if (response.status === 201) {
        setActionsMessage("Updated user successfully");
        setSuccessfullyAddedEmployee(true);
        router.replace("/(tabs)/users");
      }
    } catch (error) {
      console.error("Update error:", error);
      setActionsMessage("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-6">
      <SinglePressTouchable
        onPress={router.back}
        className="flex-row h-10 items-center"
      >
        <Icon name="chevron-left" size={29} />
        <Text className="text-[1.3rem]">Edit user</Text>
      </SinglePressTouchable>

      <View className="w-full gap-8 my-4">
        {/* Name */}
        <View className={errors.employee_id && "h-28"}>
          <FormField
            value={addEmployeeInfo.employee_name}
            title="Name"
            placeholder="Enter name"
            rounded="rounded-[0.625rem]"
            handleChangeText={(value: any) =>
              handleEmployeeInfo("employee_name", value)
            }
          />
          <Error hidden={!errors.employee_name} title={errors.employee_name} />
        </View>

        {/* ID Number */}
        <View className={errors.employee_id && "h-28"}>
          <FormField
            value={String(addEmployeeInfo?.employee_id || "")}
            title="ID Number"
            placeholder="Enter ID number"
            rounded="rounded-[0.625rem]"
            handleChangeText={(value: any) =>
              handleEmployeeInfo(
                "employee_id",
                /^\d+$/.test(value) ? parseInt(value, 10) : ""
              )
            }
          />
          <Error hidden={!errors.employee_id} title={errors.employee_id} />
        </View>

        {/* Position */}
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

        {/* Location */}
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

        {/* Locker Number */}
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

        {/* Save Button */}
        <View className="w-full items-center">
          <Button
            isLoading={loading}
            handlePress={handleUpdateRequest}
            title="Save"
            styles="my-8 w-full rounded-[0.625rem]"
            inputStyles="w-full"
          />
        </View>
      </View>

      <SlideUpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default UpdateUser;
