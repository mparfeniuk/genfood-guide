"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  ChevronRight,
  Info,
  Leaf,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { UploadCSV } from "@/components/UploadCSV";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { t } from "@/lib/copy";
import { type AnalysisResponse } from "@/lib/types";

type ReportKey = "risks" | "avoid" | "add" | "general";

const sectionIcons: Record<ReportKey, JSX.Element> = {
  risks: <Shield className="h-4 w-4 text-rose-500" />,
  avoid: <Stethoscope className="h-4 w-4 text-amber-500" />,
  add: <Leaf className="h-4 w-4 text-emerald-600" />,
  general: <Sparkles className="h-4 w-4 text-sky-600" />,
};

const foodEmoji = ["🥑", "🍎", "🍇", "🥕", "🍊", "🍚", "🥗"];
const TOTAL_LIMIT = 50;

export default function Home() {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [bannerLang, setBannerLang] = useState<"uk" | "en">("uk");
  const [bannerCollapsed, setBannerCollapsed] = useState(false);

  const text = (key: Parameters<typeof t>[1]) => t(language, key);

  const runSample = async () => {
    const res = await fetch("/example/myheritage_sample.csv");
    const blob = await res.blob();
    const sampleFile = new File([blob], "myheritage_sample.csv", {
      type: "text/csv",
    });
    setFile(sampleFile);
    setResult(null);
  };

  const onAnalyze = async () => {
    if (!file) {
      setError(text("noFile"));
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const textBody = await response.text();
        let msg = textBody;
        try {
          const parsed = JSON.parse(textBody);
          msg = parsed.error ?? textBody;
          if (parsed.code === "LIMIT_REACHED") {
            msg = "Ліміт реальних запитів вичерпано. Використайте DEMO.";
          }
        } catch {
          // ignore JSON parse
        }
        throw new Error(msg);
      }
      const data = (await response.json()) as AnalysisResponse;
      setResult(data);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : text("error");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isBusy = isLoading || isDemoLoading;
    if (!isBusy) return;
    const id = setInterval(() => {
      setEmojiIndex((idx) => (idx + 1) % foodEmoji.length);
    }, 600);
    return () => clearInterval(id);
  }, [isLoading, isDemoLoading]);

  useEffect(() => {
    const loadTotal = async () => {
      try {
        const res = await fetch("/api/limit");
        if (!res.ok) return;
        const data = (await res.json()) as {
          total?: number;
          available?: boolean;
          limit?: number;
        };
        if (data.available) {
          setTotalRequests(typeof data.total === "number" ? data.total : 0);
        }
      } catch {
        // silent
      }
    };
    loadTotal();
  }, []);

  const onAnalyzeDemo = async () => {
    setError(null);
    setResult(null);
    setIsDemoLoading(true);
    try {
      const response = await fetch("/example/demo-analysis.json");
      if (!response.ok) {
        throw new Error("Failed to load demo");
      }
      const data = (await response.json()) as AnalysisResponse;
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(text("error"));
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="container py-10 space-y-10">
      <section
        className="rounded-xl border border-[#e5b700] bg-[#fff3b0] text-black shadow-sm p-4 space-y-3"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {bannerLang === "uk"
              ? "Марафон з вайбкодінгу"
              : "Vibe-coding marathon"}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setBannerCollapsed((v) => !v)}
              className="rounded border border-[#e5b700] px-2 py-1 hover:bg-[#ffe680] transition text-xs font-medium"
            >
              {bannerCollapsed ? "▸" : "▾"}{" "}
              {bannerLang === "uk" ? "Згорнути" : "Collapse"}
            </button>
            <button
              onClick={() =>
                setBannerLang((prev) => (prev === "uk" ? "en" : "uk"))
              }
              className="rounded border border-[#e5b700] px-2 py-1 hover:bg-[#ffe680] transition text-xs font-medium"
            >
              {bannerLang === "uk" ? "EN" : "UA"}
            </button>
          </div>
        </div>

        {!bannerCollapsed ? (
          <div className="space-y-3 text-sm leading-relaxed">
            <div className="space-y-1">
              {bannerLang === "uk" ? (
                <>
                  <p>
                    Марафон з вайбкодінгу: 10 проєктів, по одному на день,
                    максимум 5 годин.
                  </p>
                  <p>
                    Легка навчальна штука, щоб перезавантажитися після великих
                    задач.
                  </p>
                  <p>
                    Це швидкі прототипи, зроблені в темпі 3–4 годин, тож можливі
                    невеличкі лаги.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Vibe-coding marathon: 10 projects, one per day, max 5 hours.
                  </p>
                  <p>A light learning build to reset after bigger work.</p>
                  <p>
                    These are quick prototypes built in a 3–4 hour sprint, so
                    minor lags are possible.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wide">
                {bannerLang === "uk" ? "МЕТА" : "GOALS"}
              </span>
              <ul className="space-y-2">
                {(bannerLang === "uk"
                  ? [
                      "Пофанити й покреативити, пробрейнстормити ідеї.",
                      "Відпрацювати вайбкодинг і швидкий перехід від ідеї до MVP.",
                      "Подивитися, як AI-підхід впливає на темп і якість.",
                      "Зрозуміти сильні/слабкі сторони підходу. Потенційні продуктові вигоди.",
                      "Напрацьовувати нове мислення в реалізації проектів.",
                      "Вчасно відриватися від коду й приборкувати перфекціонізм — робити швидко й без залипань.",
                    ]
                  : [
                      "Have fun, get creative, brainstorm ideas.",
                      "Practice vibe-coding and jumping from idea to live MVP fast.",
                      "See how the AI-assisted approach affects speed and quality.",
                      "Understand approach strengths/weak spots. Potential product wins.",
                      "Build a new mindset for shipping projects.",
                      "Step away on time and tame perfectionism — ship fast, skip endless polish.",
                    ]
                ).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm leading-snug"
                  >
                    <span className="mt-[2px] text-base">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/70 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              GeneFood Guide
            </p>
            <p className="text-sm text-muted-foreground">
              MyHeritage CSV → personalized lifestyle advice
            </p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                RAG + OpenAI
              </Badge>
              <Badge variant="success">MyHeritage CSV</Badge>
              <Badge variant="secondary">UA / EN</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {t(language, "heroTitle")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t(language, "heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-secondary px-3 py-1">
                  • lactose • caffeine • gluten • fats • vitamin D • sport
                </span>
                <span className="rounded-full bg-secondary px-3 py-1">
                  • 20+ curated SNP markers
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="bg-gradient-to-br from-primary/10 via-white to-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Instant RAG</CardTitle>
                  <CardDescription>
                    Local SNP index, no data stored.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Matched to nutrition SNP knowledge base.
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-sky-50 via-white to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Friendly output</CardTitle>
                  <CardDescription>Food-first, no diagnoses.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Clear bullets: risks, avoid, add, general.
                </CardContent>
              </Card>
            </div>
          </section>

          <UploadCSV
            onFileSelected={setFile}
            label={t(language, "uploadLabel")}
            hint={t(language, "uploadHint")}
            chooseFileLabel={t(language, "chooseFile")}
            dropLabel={t(language, "dropLabel")}
            sampleCta={t(language, "sampleCta")}
            onUseSample={runSample}
            selectedFileName={file?.name}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button
              onClick={onAnalyze}
              disabled={isLoading || isDemoLoading}
              className="gap-2"
              title={
                totalRequests !== null
                  ? `Використано ${totalRequests}/${TOTAL_LIMIT} реальних запитів до OpenAI. Після ліміту доступний лише DEMO.`
                  : "Використано реальні запити до OpenAI. Після ліміту доступний лише DEMO."
              }
            >
              {isLoading ? t(language, "analyzing") : t(language, "analyze")}
              {totalRequests !== null ? (
                <abbr
                  title={`Залишилось ${Math.max(
                    0,
                    TOTAL_LIMIT - totalRequests
                  )} з ${TOTAL_LIMIT} реальних запитів до OpenAI. Після ліміту доступний лише DEMO.`}
                  className="text-xs rounded-full bg-primary px-2 py-0.5 text-white no-underline"
                >
                  {totalRequests}/{TOTAL_LIMIT}
                </abbr>
              ) : null}
            </Button>
            <Button
              variant="outline"
              onClick={onAnalyzeDemo}
              disabled={isLoading || isDemoLoading}
              className="gap-2"
              title="Якщо у вас немає CSV з ДНК-даними, натисніть DEMO, щоб подивитися приклад звіту."
              aria-label="Проаналізувати DEMO"
            >
              {isDemoLoading ? t(language, "analyzing") : "Проаналізувати DEMO"}
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          {result ? (
            <div className="text-sm text-muted-foreground">
              Parsed {result.meta.parsedVariants} variants ·{" "}
              {result.meta.matchedVariants} matched
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t(language, "reportTitle")}</CardTitle>
                  <CardDescription>
                    AI-generated with structured sections
                  </CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                (["risks", "avoid", "add", "general"] as ReportKey[]).map(
                  (key) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border/70 bg-muted/50 p-3"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        {sectionIcons[key]}
                        <p className="text-sm font-semibold">
                          {t(language, key)}
                        </p>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.report[key]?.length ? (
                          result.report[key].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                              <span className="flex-1 leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-muted-foreground/80">
                            —
                          </li>
                        )}
                      </ul>
                    </div>
                  )
                )
              ) : isLoading || isDemoLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-lg">{foodEmoji[emojiIndex]}</span>
                  <span>Аналізую...</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Load a CSV to see a personalized report.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t(language, "snpMatches")}</CardTitle>
                <CardDescription>
                  Crosswalk between your CSV and curated SNPs
                </CardDescription>
              </div>
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {result && result.matches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>rsID</TableHead>
                    <TableHead>Trait</TableHead>
                    <TableHead>Genotype</TableHead>
                    <TableHead>Foods</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.matches.map((match) => (
                    <TableRow key={match.entry.rsid}>
                      <TableCell className="font-semibold">
                        {match.entry.rsid}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {match.entry.trait}
                      </TableCell>
                      <TableCell>{match.userGenotype}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {match.entry.recommendedFoods.slice(0, 3).join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            match.confidence > 0.8 ? "success" : "secondary"
                          }
                        >
                          {Math.round(match.confidence * 100)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-muted-foreground">
                Upload a CSV to see matched SNPs for nutrition and lifestyle.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-6">
        Day 3. Vibe coding marathon. Author{" "}
        <a
          href="https://www.linkedin.com/in/mparfeniuk/"
          className="underline hover:text-primary"
          target="_blank"
          rel="noreferrer"
        >
          Max Parfeniuk
        </a>
      </footer>
    </div>
  );
}
