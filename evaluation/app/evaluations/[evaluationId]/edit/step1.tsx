// app/evaluations/[evaluationId]/edit/step1.tsx
// @ts-nocheck
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
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
import { dateValidation } from "@/app/validation/dateValidation";
import SelectInput from "@/components/SelectField";
import { titleCase } from "@/app/helpers/names";
import {
  loadJobOptions,
  loadSupervisorsOptions,
} from "@/app/requests/loadData";
import formatISODate from "@/app/conversions/ConvertIsoDate";

type Props = {
  evaluationId?: string;
  id?: string;
  createdBy?: string;
  inSheet?: boolean;
  onBack?: () => void;
  onDone?: () => void;
  onCreated?: (newEvalId: string) => void;
};

const PersonalInfoForm = (props: Props) => {
  const router = useRouter();
  const params: any = useLocalSearchParams();

  const initialEvalId = String(
    props?.evaluationId ?? params?.evaluationId ?? ""
  );
  const employeeId = String(props?.id ?? params?.id ?? "");

  const { employee } = useEmployeeContext();

  const [evaluationId, setEvaluationId] = useState<string>(initialEvalId || "");

  const [formData, setFormData] = useState<any>({
    trainingType: "",
    teamMemberName: "",
    employeeId: "",
    hireDate: "",
    trainingPosition: "",
    task_code: "",
    task_snapshot: null,
    department: "",
    supervisor: null,
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

  const loadPrefills = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      // Always try to have employee data for prefills
      let fullEmployee = employee;
      if (
        !fullEmployee ||
        String(fullEmployee?._id || fullEmployee?.id || "") !== employeeId
      ) {
        // If your employeeId param is the employee document id:
        // this endpoint matches your User.tsx usage: /employees/${id}
        const empRes = await axios.get(`${baseUrl}/employees/${employeeId}`, {
          headers: { Authorization: token! },
        });
        fullEmployee = empRes.data;
      }

      // If we already have an evaluationId, load its data and merge
      let info: any = {};
      let evalSupervisor: any = null;
      let evalPosition: string = "";

      if (evaluationId) {
        const evalRes = await axios.get(
          `${baseUrl}/evaluations/${evaluationId}`,
          {
            headers: { Authorization: token! },
          }
        );
        info = evalRes?.data?.personalInfo || {};
        evalSupervisor = evalRes?.data?.supervisor || null;
        evalPosition =
          (evalRes?.data?.position !== "Untitled" && evalRes?.data?.position) ||
          "";
      }

      let supervisorObj: any = null;
      if (evalSupervisor) {
        if (typeof evalSupervisor === "object") {
          supervisorObj = {
            id: evalSupervisor.id ?? null,
            name: evalSupervisor.name ?? "",
          };
        } else {
          supervisorObj = { id: null, name: String(evalSupervisor) };
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
        trainingPosition: evalPosition || info.trainingPosition || "",
        supervisor: supervisorObj || info.supervisor || null,
        task_code: info.task_code || "",
        task_snapshot: info.task_snapshot || null,
        department: info.department || "",
        dept_code: info.dept_code || "",
        dept_snapshot: info.dept_snapshot || null,
      }));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load personal information.");
    } finally {
      setLoading(false);
    }
  }, [employee, employeeId, evaluationId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPrefills();
    }, [loadPrefills])
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

  const createdEvalIdRef = useRef<string | null>(null);

  const ensureEvaluationCreated = async (): Promise<string> => {
    const existing = evaluationId || createdEvalIdRef.current;
    if (existing) return existing;

    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    const res = await axios.post(
      `${baseUrl}/employees/${employeeId}/evaluations`,
      {
        position: "Untitled",
        createdBy: props?.createdBy || "",
      },
      { headers: { Authorization: token! } }
    );

    const newId = res.data?._id;
    if (!newId) throw new Error("Create evaluation did not return _id");

    createdEvalIdRef.current = newId;

    return newId;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (isSubmitting) return; // extra safety
    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const evalId = await ensureEvaluationCreated();

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
        `${baseUrl}/evaluations/${evalId}`,
        {
          action: "update_personal_info",
          data: {
            trainingPosition: trainingPosition.trim(),
            trainingSupervisor: supervisor,
            department: (department || "").trim(),
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

      await axios.patch(
        `${baseUrl}/evaluations/${evalId}`,
        { action: "update_status", data: { status: "in_progress" } },
        { headers: { Authorization: token! } }
      );

      if (!evaluationId) {
        setEvaluationId?.(evalId);
        props?.onCreated?.(evalId);
      }

      props?.onDone?.();
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
    <View className="flex-1 bg-white">
      {!props?.inSheet ? (
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className={props?.inSheet ? "px-5" : "px-5 pt-5"}
          contentContainerStyle={{
            paddingTop: props?.inSheet ? 0 : 10,
            paddingBottom: 120,
          }}
        >
          {/* Training Type */}
          <View className="mb-5 my-4">
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

          {/* Prefilled non-editables */}
          {[
            { key: "teamMemberName", label: "Team Member Name" },
            { key: "employeeId", label: "Employee ID" },
            { key: "hireDate", label: "Hire Date (MM/DD/YYYY)" },
            { key: "lockerNumber", label: "Locker Number" },
          ].map(({ key, label }) => (
            <View key={key} className="mb-5">
              <FormField
                title={label}
                value={formData[key]}
                placeholder={label}
                handleChangeText={() => {}}
                error={errors[key]}
                keyboardType={/Date|ID/.test(key) ? "numeric" : "default"}
                editable={false}
              />
            </View>
          ))}

          {/* Job Title */}
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

          {/* Supervisor */}
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
                value={formData[key]}
                placeholder={label}
                handleChangeText={(t: any) => handleChange(key, t)}
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
    </View>
  );
};

export default PersonalInfoForm;
