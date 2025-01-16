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

const AddUser = () => {
  const { jobs } = useJobsContext();
  const { fetchJobs } = useGetJobs();
  const [options, setOptions] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { setAddEmployeeInfo, addEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEmployeeInfo = (field: string, value: any) => {
    setAddEmployeeInfo({
      ...addEmployeeInfo,
      assigned_by: currentUser.name,
      [field]: value,
    });
  };

  useEffect(() => {
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
        <FormField
          title="Name"
          inputStyles="pl-4"
          placeholder="Enter name"
          rounded="rounded-[0.625rem]"
          handleChangeText={(value: any) =>
            handleEmployeeInfo("employee_name", value)
          }
        />
        <FormField
          title="ID Number"
          inputStyles="pl-4"
          placeholder="Enter ID number"
          rounded="rounded-[0.625rem]"
          handleChangeText={(value: any) =>
            handleEmployeeInfo("employee_id", value)
          }
        />
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
          }}
          loadData={fetchJobs}
        />
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
            }));
          }}
        />
        <SelectField
          title="Locker Number"
          placeholder="Select Locker"
          onSelect={(value: any) => {
            setAddEmployeeInfo((prev: any) => ({
              ...prev,
              location: value,
            }));
          }}
          toggleModal={() => setModalVisible(true)}
        />
        <View>
          <View className="w-full items-center">
            <Button
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
