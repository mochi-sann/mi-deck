import type { SupportedLanguage } from "@/lib/i18n/types";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const languages: { code: SupportedLanguage; name: string }[] = [
  { code: "ja", name: "日本語" },
  { code: "en", name: "English" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation("settings");

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    void i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Languages className="h-4 w-4" />
          <span className="ml-2">
            {languages.find((lang) => lang.code === i18n.language)?.name ||
              "Language"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={i18n.language === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
