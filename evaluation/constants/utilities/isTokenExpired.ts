export const isTokenExpired = (payload: any) => {
  if (!payload.exp) {
    return true;
  }
  return payload.exp * 1000 < Date.now();
};
