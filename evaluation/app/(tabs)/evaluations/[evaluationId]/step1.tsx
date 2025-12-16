// @ts-nocheck
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
  useSegments,
} from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import {
  ActivityIndicator,
  Menu,
  Button as PaperButton,
} from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import useEmployeeContext from "@/app/context/EmployeeContext";
import SinglePressTouchable from "@/app/utils/SinglePress";
import formatISODate from "@/app/conversions/ConvertIsoDate";
import { dateValidation } from "@/app/validation/dateValidation";
import SelectInput from "@/components/SelectField";
import { titleCase } from "@/app/helpers/names";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";

const PersonalInfoForm = () => {
  const router = useRouter();
  const { id: employeeId, evaluationId, from }: any = useLocalSearchParams();
  const { employee } = useEmployeeContext();

  const [formData, setFormData] = useState<any>({
    trainingType: "",
    teamMemberName: "",
    employeeId: "",
    hireDate: "",
    trainingPosition: "",
    task_code: "",
    task_snapshot: null,
    department: "",
    supervisor: null, // training supervisor object { id, name }
    dept_code: "",
    dept_snapshot: null,
    lockerNumber: "",
    phoneNumber: "",
    jobStartDate: "",
    projectedTrainingHours: "",
    projectedQualifyingDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDeletedEvaluation, setHasDeletedEvaluation] = useState(false);

  const fetchEvaluation = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const res: any =
        !hasDeletedEvaluation &&
        (await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
          headers: { Authorization: token! },
        }));

      const info = res?.data?.personalInfo || {};

      let fullEmployee = employee;
      if (!employee || String(employee.employee_id) !== employeeId) {
        const empRes = await axios.get(`${baseUrl}/employees/${employeeId}`, {
          headers: { Authorization: token! },
        });
        fullEmployee = empRes.data;
      }

      const evalSup = res?.data?.supervisor;
      let supervisorObj: any = null;
      if (evalSup) {
        if (typeof evalSup === "object") {
          supervisorObj = {
            id: evalSup.id ?? null,
            name: evalSup.name ?? "",
          };
        } else {
          supervisorObj = { id: null, name: String(evalSup) };
        }
      }

      setFormData((f: any) => ({
        ...f,
        trainingType: info.trainingType || "",
        teamMemberName:
          info.teamMemberName || fullEmployee?.employee_name || "",
        employeeId: info.employeeId || String(fullEmployee?.employee_id || ""),
        hireDate:
          info.hireDate ||
          formatISODate(fullEmployee?.date_of_hire, true) ||
          "",
        lockerNumber:
          info.lockerNumber || String(fullEmployee?.locker_number || ""),
        phoneNumber: info.phoneNumber || "",
        jobStartDate: info.jobStartDate || "",
        projectedTrainingHours: info.projectedTrainingHours || "",
        projectedQualifyingDate: info.projectedQualifyingDate || "",
        trainingPosition:
          (res?.data?.position !== "Untitled" && res?.data?.position) || "",
        supervisor: supervisorObj,
        task_code: info.task_code || "",
        task_snapshot: info.task_snapshot || null,
        department: info.department || "",
        dept_code: info.dept_code || "",
        dept_snapshot: info.dept_snapshot || null,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [employee, employeeId, evaluationId, hasDeletedEvaluation]);

  const segments: any = useSegments();
  const path = segments.join("/");

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (path !== "(tabs)/users/[id]") {
        fetchEvaluation();
      }
    }, [fetchEvaluation, path])
  );

  const validateForm = () => {
    const required = [
      "trainingType",
      "teamMemberName",
      "employeeId",
      "trainingPosition",
      "projectedTrainingHours",
      "hireDate",
      "jobStartDate",
      "projectedQualifyingDate",
    ] as const;

    const requiredDates: any = [
      "jobStartDate",
      "projectedQualifyingDate",
    ] as const;

    const errs: Record<string, string> = {};
    for (const key of required) {
      const value = (formData[key] ?? "").toString().trim();
      if (!value) {
        errs[key] = "Required";
        continue;
      }
      if (requiredDates.includes(key) && !dateValidation(value)) {
        errs[key] = "Invalid date (MM/DD/YYYY)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key: any, value: string) => {
    let v = value;

    if (/(Date|QualifyingDate)/.test(key)) {
      const d = value.replace(/\D/g, "");
      if (d.length <= 2) v = d;
      else if (d.length <= 4) v = `${d.slice(0, 2)}/${d.slice(2)}`;
      else v = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
    }
    if (key === "phoneNumber") {
      const d = value.replace(/\D/g, "").slice(0, 10);
      if (d.length <= 3) v = d;
      else if (d.length <= 6) v = `${d.slice(0, 3)}-${d.slice(3)}`;
      else v = `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    }
    if (/(ID|Hours)/.test(key)) v = v.replace(/\D/g, "");

    setFormData((f: any) => ({ ...f, [key]: v }));

    if (errors[key]) {
      const e2 = { ...errors };
      delete e2[key];
      setErrors(e2);
    }
  };

  const handleTrainingTypeSelect = (t: string) => {
    handleChange("trainingType", t);
    setMenuVisible(false);
  };

  const handleJobSelect = (opt: any) => {
    const meta =
      opt?.children && !Array.isArray(opt.children) ? opt.children : null;
    setFormData((f: any) => ({
      ...f,
      trainingPosition: opt?.label || "",
      task_code: meta?.task_code || "",
      task_snapshot: meta || null,
      department: meta?.department_name,
      dept_code: meta?.department_code,
      dept_snapshot: null,
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next.trainingPosition;
      return next;
    });
  };

  const handleDeleteEvaluation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      await axios.delete(`${baseUrl}/evaluations/${evaluationId}`, {
        headers: { Authorization: token! },
      });
      setHasDeletedEvaluation(true);
    } catch {
      Alert.alert("Error", "Failed to delete evaluation.");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const {
        trainingType,
        teamMemberName,
        employeeId: empId,
        hireDate,
        lockerNumber,
        phoneNumber,
        jobStartDate,
        projectedTrainingHours,
        projectedQualifyingDate,
        trainingPosition,
        department,
        supervisor,
        task_code,
        task_snapshot,
        dept_code,
        dept_snapshot,
      } = formData;

      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "update_personal_info",
          data: {
            trainingPosition: trainingPosition.trim(),
            trainingSupervisor: supervisor,
            department: department.trim(),
            task_code: task_code || null,
            dept_code: dept_code || null,
            task_snapshot: task_snapshot || null,
            dept_snapshot: dept_snapshot || null,
            personalInfo: {
              trainingType,
              teamMemberName,
              employeeId: empId,
              hireDate,
              lockerNumber,
              phoneNumber,
              supervisor,
              jobStartDate,
              projectedTrainingHours,
              projectedQualifyingDate,
              task_code: task_code || null,
              task_snapshot: task_snapshot || null,
              dept_code: dept_code || null,
              dept_snapshot: dept_snapshot || null,
            },
          },
        },
        { headers: { Authorization: token! } }
      );

      if (from !== "details") {
        await axios.patch(
          `${baseUrl}/evaluations/${evaluationId}`,
          { action: "update_status", data: { status: "in_progress" } },
          { headers: { Authorization: token! } }
        );
        router.push({
          pathname: `/evaluations/[evaluationId]/step2`,
          params: { evaluationId, from: employee?._id },
        });
      } else {
        router.push({
          pathname: `/evaluations/[evaluationId]`,
          params: { from: employee?._id, evaluationId },
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="flex-row items-center mb-6">
            <SinglePressTouchable
              onPress={() => {
                if (from) {
                  router.replace({
                    pathname: `/evaluations/[evaluationId]`,
                    params: { evaluationId, from },
                  });
                } else {
                  handleDeleteEvaluation();
                  router.replace(`/users/${employeeId}`);
                }
              }}
              className="mr-3"
            >
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </SinglePressTouchable>
            <Text className="text-2xl font-semibold text-gray-900">
              Personal Information
            </Text>
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Training Type
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <PaperButton
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={{
                    borderColor: errors.trainingType ? "#ef4444" : "#d1d5db",
                    borderWidth: 1,
                    height: 50,
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: formData.trainingType ? "#111827" : "#6b7280",
                    fontSize: 16,
                    textAlign: "left",
                  }}
                >
                  {formData.trainingType || "Select Training Type"}
                </PaperButton>
              }
            >
              {(["New Hire", "Bid", "Cross Training"] as const).map((opt) => (
                <Menu.Item
                  key={opt}
                  title={opt}
                  onPress={() => handleTrainingTypeSelect(opt)}
                />
              ))}
            </Menu>
            {errors.trainingType && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.trainingType}
              </Text>
            )}
          </View>

          {[
            { key: "teamMemberName", label: "Team Member Name" },
            { key: "employeeId", label: "Employee ID" },
            { key: "hireDate", label: "Hire Date (MM/DD/YYYY)" },
            { key: "lockerNumber", label: "Locker Number" },
          ].map(({ key, label }) => (
            <View key={key} className="mb-5">
              <FormField
                title={label}
                value={formData[key as keyof typeof formData]}
                placeholder={label}
                handleChangeText={() => {}}
                error={errors[key]}
                keyboardType={/Date|ID/.test(key) ? "numeric" : "default"}
                editable={false}
              />
            </View>
          ))}

          <SelectInput
            searchable
            title="Job Title"
            placeholder="Select Job Title"
            selectedValue={formData.trainingPosition}
            returnOption
            onSelect={handleJobSelect}
            loadData={(args) =>
              loadJobOptions({
                ...args,
                includeNewHires: true,
              })
            }
            borderColor={
              errors.trainingPosition ? "border-red-500" : "border-gray-300"
            }
            containerStyles="mb-5"
          />
          {errors.trainingPosition && (
            <Text className="text-red-500 text-sm -mt-4 mb-4">
              {errors.trainingPosition}
            </Text>
          )}

          <SelectInput
            searchable
            title="Supervisor"
            placeholder="Select Supervisor"
            selectedValue={formData.supervisor?.name || ""}
            returnOption
            onSelect={(val) => {
              setFormData((f: any) => ({
                ...f,
                supervisor: {
                  name: titleCase(val?.__k),
                  id: val?.children?.id ?? null,
                },
              }));
            }}
            loadData={loadSupervisorsOptions}
            borderColor={
              errors.supervisor ? "border-red-500" : "border-gray-300"
            }
            containerStyles="mb-5"
          />

          {[
            { key: "phoneNumber", label: "Phone Number" },
            { key: "jobStartDate", label: "Job Start Date (MM/DD/YYYY)" },
            {
              key: "projectedTrainingHours",
              label: "Projected Training Hours",
            },
            {
              key: "projectedQualifyingDate",
              label: "Projected Qualifying Date (MM/DD/YYYY)",
            },
          ].map(({ key, label }) => (
            <View key={key} className="mb-5">
              <FormField
                title={label}
                value={formData[key as keyof typeof formData]}
                placeholder={label}
                handleChangeText={(t: any) => handleChange(key as any, t)}
                error={errors[key]}
                keyboardType={
                  /Date|Hours|ID|Number|Phone/.test(key) ? "numeric" : "default"
                }
              />
            </View>
          ))}

          <Button
            title="Save and Continue"
            handlePress={handleSubmit}
            isLoading={isSubmitting}
            styles="mt-6"
            inputStyles="bg-[#1a237e] w-full"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalInfoForm;
