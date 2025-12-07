import { type Language } from "@/components/providers/language-provider";

export type UserVariant = {
  rsid: string;
  chromosome: string;
  position: number | null;
  genotype: string;
};

export type KnowledgeBaseEntry = {
  rsid: string;
  gene: string;
  trait: string;
  effect: string;
  impact: string;
  recommendedFoods: string[];
  avoidFoods: string[];
  lifestyleNotes: string;
  keywords: string[];
  reference?: string;
  riskAlleles?: string[];
};

export type RagMatch = {
  entry: KnowledgeBaseEntry;
  userGenotype: string;
  confidence: number;
  rationale: string;
};

export type AnalysisReport = {
  risks: string[];
  avoid: string[];
  add: string[];
  general: string[];
};

export type AnalysisResponse = {
  report: AnalysisReport;
  matches: RagMatch[];
  meta: {
    parsedVariants: number;
    matchedVariants: number;
    language: Language;
  };
};


