import React, { useEffect, useState } from "react";
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
import SinglePressTouchable from "@/app/utils/SinglePress";

const AddUser = () => {
  const { setSelectedValue } = useSelect();
  const {
    errors,
    setErrors,
    handleAddUser,
    handleEmployeeInfo,
    options,
    modalVisible,
    setModalVisible,
  } = useAddUser();
  const { setAddEmployeeInfo, addEmployeeInfo, loading } = useEmployeeContext();
  const { fetchJobs } = useGetJobs();

  useEffect(() => {
    setAddEmployeeInfo({
      ...addEmployeeInfo,
      employee_name: "",
      locker_number: null,
      employee_id: null,
      department: "",
      position: "",
      knife_number: null,
      added_by: "",
      date_of_hire: "",
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <SinglePressTouchable
        onPress={router.back}
        className="flex-row h-10 items-center"
      >
        <Icon name="chevron-left" size={29} />
        <Text className="text-[1.3rem]">Add user</Text>
      </SinglePressTouchable>
      <View
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-7 my-4">
          {/* Name Field */}
          <View className={`${errors.employee_id ? "h-28" : ""}`}>
            <FormField
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

          {/* ID Field */}
          <View className={`${errors.employee_id ? "h-28" : ""}`}>
            <FormField
              title="ID Number"
              placeholder="Enter ID number"
              rounded="rounded-[0.625rem]"
              keyboardType="numeric"
              handleChangeText={(value: any) =>
                handleEmployeeInfo(
                  "employee_id",
                  typeof value === "number" ? value : parseInt(value)
                )
              }
            />
            <Error hidden={!errors.employee_id} title={errors.employee_id} />
          </View>

          {/* Position Field */}
          <View className={`${errors.position ? "h-28" : ""}`}>
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

          {/* Hire Date Field */}
          <View className={`${errors.hire_date ? "h-28" : ""}`}>
            <FormField
              value={addEmployeeInfo.date_of_hire}
              title="Hire Date"
              placeholder="MM/DD/YYYY"
              rounded="rounded-[0.625rem]"
              keyboardType="numeric"
              handleChangeText={(value: string) => {
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

          {/* Location Field */}
          <SelectField
            title="Location"
            placeholder="Select Locker Location"
            options={[
              { label: "Fabrication Womens ", value: "Fabrication Womens " },
              { label: "Fabrication Mens ", value: "Fabrication Mens" },
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

          {/* Locker Field */}
          <View
            className={`${
              errors.existing_employee || errors.locker_number ? "h-28" : ""
            }`}
          >
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

          {/* Button */}
          <View className="w-full items-center">
            <Button
              isLoading={loading}
              handlePress={handleAddUser}
              title="Add User"
              styles="my-6 w-full rounded-[0.625rem]"
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
