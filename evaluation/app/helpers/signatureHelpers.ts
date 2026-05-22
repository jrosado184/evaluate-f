import axios from "axios";
import { Platform } from "react-native";

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

type UploadFilesMap = Record<string, UploadFile | null | undefined>;
type UploadFieldsMap = Record<
  string,
  string | number | boolean | null | undefined
>;

type UploadMultipartArgs = {
  baseUrl: string;
  token: string;
  endpoint: string;
  method?: "post" | "put" | "patch";
  files?: UploadFilesMap;
  fields?: UploadFieldsMap;
};

export function buildApiUrl(baseUrl: string, endpoint: string) {
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith("http")) return endpoint;

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${normalizedBase}${normalizedEndpoint}`;
}

export function buildMultipartFormData({
  files = {},
  fields = {},
}: {
  files?: UploadFilesMap;
  fields?: UploadFieldsMap;
}) {
  const fd = new FormData();

  Object.entries(files).forEach(([key, file]) => {
    if (!file) return;
    fd.append(key, file as any);
  });

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });

  return fd;
}

export async function uploadMultipart({
  baseUrl,
  token,
  endpoint,
  method = "post",
  files = {},
  fields = {},
}: UploadMultipartArgs) {
  const url = buildApiUrl(baseUrl, endpoint);
  const data = buildMultipartFormData({ files, fields });

  const response = await axios({
    url,
    method,
    data,
    headers: {
      Authorization: token,
      Accept: "application/json",
      ...(Platform.OS !== "web"
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });

  return response.data;
}

const getLatestEvaluationWeek = (response: any) => {
  const evaluations =
    response?.evaluations || response?.data?.evaluations || [];

  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return null;
  }

  return [...evaluations].sort(
    (a, b) => Number(b?.weekNumber || 0) - Number(a?.weekNumber || 0),
  )[0];
};

export function getUploadedFileMeta(
  response: any,
  key: string,
  fallbacks: string[] = [],
) {
  const latestWeek = getLatestEvaluationWeek(response);

  const allKeys = [key, ...fallbacks];

  const candidates = allKeys
    .flatMap((candidateKey) => [
      response?.files?.[candidateKey],
      response?.data?.files?.[candidateKey],
      response?.finalSignatures?.[candidateKey],
      response?.data?.finalSignatures?.[candidateKey],
      response?.[candidateKey],
      response?.data?.[candidateKey],
      latestWeek?.[candidateKey],
    ])
    .filter(Boolean);

  const match = candidates[0] || null;
  const isString = typeof match === "string";

  return {
    raw: match,
    fileId: isString
      ? null
      : match?.gridfsId || match?.fileId || match?._id || match?.id || null,
    path: isString
      ? match
      : match?.path || match?.url || match?.fileUrl || null,
    url: isString ? match : match?.url || match?.path || match?.fileUrl || null,
  };
}

export function pickUploadedFileUrl(
  response: any,
  key: string,
  fallbacks: string[] = [],
) {
  const meta = getUploadedFileMeta(response, key, fallbacks);
  return meta.url || "";
}

export function pickUploadedFileId(
  response: any,
  key: string,
  fallbacks: string[] = [],
) {
  const meta = getUploadedFileMeta(response, key, fallbacks);
  return meta.fileId || "";
}

export function toRelativeApiPath(absOrRel: string, baseUrl: string) {
  if (!absOrRel || typeof absOrRel !== "string") return "";

  if (absOrRel.startsWith("/")) {
    return absOrRel;
  }

  try {
    const fileUrl = new URL(absOrRel);
    const apiUrl = new URL(baseUrl);

    if (fileUrl.origin === apiUrl.origin) {
      return fileUrl.pathname;
    }
  } catch {
    return "";
  }

  return "";
}

export async function uploadEvaluationSignatures({
  baseUrl,
  token,
  evaluationId,
  weekNumber,
  files,
}: {
  baseUrl: string;
  token: string;
  evaluationId: string;
  weekNumber?: number;
  files: UploadFilesMap;
}) {
  return uploadMultipart({
    baseUrl,
    token,
    endpoint: `/evaluations/${evaluationId}/signatures`,
    method: "patch",
    files,
    fields: {
      weekNumber,
    },
  });
}

export async function uploadJsaSignatures({
  baseUrl,
  token,
  files,
  employeeId,
  jsaId,
}: {
  baseUrl: string;
  token: string;
  files: Record<string, any>;
  employeeId?: string;
  jsaId?: string;
}) {
  return uploadMultipart({
    baseUrl,
    token,
    endpoint: "/jsas/signatures",
    method: "post",
    files,
    fields: {
      type: "jsa_signature",
      employeeId,
      jsaId,
    },
  });
}
