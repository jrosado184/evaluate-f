export const PERMISSIONS = {
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  LOCKERS_ASSIGN: "lockers:assign",
  EVALUATIONS_CREATE: "evaluations:create",
  EVALUATIONS_UPDATE: "evaluations:update",
  EVALUATIONS_COMPLETE: "evaluations:complete",
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.LOCKERS_ASSIGN,
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.EVALUATIONS_COMPLETE,
  ],
  trainer: [PERMISSIONS.EVALUATIONS_CREATE, PERMISSIONS.EVALUATIONS_UPDATE],
  supervisor: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_UPDATE,
  ],
};

export const canEditEvaluation = (evaluation: any, currentUser: any) => {
  const currentUserId = String(
    currentUser?.id || currentUser?.employee_id || currentUser?._id || "",
  );

  const isCreator =
    String(evaluation?.createdBy || "")
      .trim()
      .toLowerCase() ===
    String(currentUser?.name || currentUser?.employee_name || "")
      .trim()
      .toLowerCase();

  const isAssigned = Array.isArray(evaluation?.assignedTrainers)
    ? evaluation.assignedTrainers.some((trainer: any) =>
        String(trainer?.id === currentUserId),
      )
    : false;

  return isCreator || isAssigned;
};
