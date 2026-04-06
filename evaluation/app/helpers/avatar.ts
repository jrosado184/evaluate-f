const avatarThemes = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

export const getAvatarMeta = (name: string = "") => {
  const safeName = name.trim();

  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const theme =
    avatarThemes[(safeName.charCodeAt(0) || 65) % avatarThemes.length];

  return {
    initials,
    ...theme,
  };
};
