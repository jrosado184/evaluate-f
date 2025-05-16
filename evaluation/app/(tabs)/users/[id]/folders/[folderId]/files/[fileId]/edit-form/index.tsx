import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

import StepProgressBar from "@/components/StepProgressBar";
import PersonalInfoForm from "./step1";
import Step2Form from "./step2";
import getServerIP from "@/app/requests/NetworkAddress";

const EditFormController = () => {
  const { id, fileId, folderId, step } = useLocalSearchParams();
  const router = useRouter();

  const initialStep = parseInt(typeof step === "string" ? step : "1", 10) || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    if (typeof step === "string") {
      const parsedStep = parseInt(step, 10);
      if (!isNaN(parsedStep)) {
        setCurrentStep(parsedStep);
      }
    }
  }, [step]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    router.push(
      `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=${nextStep}`
    );
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep > 0) {
      router.push(
        `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=${prevStep}`
      );
    } else {
      router.replace(`/users/${id}/folders/${folderId}/files/${fileId}`);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StepProgressBar step={currentStep} />
      {currentStep === 1 && <PersonalInfoForm onNext={handleNext} />}
      {currentStep === 2 && (
        <Step2Form
          onNext={handleNext}
          onBack={handleBack}
          initialEvaluation={null}
        />
      )}
    </SafeAreaView>
  );
};

export default EditFormController;
