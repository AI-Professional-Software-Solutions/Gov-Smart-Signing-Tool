import { useEffect, useState } from "react";

export const useCurrentLanguage = () => {
  const [language, setLanguage] = useState<"ro" | "en">("en");

  useEffect(() => {
    const langMetaTag = document.querySelector('meta[name="language"]');
    if (langMetaTag) {
      if (langMetaTag.getAttribute("content") === "ro") {
        setLanguage("ro");
      } else {
        setLanguage("en");
      }
    }
  }, []);

  return language;
};

export default useCurrentLanguage;
