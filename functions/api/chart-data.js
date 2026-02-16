const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatDateTime(date) {
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}`
  );
}

function parseLocalDate(value) {
  const raw = String(value || "");
  if (!/^\d{8}$/.test(raw)) return null;

  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6)) - 1;
  const d = Number(raw.slice(6, 8));

  return Math.floor(Date.UTC(y, m, d, 0, 0, 0) / 1000);
}

function toOhlcPoint(row) {
  const time = parseLocalDate(row?.localDate);
  const open = Number(row?.openPrice);
  const high = Number(row?.highPrice);
  const low = Number(row?.lowPrice);
  const close = Number(row?.closePrice);
  const volume = Number(row?.accumulatedTradingVolume || 0);

  if (!time || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close)) {
    return null;
  }

  return { time, open, high, low, close, volume };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status}`);
  }

  return response.json();
}

async function handleChartData(requestUrl) {
  const market = (requestUrl.searchParams.get("market") || "").toUpperCase();
  const code = (requestUrl.searchParams.get("code") || "").trim();

  if (!["KR", "US"].includes(market)) return json({ error: "Invalid market" }, 400);
  if (!/^[A-Za-z0-9.]+$/.test(code)) return json({ error: "Invalid code" }, 400);

  const end = new Date();
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 450);

  const startDateTime = formatDateTime(start);
  const endDateTime = formatDateTime(end);

  const path = market === "KR" ? `domestic/item/${code}/day` : `foreign/item/${code}/day`;
  const url = `https://api.stock.naver.com/chart/${path}?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

  const payload = await fetchJson(url);
  const rows = Array.isArray(payload) ? payload : [];
  const points = rows.map(toOhlcPoint).filter(Boolean);

  return json({
    market,
    code,
    interval: "day",
    points
  });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    return await handleChartData(url);
  } catch (error) {
    return json({ error: "Failed to load chart data", detail: String(error?.message || error) }, 500);
  }
}
