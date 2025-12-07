const appId = process.env.INSTANT_APP_ID;
const serviceToken = process.env.INSTANT_SERVICE_TOKEN;

type CounterDoc = { id?: string; total: number };

async function instantFetch(path: string, init?: RequestInit) {
  if (!appId || !serviceToken) return null;
  const url = `https://api.instantdb.com/v1/app/${appId}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("InstantDB error", res.status, await res.text());
    return null;
  }
  const text = await res.text();
  if (!text || !text.trim()) {
    // Instant інколи повертає порожнє тіло навіть при 200
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("InstantDB parse error", e);
    return null;
  }
}

export async function getTotalInstant(): Promise<number | null> {
  const data = await instantFetch("/query", {
    method: "POST",
    body: JSON.stringify({ counter: {} }),
  });
  const rows = (data?.counter as CounterDoc[] | undefined) ?? [];
  const first = rows[0];
  return typeof first?.total === "number" ? first.total : 0;
}

export async function setTotalInstant(total: number): Promise<boolean> {
  const body = {
    counter: [
      {
        id: "global",
        total,
      },
    ],
  };
  const res = await instantFetch("/table/counter", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return !!res;
}

export function hasInstant() {
  return !!appId && !!serviceToken;
}

