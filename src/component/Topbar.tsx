import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { getImagePath } from "../util/assets";

const LANGUAGE_LABELS: Record<string, string> = {
  ja: "JA",
  en: "EN",
  ko: "KO",
};

const SOCIAL_LINKS = [
  {
    id: 1,
    platform: "github",
    img: getImagePath("github"),
    url: "https://github.com/rlamnji?tab=repositories",
  },
  {
    id: 2,
    platform: "linkedin",
    img: getImagePath("linkedin"),
    url: "https://github.com/rlamnji?tab=repositories",
  },
  {
    id: 3,
    platform: "instagram",
    img: getImagePath("instagram"),
    url: "https://github.com/rlamnji?tab=repositories",
  },
];

export const TopBar = () => {
  const handleClickSocial = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="absolute top-0 right-3 z-10 w-full justify-end flex flex-row gap-3 py-3">
      {SOCIAL_LINKS.map(({ id, platform, url, img }) => (
        <div
          key={id}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          onClick={() => handleClickSocial(url)}
          className="rounded-full shadow-md w-10 h-10 cursor-pointer"
          aria-label={platform}
        ></div>
      ))}
    </div>
  );
};
