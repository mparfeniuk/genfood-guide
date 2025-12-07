import fs from "fs";
import path from "path";

const COUNTER_PATH = path.join(process.cwd(), ".next", "cache", "openai_counter.json");
const TOTAL_LIMIT = 50;

type CounterData = { total: number };

function readFileSafe(): CounterData {
  try {
    const raw = fs.readFileSync(COUNTER_PATH, "utf8");
    const parsed = JSON.parse(raw) as CounterData;
    if (typeof parsed.total === "number") return parsed;
  } catch {
    // ignore
  }
  return { total: 0 };
}

function writeFileSafe(data: CounterData) {
  try {
    fs.mkdirSync(path.dirname(COUNTER_PATH), { recursive: true });
    fs.writeFileSync(COUNTER_PATH, JSON.stringify(data), "utf8");
  } catch (e) {
    console.error("fileCounter write error", e);
  }
}

export function getTotalFile(): number {
  const data = readFileSafe();
  return data.total;
}

export function incrementTotalFile(): number {
  const data = readFileSafe();
  const next = data.total + 1;
  writeFileSafe({ total: next });
  return next;
}

export { TOTAL_LIMIT };

