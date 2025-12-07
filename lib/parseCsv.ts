import Papa from "papaparse";

import { type UserVariant } from "./types";

const EXPECTED_HEADERS = ["rsid", "chromosome", "position", "genotype"];

const HEADER_ALIASES: Record<string, string> = {
  snp: "rsid",
  id: "rsid",
  chrom: "chromosome",
  chr: "chromosome",
  pos: "position",
  result: "genotype",
  call: "genotype",
  calls: "genotype",
  allele1: "allele1",
  allele2: "allele2",
};

function normalizeHeader(header: string) {
  const normalized = header.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return HEADER_ALIASES[normalized] ?? normalized;
}

export function parseMyHeritageCsv(csvText: string): UserVariant[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    comments: "#",
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length) {
    const firstError = parsed.errors[0];
    throw new Error(
      `CSV parse error at row ${firstError.row ?? "?"}: ${firstError.message}`,
    );
  }

  const rows = (parsed.data as Record<string, string | number | null>[]).filter(
    (row) => Object.keys(row).length > 0,
  );

  const headers = parsed.meta.fields?.map(normalizeHeader) ?? [];
  const hasGenotypeColumn = headers.includes("genotype");
  const hasAlleles = headers.includes("allele1") && headers.includes("allele2");

  const missingHeaders = EXPECTED_HEADERS.filter((h) => {
    if (h === "genotype") return !hasGenotypeColumn && !hasAlleles;
    return !headers.includes(h);
  });
  if (missingHeaders.length) {
    throw new Error(
      `Missing required columns: ${missingHeaders.join(", ")}. Expected: ${EXPECTED_HEADERS.join(", ")}`,
    );
  }

  return rows
    .map((row) => {
      const rsid = String(row.rsid ?? "").trim();
      if (!rsid) return null;
      const chromosome = String(row.chromosome ?? "").trim();
      const positionValue = row.position;
      const position =
        positionValue === null || positionValue === undefined
          ? null
          : Number(positionValue);

      const allele1 = row.allele1 ? String(row.allele1).trim() : "";
      const allele2 = row.allele2 ? String(row.allele2).trim() : "";

      const genotypeRaw =
        row.genotype ??
        (allele1 || allele2 ? `${allele1}${allele2}` : row.result ?? row.call);

      const genotype = String(genotypeRaw ?? "")
        .replace(/\s+/g, "")
        .toUpperCase();

      return {
        rsid,
        chromosome,
        position: Number.isFinite(position) ? position : null,
        genotype,
      } satisfies UserVariant;
    })
    .filter(Boolean) as UserVariant[];
}

