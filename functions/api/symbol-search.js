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

function toTvExchange(typeCode, market) {
  if (market === "KR") {
    return "KRX";
  }

  const code = String(typeCode || "").toUpperCase();
  if (code.includes("NASDAQ")) return "NASDAQ";
  if (code.includes("NYSE")) return "NYSE";
  if (code.includes("AMEX")) return "AMEX";
  return "NASDAQ";
}

function normalizeItems(rawItems, market) {
  const targetNation = market === "KR" ? "KOR" : "USA";
  const seen = new Set();

  const list = [];
  for (const item of rawItems || []) {
    if (item?.nationCode !== targetNation) continue;
    const url = String(item?.url || "");
    if (!(url.includes("/stock/") || url.includes("/etf/") || url.includes("/bond/"))) continue;

    const isKR = market === "KR";
    const symbol = isKR ? item.code : item.code;
    const code = isKR ? item.code : (item.reutersCode || item.code);
    if (!code || !symbol) continue;

    const uniqueKey = `${market}:${code}`;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);

    const exchange = item.typeCode || item.typeName || (isKR ? "KRX" : "US");
    const tvExchange = toTvExchange(exchange, market);
    const assetType = url.includes("/etf/")
      ? "ETF"
      : url.includes("/bond/")
        ? "BOND"
        : "STOCK";

    list.push({
      market,
      name: item.name || symbol,
      symbol,
      code,
      exchange,
      assetType,
      tvSymbol: `${tvExchange}:${symbol}`
    });
  }

  return list;
}

async function fetchSearch(q) {
  const params = new URLSearchParams({
    q,
    target: "stock",
    size: "30",
    page: "1"
  });

  const response = await fetch(`https://m.stock.naver.com/front-api/search?${params.toString()}`, {
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

async function handleSearch(requestUrl) {
  const market = (requestUrl.searchParams.get("market") || "").toUpperCase();
  const q = (requestUrl.searchParams.get("q") || "").trim();

  if (!["KR", "US"].includes(market)) return json({ error: "Invalid market" }, 400);
  if (q.length < 1) return json({ error: "Query is required" }, 400);

  const payload = await fetchSearch(q);
  const items = normalizeItems(payload?.result?.items || [], market);

  return json({
    market,
    query: q,
    total: items.length,
    items
  });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    return await handleSearch(url);
  } catch (error) {
    return json({ error: "Failed to search symbols", detail: String(error?.message || error) }, 500);
  }
}
