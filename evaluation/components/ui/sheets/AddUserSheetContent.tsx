import React, { useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import FormField from "@/components/FormField";
import Button from "@/components/Button";
import SelectField from "@/components/SelectField";
import Error from "@/components/ErrorText";
import SelectInput from "@/components/SelectField";
import SelectionSheet from "@/components/ui/sheets/SelectionSheet";

import useEmployeeContext from "@/app/context/EmployeeContext";
import useAddUser from "@/hooks/useAddUser";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";
import { titleCase } from "@/app/helpers/names";

type AddUserSheetContentProps = {
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  view: "form" | "lockerSelection";
  setView: React.Dispatch<React.SetStateAction<"form" | "lockerSelection">>;
};

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <View className="mb-6 rounded-3xl border border-neutral-200 bg-white px-5 py-5 shadow-sm">
      <Text className="text-[16px] font-semibold text-black">{title}</Text>
      {subtitle ? (
        <Text className="mt-1.5 text-[13px] leading-5 text-neutral-500">
          {subtitle}
        </Text>
      ) : null}
      <View className="mt-5 gap-6">{children}</View>
    </View>
  );
};

const FieldHint = ({ text }: { text: string }) => {
  return (
    <Text className="mt-2.5 text-[12px] leading-4 text-neutral-400">
      {text}
    </Text>
  );
};

const AddUserSheetContent = ({
  onClose,
  onSuccess,
  view,
  setView,
}: AddUserSheetContentProps) => {
  const { errors, setErrors, handleAddUser, handleEmployeeInfo } = useAddUser();

  const { setAddEmployeeInfo, addEmployeeInfo, loading } = useEmployeeContext();

  useEffect(() => {
    setAddEmployeeInfo({
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
  }, [setAddEmployeeInfo]);

  const handleSubmit = async () => {
    const result = await handleAddUser();

    if (result !== false) {
      if (onSuccess) {
        await onSuccess();
      } else {
        onClose();
      }
    }
  };

  if (view === "lockerSelection") {
    return (
      <View className="flex-1 pt-2">
        <View className="mb-3 px-1">
          <Text className="text-[13px] text-neutral-500">
            Choose a locker for{" "}
            {addEmployeeInfo?.location || "the selected location"}.
          </Text>
        </View>

        <SelectionSheet
          mode="lockers"
          filter={
            addEmployeeInfo?.location || addEmployeeInfo?.locker_info?.location
          }
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

            setView("form");
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 68, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-1 pb-3">
        <View className="mb-6 rounded-3xl bg-[#F8FAFC] px-5 py-5">
          <View className="flex-row items-start">
            <View className="mr-4 rounded-2xl bg-[#E8EEFF] p-3.5">
              <MaterialIcons
                name="person-add-alt-1"
                size={22}
                color="#1a237e"
              />
            </View>

            <View className="flex-1">
              <Text className="text-[19px] font-bold text-black">
                Add New User
              </Text>
              <Text className="mt-2 text-[13px] leading-5 text-neutral-500">
                Fill in the employee details below to create a new user and
                assign them a locker.
              </Text>
            </View>
          </View>
        </View>

        <SectionCard
          title="Basic Information"
          subtitle="Start with the employee’s identity and work assignment."
        >
          <View className={`${errors.employee_name ? "min-h-[112px]" : ""}`}>
            <FormField
              title="Name"
              placeholder="Enter employee name"
              rounded="rounded-2xl"
              handleChangeText={(value: any) =>
                handleEmployeeInfo("employee_name", value)
              }
            />
            <Error
              hidden={!errors.employee_name}
              title={errors.employee_name}
            />
          </View>

          <View className={`${errors.employee_id ? "min-h-[112px]" : ""}`}>
            <FormField
              title="ID Number"
              placeholder="Enter ID number"
              rounded="rounded-2xl"
              keyboardType="numeric"
              handleChangeText={(value: any) =>
                handleEmployeeInfo(
                  "employee_id",
                  typeof value === "number" ? value : parseInt(value, 10),
                )
              }
            />
            <Error hidden={!errors.employee_id} title={errors.employee_id} />
          </View>

          <View className={`${errors.position ? "min-h-[112px]" : ""}`}>
            <SelectField
              title="Position"
              placeholder="Select position"
              searchable
              loadData={(args) =>
                loadJobOptions({
                  ...args,
                  includeNewHires: true,
                })
              }
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

          <View className="min-h-[96px]">
            <SelectInput
              searchable
              title="Supervisor"
              placeholder="Select supervisor"
              selectedValue={addEmployeeInfo.supervisor?.name}
              onSelect={(val: any) => {
                setAddEmployeeInfo({
                  ...addEmployeeInfo,
                  supervisor: {
                    name: titleCase(val.__k),
                    id: val?.children?.id,
                  },
                });
              }}
              returnOption
              loadData={loadSupervisorsOptions}
              borderColor={
                errors.department ? "border-red-500" : "border-gray-300"
              }
            />
          </View>
        </SectionCard>

        <SectionCard
          title="Hire Details"
          subtitle="Record the employee’s hire date and locker location."
        >
          <View className={`${errors.hire_date ? "min-h-[112px]" : ""}`}>
            <FormField
              value={addEmployeeInfo.date_of_hire}
              title="Hire Date"
              placeholder="MM/DD/YYYY"
              rounded="rounded-2xl"
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
                    4,
                  )}/${cleaned.slice(4)}`;
                }

                handleEmployeeInfo("date_of_hire", formatted);
              }}
            />
            <Error hidden={!errors.hire_date} title={errors.hire_date} />
            <FieldHint text="Enter the date in MM/DD/YYYY format." />
          </View>

          <View className="min-h-[96px]">
            <SelectField
              title="Location"
              placeholder="Select locker location"
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
          </View>

          <View
            className={`${
              errors.existing_employee || errors.locker_number
                ? "min-h-[112px]"
                : ""
            }`}
          >
            <SelectField
              title="Locker Number"
              placeholder="Select locker"
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

                  setView("lockerSelection");
                }
              }}
              onSelect={() => {}}
              selectedValue={addEmployeeInfo?.locker_number}
            />
            <Error
              hidden={!errors.locker_number && !errors.existing_employee}
              title={errors.locker_number || errors.existing_employee}
            />
            <FieldHint text="Locker options are filtered by the selected location." />
          </View>
        </SectionCard>

        <View className="mt-2 px-5 py-5 shadow-sm">
          <Text className="text-[15px] font-semibold text-black">
            Ready to save?
          </Text>
          <Text className="mt-1.5 text-[13px] leading-5 text-neutral-500">
            Review the details above, then create the new user.
          </Text>

          <View className="mt-5 w-full items-center">
            <Button
              isLoading={loading}
              handlePress={handleSubmit}
              title="Add User"
              styles="w-full rounded-2xl"
              inputStyles="w-full"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddUserSheetContent;
