const useEvaluationsValidation = (formData: any) => {
  const newErrors: Record<string, string> = {};

  const requiredFields = [
    // On Job
    "hoursMonday",
    "hoursTuesday",
    "hoursWednesday",
    "hoursThursday",
    "hoursFriday",

    // Off Job
    "hoursOffJobMonday",
    "hoursOffJobTuesday",
    "hoursOffJobWednesday",
    "hoursOffJobThursday",
    "hoursOffJobFriday",

    // With Trainee
    "hoursWithTraineeMonday",
    "hoursWithTraineeTuesday",
    "hoursWithTraineeWednesday",
    "hoursWithTraineeThursday",
    "hoursWithTraineeFriday",

    // Other fields
    "percentQualified",
    "reTimeAchieved",
    "yieldAuditDate",
    "knifeSkillsAuditDate",
    "knifeScore",
    "comments",
    "trainerSignature",
    "teamMemberSignature",
    "supervisorSignature",
  ];

  requiredFields.forEach((key) => {
    if (!formData[key] || formData[key].toString().trim() === "") {
      newErrors[key] = "This field is required";
    }
  });

  const numberFields = [
    "hoursMonday",
    "hoursTuesday",
    "hoursWednesday",
    "hoursThursday",
    "hoursFriday",
    "hoursOffJobMonday",
    "hoursOffJobTuesday",
    "hoursOffJobWednesday",
    "hoursOffJobThursday",
    "hoursOffJobFriday",
    "hoursWithTraineeMonday",
    "hoursWithTraineeTuesday",
    "hoursWithTraineeWednesday",
    "hoursWithTraineeThursday",
    "hoursWithTraineeFriday",
    "percentQualified",
    "knifeScore",
  ];

  numberFields.forEach((key) => {
    if (formData[key] && isNaN(Number(formData[key]))) {
      newErrors[key] = "Must be a number";
    }
  });

  return { newErrors };
};

export default useEvaluationsValidation;
