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
import { loadJobOptions } from "@/app/requests/loadJobs";

const PersonalInfoForm = () => {
  const router = useRouter();
  const { id: employeeId, evaluationId, from }: any = useLocalSearchParams();
  const { employee } = useEmployeeContext();

  const [formData, setFormData] = useState<any>({
    trainingType: "",
    teamMemberName: "",
    employeeId: "",
    hireDate: "",
    // job (manual)
    trainingPosition: "", // label shown
    task_code: "", // selected task_code
    task_snapshot: null, // full task record (for snapshot)
    // department (manual)
    department: "", // label shown
    supervisor: null,
    dept_code: "", // selected dept_code
    dept_snapshot: null, // full department record (for snapshot)
    // other fields
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

  const trainingFor = ["New Hire", "Bid", "Cross Training"] as const;

  // non-editable prefilled fields
  const prefilledFields = [
    "teamMemberName",
    "employeeId",
    "lockerNumber",
    "hireDate",
  ] as const;

  const loadDepartmentOptions = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    const resp = await axios.get(`${baseUrl}/departments/options`, {
      headers: { Authorization: token! },
    });

    return (
      resp.data?.results?.map((d: any) => ({
        ...d,
        label:
          d?.children?.custom_name ||
          d?.children?.local_name ||
          d?.children?.department_name ||
          d?.children?.sap_description ||
          d.label,
      })) ?? []
    );
  }, []);

  const loadSupervisorsOptions = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    const resp = await axios.get(`${baseUrl}/management`, {
      headers: { Authorization: token! },
    });

    return resp.data.map((supervisor) => ({
      ...supervisor,
      label: titleCase(supervisor?.name),
    }));
  }, []);

  // ---- Fetch existing evaluation to prefill (if any) ----
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
        // restore previously saved selections if present
        trainingPosition: info.trainingPosition || "",
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

  // ---- screen focus ----
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

  // ---- validation ----
  const validateForm = () => {
    const required = [
      "trainingType",
      "teamMemberName",
      "employeeId",
      "trainingPosition", // must pick a job
      "department", // must pick a department
      "lockerNumber",
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

  // ---- generic input handler ----
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

  // ---- training type picker ----
  const handleTrainingTypeSelect = (t: string) => {
    handleChange("trainingType", t);
    setMenuVisible(false);
  };

  // ---- job select ----
  const handleJobSelect = (opt: any) => {
    const meta =
      opt?.children && !Array.isArray(opt.children) ? opt.children : null;
    setFormData((f: any) => ({
      ...f,
      trainingPosition: opt?.label || "",
      task_code: meta?.task_code || "",
      task_snapshot: meta || null,
      department: "",
      dept_code: "",
      dept_snapshot: null,
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next.trainingPosition;
      return next;
    });
  };

  // ---- department select ----
  const handleDeptSelect = (opt: any) => {
    const meta =
      opt?.children && !Array.isArray(opt.children) ? opt.children : null;
    setFormData((f: any) => ({
      ...f,
      department: opt?.label || "",
      dept_code: meta?.dept_code || "",
      dept_snapshot: meta || null,
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next.department;
      return next;
    });
  };

  // ---- delete evaluation ----
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

  // ---- submit ----
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
            // human-readable mirrors
            trainingPosition: trainingPosition.trim(),
            department: department.trim(),
            // coded mirrors (DB-friendly)
            task_code: task_code || null,
            dept_code: dept_code || null,
            // full snapshots to freeze current definitions
            task_snapshot: task_snapshot || null,
            dept_snapshot: dept_snapshot || null,
            // nested personalInfo
            personalInfo: {
              trainingType,
              teamMemberName,
              employeeId: empId,
              hireDate,
              lockerNumber,
              phoneNumber,
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

          {/* Training Type */}
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

          {/* Prefilled/disabled */}
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

          {/* Job Title -> SelectInput */}
          <SelectInput
            title="Job Title"
            placeholder="Select Job Title"
            selectedValue={formData.trainingPosition}
            onSelect={handleJobSelect}
            loadData={loadJobOptions}
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

          {/* Department -> SelectInput (manual selection) */}
          <SelectInput
            title="Department"
            placeholder="Select Department"
            selectedValue={formData.department}
            onSelect={handleDeptSelect}
            loadData={loadDepartmentOptions}
            borderColor={
              errors.department ? "border-red-500" : "border-gray-300"
            }
            containerStyles="mb-5"
          />
          {errors.department && (
            <Text className="text-red-500 text-sm -mt-4 mb-4">
              {errors.department}
            </Text>
          )}

          <SelectInput
            title="Supervisor"
            placeholder="Select Supervisor"
            selectedValue={formData.supervisor}
            onSelect={(val) =>
              setFormData({
                ...formData,
                supervisor: val,
              })
            }
            loadData={loadSupervisorsOptions}
            borderColor={
              errors.department ? "border-red-500" : "border-gray-300"
            }
            containerStyles="mb-5"
          />

          {/* Editable fields */}
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
