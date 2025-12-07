import { geneticsDb } from "./geneticsDb";
import {
  type AnalysisReport,
  type KnowledgeBaseEntry,
  type RagMatch,
  type UserVariant,
} from "./types";

const rsidIndex = new Map<string, KnowledgeBaseEntry>(
  geneticsDb.map((entry) => [entry.rsid.toLowerCase(), entry]),
);

function genotypeContainsRisk(genotype: string, riskAlleles?: string[]) {
  if (!riskAlleles || riskAlleles.length === 0) return false;
  return riskAlleles.some((allele) => genotype.includes(allele));
}

export function searchRelevantVariants(userVariants: UserVariant[]): RagMatch[] {
  return userVariants
    .map((variant) => {
      const entry = rsidIndex.get(variant.rsid.toLowerCase());
      if (!entry) return null;

      const hasRisk = genotypeContainsRisk(variant.genotype, entry.riskAlleles);
      const confidence = hasRisk ? 0.9 : 0.65;
      const rationale = hasRisk
        ? "User genotype contains noted risk allele."
        : "User rsID matches database; risk allele not clearly present.";

      return {
        entry,
        userGenotype: variant.genotype,
        confidence,
        rationale,
      } satisfies RagMatch;
    })
    .filter(Boolean) as RagMatch[];
}

export function buildPromptContext(matches: RagMatch[]) {
  return matches
    .map((match) => {
      const foods =
        match.entry.recommendedFoods.length > 0
          ? `Recommended: ${match.entry.recommendedFoods.join(", ")}.`
          : "";
      const avoid =
        match.entry.avoidFoods.length > 0
          ? `Avoid: ${match.entry.avoidFoods.join(", ")}.`
          : "";
      return `SNP ${match.entry.rsid} (${match.entry.gene}) for ${match.entry.trait}. Genotype: ${match.userGenotype}. Impact: ${match.entry.impact}. ${foods} ${avoid} Lifestyle: ${match.entry.lifestyleNotes}.`;
    })
    .join("\n");
}

export function fallbackReport(matches: RagMatch[]): AnalysisReport {
  const risks = matches.map(
    (m) => `${m.entry.trait}: ${m.entry.impact} (${m.entry.rsid}).`,
  );
  const avoid = [
    ...new Set(
      matches.flatMap((m) => m.entry.avoidFoods.map((food) => `${food}`)),
    ),
  ];
  const add = [
    ...new Set(
      matches.flatMap((m) => m.entry.recommendedFoods.map((food) => `${food}`)),
    ),
  ];
  const general = [
    ...new Set(matches.map((m) => `${m.entry.trait}: ${m.entry.lifestyleNotes}`)),
  ];

  return {
    risks: risks.slice(0, 6),
    avoid: avoid.slice(0, 10),
    add: add.slice(0, 10),
    general: general.slice(0, 6),
  };
}

