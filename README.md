# DNA Nutrition Explainer

Next.js 15 + Tailwind + shadcn-style UI app that ingests MyHeritage CSV files, matches SNPs against a local nutrition knowledge base (RAG), and returns bilingual (UA/EN) recommendations.

## Stack
- Next.js 15 (app router), TypeScript
- TailwindCSS + shadcn UI primitives
- OpenAI (gpt-4o-mini) with local RAG context (rsID-indexed knowledge)

## Quickstart
1) Install
```bash
npm install
```
2) Env
```bash
echo "OPENAI_API_KEY=your-key" > .env.local
```
If no key is provided, the API falls back to deterministic, rule-based summaries.

3) Run dev
```bash
npm run dev
```
Open http://localhost:3000.

## How it works
- Upload: `components/UploadCSV.tsx` handles drag/drop + validation. Sample file: `public/example/myheritage_sample.csv`.
- Parse: `lib/parseCsv.ts` expects headers rsid, chromosome, position, genotype; skips comment lines that start with `#`.
- Knowledge base: `lib/geneticsDb.ts` holds 20+ curated nutrition SNPs (effects, foods to favor/avoid, lifestyle notes).
- RAG: `lib/rag.ts` matches rsID/genotype, builds prompt context, and provides a deterministic fallback report if OpenAI is unavailable.
- API: `app/api/analyze/route.ts` parses CSV, runs RAG, calls OpenAI (when configured), and returns JSON sections: risks, avoid, add, general, plus matched SNPs.
- UI: `app/page.tsx` renders upload, analyze action, report cards, SNP match table, and language toggle (UA/EN).

## Deployment
- Target: Vercel (Node runtime). Add `OPENAI_API_KEY` to project env vars.
- Static assets: sample CSV under `public/example/`.

## Notes
- All processing is in-memory; no persistence.
- Output is food-first, concise, and avoids medical diagnoses. Comments in code are in English.
