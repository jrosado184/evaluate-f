import { ROLE_PERMISSIONS } from "@/app/config/permissions";

export const can = (user: any, permission: string) => {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  return (ROLE_PERMISSIONS[role] || []).includes(permission);
};
