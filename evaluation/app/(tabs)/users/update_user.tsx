import React, { useState, useEffect, Ref, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import getUser from "@/app/requests/getUser";
import LoadingCircle from "@/components/LoadingCircle";
import useActionContext from "@/app/context/ActionsContext";
import updateEmployee from "@/app/requests/updateEmployee";
import useValidation from "@/app/validation/useValidation";

const update_user = () => {
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

  const { _id, ...rest } = addEmployeeInfo;

  const currentEmployeeData = useRef(employee);

  const handleUpdateRequest = async () => {
    setLoading(true);
    setErrors(newErrors);
    const userHasMadeChanges =
      JSON.stringify(currentEmployeeData.current) !==
      JSON.stringify(addEmployeeInfo);
    if (userHasMadeChanges) {
      await updateUser();
    } else {
      router.replace("/(tabs)/users");
      if (!loading) setSuccessfullyAddedEmployee(true);
      setActionsMessage("No changes made");
    }
  };

  console.log(addEmployeeInfo);

  const updateUser = async () => {
    const response = await updateEmployee(rest, addEmployeeInfo?._id);
    //most edges cases handles here, if any come up fix asap
    //next issue is to update locker updated in the locker collection in backend
    if (
      response.status === 400 &&
      response.data.message === "Employee with that ID already exists"
    ) {
      setErrors({
        existing_employee: "Employee with that ID already exists",
      });
    }
    if (response.status === 201) {
      setLoading(false);
      setActionsMessage("Updated user successfully");
      router.replace("/(tabs)/users");
      if (!loading) setSuccessfullyAddedEmployee(true);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="bg-white h-full p-6">
      <>
        <TouchableOpacity
          onPress={router.back}
          className="flex-row h-10 items-center"
        >
          <Icon name="chevron-left" size={29} />
          <Text className="text-[1.3rem]">Edit user</Text>
        </TouchableOpacity>
        <View className="w-full gap-8 my-4">
          <View className={errors.employee_id && "h-28"}>
            <FormField
              value={addEmployeeInfo.employee_name}
              title="Name"
              inputStyles="pl-4"
              placeholder="Enter name"
              rounded="rounded-[0.625rem]"
              handleChangeText={(value: any) =>
                handleEmployeeInfo("employee_name", value)
              }
            />
            <Error
              hidden={!errors.employee_name}
              title={errors.employee_name}
            />
          </View>
          <View className={errors.employee_id && "h-28"}>
            <FormField
              value={String(addEmployeeInfo?.employee_id)}
              title="ID Number"
              inputStyles="pl-4"
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
              {
                label: "Fabrication Womens B",
                value: "Fabrication Womens B",
              },
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
                handlePress={handleUpdateRequest}
                title="Save"
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
      </>
    </SafeAreaView>
  );
};

export default update_user;
