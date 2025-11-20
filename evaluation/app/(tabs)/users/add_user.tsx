import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideUpModal from "@/components/SlideUpModal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import { router } from "expo-router";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Error from "@/components/ErrorText";
import useAddUser from "@/hooks/useAddUser";
import SinglePressTouchable from "@/app/utils/SinglePress";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";
import { titleCase } from "@/app/helpers/names";
import SelectInput from "@/components/SelectField";

const AddUser = () => {
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

  useEffect(() => {
    setAddEmployeeInfo({
      ...addEmployeeInfo,
      employee_name: "",
      locker_number: null,
      employee_id: null,
      department: "",
      position: "",
      supervisor: { name: "", id: null },
      knife_number: null,
      added_by: "",
      date_of_hire: "",
      location: "",
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-7 my-2">
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
                  typeof value === "number" ? value : parseInt(value, 10)
                )
              }
            />
            <Error hidden={!errors.employee_id} title={errors.employee_id} />
          </View>

          {/* Position Field (async + searchable) */}
          <View className={`${errors.position ? "h-28" : ""}`}>
            <SelectField
              title="Position"
              placeholder="Select Position"
              searchable
              options={options}
              loadData={loadJobOptions}
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
            />
            <Error hidden={!errors.position} title={errors.position} />
          </View>

          <SelectInput
            searchable
            title="Supervisor"
            placeholder="Select Supervisor"
            selectedValue={addEmployeeInfo.supervisor?.name}
            onSelect={(val: any) => {
              setAddEmployeeInfo({
                ...addEmployeeInfo,
                supervisor: { name: titleCase(val.__k), id: val?.children?.id },
              });
            }}
            returnOption
            loadData={loadSupervisorsOptions}
            borderColor={
              errors.department ? "border-red-500" : "border-gray-300"
            }
          />

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

          {/* Location Field (static) */}
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
              setErrors((prev: any) => ({ ...prev, locker_number: "" }));
            }}
            selectedValue={addEmployeeInfo?.location}
          />

          {/* Locker Field (uses your external SlideUpModal) */}
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
                  if (!addEmployeeInfo?.location) {
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
      </ScrollView>

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
    </SafeAreaView>
  );
};

export default AddUser;
