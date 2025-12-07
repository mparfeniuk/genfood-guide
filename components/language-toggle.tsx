"use client";

import { Languages } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 rounded-full px-3"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span>{language === "uk" ? "Укр / EN" : "EN / Укр"}</span>
    </Button>
  );
}


