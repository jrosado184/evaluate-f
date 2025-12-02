import React, { useState, useRef } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/SlideUpModal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import { router } from "expo-router";
import useGetJobs from "@/app/requests/useGetJobs";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Error from "@/components/ErrorText";
import useAddUser from "@/hooks/useAddUser";
import useActionContext from "@/app/context/ActionsContext";
import updateEmployee from "@/app/requests/updateEmployee";
import useValidation from "@/app/validation/useValidation";
import SinglePressTouchable from "@/app/utils/SinglePress";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";
import { titleCase } from "@/app/helpers/names";
import SelectInput from "@/components/SelectField";

const UpdateUser = () => {
  const {
    errors,
    setErrors,
    handleEmployeeInfo,
    options,
    modalVisible,
    setModalVisible,
  } = useAddUser();
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

  addEmployeeInfo;
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
      router.replace("/(tabs)/users");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <SinglePressTouchable
          onPress={router.back}
          className="flex-row h-10 items-center"
        >
          <Icon name="chevron-left" size={29} />
          <Text className="text-[1.3rem]">Edit user</Text>
        </SinglePressTouchable>

        <View className="w-full gap-8 my-4">
          {/* Name */}
          <View className={errors.employee_name && "h-28"}>
            <FormField
              value={addEmployeeInfo.employee_name}
              title="Name"
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

          {/* Hire Date */}
          <View className={errors.hire_date && "h-28"}>
            <FormField
              value={addEmployeeInfo.date_of_hire || ""}
              title="Hire Date"
              placeholder="MM/DD/YYYY"
              keyboardType="numeric"
              rounded="rounded-[0.625rem]"
              handleChangeText={(value: any) => {
                const cleaned = value.replace(/[^0-9]/g, "").slice(0, 8);
                let formatted = "";
                if (cleaned.length <= 2) {
                  formatted = cleaned;
                } else if (cleaned.length <= 4) {
                  formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                } else {
                  formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
                    2,
                    4
                  )}/${cleaned.slice(4)}`;
                }
                handleEmployeeInfo("date_of_hire", formatted);
              }}
            />
            <Error hidden={!errors.hire_date} title={errors.hire_date} />
          </View>

          {/* Position */}
          <View className={`${errors.position ? "h-28" : ""}`}>
            <SelectField
              searchable
              title="Position"
              placeholder="Select Position"
              options={options}
              returnOption
              onSelect={(opt) => {
                let newHire = "";

                if (
                  opt.__k === "New Hire W/ Ppe Fab" ||
                  opt.__k === "New Hire W/ Ppe Kill"
                ) {
                  newHire = "NON-QUALIFIED";
                }

                setAddEmployeeInfo((prev: any) => ({
                  ...prev,
                  position: newHire || (opt?.__k ?? opt?.value ?? opt),
                  department: opt?.children?.department_name ?? "",
                }));
                setErrors((prev: any) => ({ ...prev, position: "" }));
              }}
              selectedValue={addEmployeeInfo?.position}
              loadData={loadJobOptions}
            />
            <Error hidden={!errors.position} title={errors.position} />
          </View>

          <SelectInput
            searchable
            title="Supervisor"
            placeholder="Select Supervisor"
            selectedValue={addEmployeeInfo.supervisor?.name}
            returnOption
            onSelect={(val: any) => {
              setAddEmployeeInfo({
                ...addEmployeeInfo,
                supervisor: {
                  name: titleCase(val?.__k),
                  id: val?.children?.id,
                },
              });
            }}
            loadData={loadSupervisorsOptions}
            borderColor={
              errors.department ? "border-red-500" : "border-gray-300"
            }
          />

          {/* Location */}
          <SelectField
            title="Location"
            placeholder="Select Locker Location"
            options={[
              { label: "Fabrication Mens A", value: "Fabrication Mens A" },
              { label: "Fabrication Mens B", value: "Fabrication Mens B" },
              { label: "Fabrication Mens C", value: "Fabrication Mens C" },
              { label: "Womens General", value: "Womens General" },
              { label: "Harvest Mens", value: "Harvest Mens" },
            ]}
            onSelect={(value: any) => {
              setAddEmployeeInfo((prev: any) => ({
                ...prev,
                location: value,
                locker_number: null,
              }));
            }}
            selectedValue={
              addEmployeeInfo?.location ||
              addEmployeeInfo?.locker_info?.location
            }
          />

          {/* Locker Number */}
          <View
            className={`${
              errors.existing_employee || errors.locker_number ? "h-28" : ""
            }`}
          >
            <SelectField
              title="Locker Number"
              placeholder="Select Locker"
              openExternally
              toggleModal={(open: boolean) => {
                if (open) {
                  if (
                    !addEmployeeInfo?.locker_info?.location &&
                    !addEmployeeInfo?.location
                  ) {
                    setErrors((prev: any) => ({
                      ...prev,
                      locker_number: "Please select a location first",
                    }));
                    return;
                  }
                  setModalVisible(true);
                } else {
                  setModalVisible(false);
                }
              }}
              onSelect={() => {}}
              selectedValue={addEmployeeInfo?.locker_number}
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
              styles="my-2 w-full rounded-[0.625rem]"
              inputStyles="w-full"
            />
          </View>
        </View>

        <SlideUpModal
          mode="assignLocker"
          filter={encodeURIComponent(
            addEmployeeInfo?.location || addEmployeeInfo?.locker_info?.location
          )}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onLockerSelected={(locker: any) => {
            const num = locker?.locker_number;
            if (num != null) {
              const parsed =
                typeof num === "number" ? num : parseInt(String(num), 10);
              setAddEmployeeInfo((prev: any) => ({
                ...prev,
                locker_number: parsed,
              }));
            }
            setErrors((prev: any) => ({
              ...prev,
              locker_number: "",
              existing_employee: "",
            }));
            setModalVisible(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateUser;
