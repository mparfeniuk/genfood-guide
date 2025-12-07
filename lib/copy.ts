import { type Language } from "@/components/providers/language-provider";

export type CopyKey =
  | "heroTitle"
  | "heroSubtitle"
  | "uploadLabel"
  | "uploadHint"
  | "chooseFile"
  | "dropLabel"
  | "analyze"
  | "analyzing"
  | "sampleCta"
  | "snpMatches"
  | "reportTitle"
  | "risks"
  | "avoid"
  | "add"
  | "general"
  | "noFile"
  | "error";

type Copy = Record<Language, Record<CopyKey, string>>;

export const copy: Copy = {
  en: {
    heroTitle: "GeneFood Guide",
    heroSubtitle:
      "Upload your MyHeritage CSV and get clear, food-first guidance based on key SNPs.",
    uploadLabel: "Upload MyHeritage CSV",
    uploadHint: "We only read columns: rsid, chromosome, position, genotype.",
    chooseFile: "Choose file",
    dropLabel: "Drop CSV here or click to browse",
    analyze: "Analyze genetics",
    analyzing: "Analyzing...",
    sampleCta: "Use sample file",
    snpMatches: "Matched nutrition SNPs",
    reportTitle: "Personalized recommendations",
    risks: "Risks",
    avoid: "Avoid",
    add: "Add to diet",
    general: "General guidance",
    noFile: "Please add a MyHeritage CSV first.",
    error: "Something went wrong. Try again.",
  },
  uk: {
    heroTitle: "DNA харчовий консультант",
    heroSubtitle:
      "Завантажте CSV з MyHeritage та отримайте прості поради щодо раціону на основі ваших генетичних маркерів.",
    uploadLabel: "Завантажити MyHeritage CSV",
    uploadHint:
      "Читаємо лише колонки: rsid, chromosome, position, genotype.",
    chooseFile: "Обрати файл",
    dropLabel: "Перетягніть CSV або натисніть, щоб обрати",
    analyze: "Проаналізувати",
    analyzing: "Аналізуємо...",
    sampleCta: "Взяти приклад",
    snpMatches: "Збіги по SNP для харчування",
    reportTitle: "Персональні рекомендації",
    risks: "Ризики",
    avoid: "Уникати",
    add: "Додати до раціону",
    general: "Загальні поради",
    noFile: "Спершу додайте CSV з MyHeritage.",
    error: "Щось пішло не так. Спробуйте ще раз.",
  },
};

export function t(language: Language, key: CopyKey) {
  return copy[language][key];
}


