import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import StepProgressBar from "@/components/StepProgressBar";
import PersonalInfoForm from "./step1";
import Step2Form from "./step2";

const EditFormController = () => {
  const { id, fileId, folderId, step } = useLocalSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(
    parseInt((step as string) || "1", 10)
  );

  useEffect(() => {
    setCurrentStep(parseInt((step as string) || "1", 10));
  }, [step]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    router.push({
      pathname: `/users/${id}/folders/files/${fileId}/edit-form`,
      params: {
        step: nextStep.toString(),
        fileId: fileId as string,
        folderId: folderId as string,
      },
    });
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep > 0) {
      router.push({
        pathname: `/users/${id}/folders/files/${fileId}/edit-form`,
        params: {
          step: prevStep.toString(),
          fileId: fileId as string,
          folderId: folderId as string,
        },
      });
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StepProgressBar step={currentStep} />

      {currentStep === 1 && <PersonalInfoForm onNext={handleNext} />}
      {currentStep === 2 && (
        <Step2Form onNext={handleNext} onBack={handleBack} />
      )}
    </SafeAreaView>
  );
};

export default EditFormController;
