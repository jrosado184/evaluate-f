import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";

import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import Error from "@/components/ErrorText";
import SinglePressTouchable from "@/app/utils/SinglePress";
import SelectInput from "@/components/SelectField";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import SelectionSheet from "@/components/ui/sheets/SelectionSheet";

import useEmployeeContext from "@/app/context/EmployeeContext";
import useAddUser from "@/hooks/useAddUser";
import useActionContext from "@/app/context/ActionsContext";
import updateEmployee from "@/app/requests/updateEmployee";
import useValidation from "@/app/validation/useValidation";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";
import { titleCase } from "@/app/helpers/names";
import useAuthContext from "@/app/context/AuthContext";

const normalizeEmployeeForUpdate = (data: any) => {
  if (!data) return {};

  return {
    _id: data._id ?? null,
    employee_name: data.employee_name ?? "",
    employee_id: data.employee_id ?? "",
    date_of_hire: data.date_of_hire ?? "",
    position: data.position ?? "",
    department: data.department ?? "",
    supervisor: data.supervisor ?? null,
    location: data.location || data?.locker_info?.location || "",
    locker_number:
      data.locker_number != null && data.locker_number !== ""
        ? Number(data.locker_number)
        : null,
    locker_id: data.locker_id ?? null,
    assigned_by:
      data.assigned_by ||
      data?.locker_info?.assigned_by ||
      data?.added_by ||
      "",
  };
};

const UpdateUser = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

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
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const {
    employee,
    addEmployeeInfo,
    setAddEmployeeInfo,
    setSuccessfullyAddedEmployee,
  } = useEmployeeContext();

  const currentEmployeeData = useRef<any>(null);

  useEffect(() => {
    currentEmployeeData.current = normalizeEmployeeForUpdate(employee);
  }, [employee]);

  useEffect(() => {
    if (!modalVisible) return;

    const id = setTimeout(() => {
      sheetRef.current?.present();
    }, 40);

    return () => clearTimeout(id);
  }, [modalVisible]);

  const closeLockerSheet = () => {
    sheetRef.current?.dismiss();
  };

  const resetLockerSheet = () => {
    setModalVisible(false);
  };

  const updateUser = async () => {
    try {
      const { _id, locker_info, ...updateData } = addEmployeeInfo;

      const payload = {
        ...updateData,
        locker_number:
          updateData?.locker_number != null && updateData?.locker_number !== ""
            ? Number(updateData.locker_number)
            : null,
        locker_id: updateData?.locker_id ?? null,
        location:
          updateData?.location || updateData?.locker_info?.location || "",
        assigned_by:
          currentUser?.name ||
          updateData?.assigned_by ||
          employee?.assigned_by ||
          employee?.locker_info?.assigned_by ||
          employee?.added_by ||
          "",
      };

      const response = await updateEmployee(payload, _id);

      if (
        response?.status === 400 &&
        response?.data?.message === "Employee with that ID already exists"
      ) {
        setErrors((prev: any) => ({
          ...prev,
          existing_employee: "Employee with that ID already exists",
        }));
        return;
      }

      if (response?.status === 200 || response?.status === 201) {
        setActionsMessage("Updated user successfully");
        setSuccessfullyAddedEmployee(true);
        router.replace("/(tabs)/users");
        return;
      }

      setActionsMessage(response?.data?.message || "Update failed");
    } catch (error: any) {
      console.error("Update error:", error);
      setActionsMessage(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    setErrors(newErrors);

    const original = normalizeEmployeeForUpdate(currentEmployeeData.current);
    const current = normalizeEmployeeForUpdate(addEmployeeInfo);

    const hasChanges = JSON.stringify(original) !== JSON.stringify(current);

    if (!hasChanges) {
      setActionsMessage("No changes made");
      setSuccessfullyAddedEmployee(true);
      router.replace("/(tabs)/users");
      return;
    }

    setLoading(true);
    await updateUser();
  };

  return (
    <>
      <SafeAreaView className="h-full bg-white p-6">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <SinglePressTouchable
            onPress={router.back}
            className="flex-row h-10 items-center"
          >
            <Icon name="chevron-left" size={29} />
            <Text className="text-[1.3rem]">Edit user</Text>
          </SinglePressTouchable>

          <View className="my-4 w-full gap-8">
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

            <View className={errors.employee_id && "h-28"}>
              <FormField
                value={String(addEmployeeInfo?.employee_id || "")}
                title="ID Number"
                placeholder="Enter ID number"
                rounded="rounded-[0.625rem]"
                handleChangeText={(value: any) =>
                  handleEmployeeInfo(
                    "employee_id",
                    /^\d+$/.test(value) ? parseInt(value, 10) : "",
                  )
                }
              />
              <Error hidden={!errors.employee_id} title={errors.employee_id} />
            </View>

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
                      4,
                    )}/${cleaned.slice(4)}`;
                  }

                  handleEmployeeInfo("date_of_hire", formatted);
                }}
              />
              <Error hidden={!errors.hire_date} title={errors.hire_date} />
            </View>

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
                loadData={(args) =>
                  loadJobOptions({
                    ...args,
                    includeNewHires: true,
                  })
                }
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
                  locker_id: null,
                }));
                setErrors((prev: any) => ({
                  ...prev,
                  locker_number: "",
                  existing_employee: "",
                }));
              }}
              selectedValue={
                addEmployeeInfo?.location ||
                addEmployeeInfo?.locker_info?.location
              }
            />

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
        </ScrollView>
      </SafeAreaView>

      {modalVisible ? (
        <AppBottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          title="Select Locker"
          iconName="x"
          onHeaderPress={closeLockerSheet}
          onDismiss={resetLockerSheet}
          scroll={false}
        >
          <SelectionSheet
            mode="lockers"
            filter={
              addEmployeeInfo?.location ||
              addEmployeeInfo?.locker_info?.location
            }
            onLockerSelected={(locker: any) => {
              const num = locker?.locker_number;
              const lockerId = locker?._id;

              if (num != null) {
                const parsed =
                  typeof num === "number" ? num : parseInt(String(num), 10);

                setAddEmployeeInfo((prev: any) => ({
                  ...prev,
                  locker_number: parsed,
                  locker_id: lockerId ?? null,
                  location: locker?.location || prev?.location || "",
                }));
              }

              setErrors((prev: any) => ({
                ...prev,
                locker_number: "",
                existing_employee: "",
              }));

              closeLockerSheet();
            }}
          />
        </AppBottomSheet>
      ) : null}
    </>
  );
};

export default UpdateUser;
