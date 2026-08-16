const ICON_MODULES = import.meta.glob<{ default: string }>(
  "../assets/icon/*.webp",
  { eager: true },
);

export const getImagePath = (platform: string): string => {
  const entry = Object.entries(ICON_MODULES).find(([path]) =>
    path.endsWith(`/${platform}.webp`),
  );

  if (!entry) {
    throw new Error(`No icon found for platform "${platform}"`);
  }

  return entry[1].default;
};
