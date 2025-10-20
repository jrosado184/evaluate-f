/* ===== helpers used by SignatureModal upload ===== */

import axios from "axios";
import { Platform } from "react-native";

export function pickSigUrlFromResponse(role: any, resp: any) {
  return (
    resp?.files?.[role]?.path ||
    resp?.files?.[role]?.url ||
    resp?.[role]?.path ||
    resp?.[role]?.url ||
    ""
  );
}

export function toRelativeSignaturePath(absOrRel: any, baseUrl: any) {
  if (!absOrRel) return "";
  if (absOrRel.startsWith("/api/signatures/")) return absOrRel;
  try {
    // strip the origin if it matches baseUrl
    const u = new URL(absOrRel);
    const b = new URL(baseUrl);
    if (u.origin === b.origin && u.pathname.startsWith("/api/signatures/")) {
      return u.pathname;
    }
  } catch {
    // ignore parse errors; just return empty and let caller fallback
  }
  return "";
}

/** Upload weekly signatures as multipart; includes weekNumber so backend can replace existing GridFS file for same week+role */
export async function uploadSignaturesMultipart({
  baseUrl,
  evaluationId,
  token,
  files,
  weekNumber,
}: any) {
  const fd = new FormData();
  if (files.employee) fd.append("employee", files.employee);
  if (files.trainer) fd.append("trainer", files.trainer);
  if (files.supervisor) fd.append("supervisor", files.supervisor);
  if (typeof weekNumber !== "undefined") {
    fd.append("weekNumber", String(weekNumber));
  }

  const { data } = await axios.patch(
    `${baseUrl}/evaluations/${evaluationId}/signatures`,
    fd,
    {
      headers: {
        Authorization: token,
        ...(Platform.OS !== "web"
          ? { "Content-Type": "multipart/form-data" }
          : {}),
        Accept: "application/json",
      },
    }
  );

  return data; // { ok: true, files: { trainer: {path,url,gridfsId}, ... } }
}
