import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getTotalFile, incrementTotalFile, TOTAL_LIMIT } from "@/lib/fileCounter";
import { parseMyHeritageCsv } from "@/lib/parseCsv";
import {
  buildPromptContext,
  fallbackReport,
  searchRelevantVariants,
} from "@/lib/rag";
import { type AnalysisReport, type AnalysisResponse } from "@/lib/types";

export const runtime = "nodejs";

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function parseReport(content: string): AnalysisReport | null {
  try {
    const parsed = JSON.parse(content);
    if (
      parsed &&
      Array.isArray(parsed.risks) &&
      Array.isArray(parsed.avoid) &&
      Array.isArray(parsed.add) &&
      Array.isArray(parsed.general)
    ) {
      return {
        risks: parsed.risks,
        avoid: parsed.avoid,
        add: parsed.add,
        general: parsed.general,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileBlob = file instanceof Blob ? file : null;
    const langValue = (formData.get("language") as string) || "uk";
    const language = langValue === "en" ? "en" : "uk";

    if (!fileBlob) {
      return NextResponse.json(
        { error: "CSV file is required." },
        { status: 400 }
      );
    }

    // Limit total OpenAI calls across all users (file-based)
    const total = getTotalFile();
    if (total >= TOTAL_LIMIT) {
      return NextResponse.json(
        { error: "Limit reached", code: "LIMIT_REACHED", total },
        { status: 429 }
      );
    }

    const text = await fileBlob.text();

    let variants;
    try {
      variants = parseMyHeritageCsv(text);
    } catch (err) {
      console.error("CSV parse error", err);
      const message =
        err instanceof Error
          ? err.message
          : "Invalid CSV. Make sure required columns are present.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const matches = searchRelevantVariants(variants);
    const context = buildPromptContext(matches);

    const prompt = `
Based on the CSV genotypes (rsID + genotype) and the matched SNP nutrition knowledge, create a structured, concise report. Explain simply, without medical diagnoses.

Language: ${language === "uk" ? "Ukrainian" : "English"}
Sections required (arrays of short bullet sentences):
- risks
- avoid
- add
- general

 Keep it food-first, actionable, and encouraging. Do not invent new SNPs; rely only on the provided context.
 Each bullet should have a short user-friendly headline and 1–2 sentences that explain why and what to do (no gene/rsID jargon in text).

Context:
${context || "No matching SNPs were found."}

CRITICAL: Return ONLY RAW JSON, no Markdown, no code fences, no prose. Format exactly:
{"risks":[...], "avoid":[...], "add":[...], "general":[...]}
If unsure, return empty arrays for any section. Do not include any other text.
`;

    let report: AnalysisReport | null = null;

    if (!openaiClient) {
      console.warn("OpenAI client missing: check OPENAI_API_KEY");
      console.log("Env check OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
    } else {
      try {
        console.log("Calling OpenAI chat completion...");
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        });

        const content = completion.choices[0]?.message?.content ?? "";
        console.log("OpenAI raw content length:", content.length);
        report = parseReport(content);
        if (!report) {
          console.warn("OpenAI response could not be parsed as report JSON");
        }
        if (report) {
          incrementTotalFile();
        }
      } catch (err) {
        console.error("OpenAI call failed", err);
      }
    }

    const finalReport = report ?? fallbackReport(matches);

    const response: AnalysisResponse = {
      report: finalReport,
      matches,
      meta: {
        parsedVariants: variants.length,
        matchedVariants: matches.length,
        language,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analyze error", error);
    return NextResponse.json(
      { error: "Failed to analyze file." },
      { status: 500 }
    );
  }
}
