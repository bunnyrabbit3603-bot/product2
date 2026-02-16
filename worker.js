const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const DAILY_INSIGHTS_CACHE = new Map();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

function parseNumber(value) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).replace(/,/g, "").replace(/[^0-9.-]/g, "");
  if (!normalized || normalized === "-" || normalized === ".") {
    return null;
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function getTotalInfoMap(basic, integration) {
  const list = Array.isArray(basic?.stockItemTotalInfos)
    ? basic.stockItemTotalInfos
    : Array.isArray(integration?.totalInfos)
      ? integration.totalInfos
      : [];

  return list.reduce((acc, item) => {
    if (item?.code) {
      acc[item.code] = item;
    }
    return acc;
  }, {});
}

function calcEpsGrowth(finance) {
  const epsCols = finance?.chartEps?.columns;
  if (!Array.isArray(epsCols) || epsCols.length < 2) {
    return null;
  }

  const values = epsCols[1].slice(1).map(parseNumber).filter((v) => v != null);
  if (values.length < 2) {
    return null;
  }

  const latest = values[values.length - 1];
  const base = values.length >= 5 ? values[values.length - 5] : values[0];
  if (!base) {
    return null;
  }

  return ((latest - base) / Math.abs(base)) * 100;
}

function findRowValue(rows, names) {
  for (const [label, ...values] of rows || []) {
    if (names.includes(label)) {
      return values.map(parseNumber).filter((v) => v != null);
    }
  }
  return [];
}

function calcRevenueGrowth(finance) {
  const annual = finance?.chartIncomeStatement?.annual?.columns;
  if (!Array.isArray(annual)) {
    return null;
  }

  const series = findRowValue(annual, ["매출액", "매출", "Revenue"]);
  if (series.length < 2) {
    return null;
  }

  const latest = series[series.length - 1];
  const prev = series[series.length - 2];
  if (!prev) {
    return null;
  }

  return ((latest - prev) / Math.abs(prev)) * 100;
}

function calcOperatingMargin(finance) {
  const annual = finance?.chartIncomeStatement?.annual?.columns;
  if (!Array.isArray(annual)) {
    return null;
  }

  const series = findRowValue(annual, ["영업이익률", "Operating Margin"]);
  if (!series.length) {
    return null;
  }

  return series[series.length - 1];
}

function formatPct(value) {
  if (value == null || !Number.isFinite(value)) {
    return "N/A";
  }
  return `${value.toFixed(2)}%`;
}

function formatNum(value) {
  if (value == null || !Number.isFinite(value)) {
    return "N/A";
  }
  return value.toFixed(2);
}

function formatSignedPct(value) {
  if (value == null || !Number.isFinite(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatPercentString(value) {
  if (value == null) return "N/A";
  const raw = String(value).trim();
  if (!raw) return "N/A";
  if (raw.endsWith("%")) return raw;
  const num = Number(raw);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : raw;
}

function detectAssetType(basic) {
  const endType = String(basic?.stockEndType || "").toLowerCase();
  if (endType.includes("etf")) return "ETF";
  if (endType.includes("bond")) return "BOND";

  const name = String(basic?.stockName || "");
  if (name.includes("채권")) return "BOND";
  return "STOCK";
}

function buildShareholderMetrics(assetType, info, integration) {
  if (assetType === "ETF") {
    const distYield =
      info.dividendYieldRatio?.value ||
      formatPercentString(integration?.etfKeyIndicator?.dividendYieldTtm);

    return {
      "분배수익률": distYield || "N/A",
      "주당분배금": info.dividend?.value || "N/A",
      "분배일": info.dividendAt?.value || "N/A",
      "분배락일": info.exDividendAt?.value || "N/A"
    };
  }

  if (assetType === "BOND") {
    return {
      "이자수익률": info.dividendYieldRatio?.value || "N/A",
      "표면금리": info.couponRate?.value || "N/A",
      "이자지급일": info.dividendAt?.value || "N/A",
      "만기일": info.maturityAt?.value || "N/A"
    };
  }

  return {
    "배당수익률": info.dividendYieldRatio?.value || "N/A",
    "주당배당금": info.dividend?.value || "N/A",
    "배당일": info.dividendAt?.value || "N/A",
    "배당락일": info.exDividendAt?.value || "N/A"
  };
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function extractPeerCodes(market, integration, currentCode) {
  const peers = market === "US"
    ? integration?.industryCompareInfo?.globalStocks
    : integration?.industryCompareInfo;

  if (!Array.isArray(peers)) return [];

  const seen = new Set();
  const codes = [];
  for (const peer of peers) {
    if (market === "US" && peer?.nationType && peer.nationType !== "USA") continue;

    const code = market === "US"
      ? (peer?.reutersCode || "")
      : (peer?.itemCode || peer?.reutersCode || "");

    if (!code || code === currentCode || seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
    if (codes.length >= 8) break;
  }

  return codes;
}

async function fetchPeerValuationAverages(base, peerCodes) {
  if (!peerCodes.length) return { avgPer: null, avgPbr: null };

  const settled = await Promise.allSettled(
    peerCodes.map(async (peerCode) => {
      const [basic, integration] = await Promise.all([
        fetchJson(`${base}/${encodeURIComponent(peerCode)}/basic`),
        fetchJson(`${base}/${encodeURIComponent(peerCode)}/integration`)
      ]);
      return { basic, integration };
    })
  );

  const perValues = [];
  const pbrValues = [];

  for (const item of settled) {
    if (item.status !== "fulfilled") continue;
    const info = getTotalInfoMap(item.value.basic, item.value.integration);
    const per = parseNumber(info.per?.value);
    const pbr = parseNumber(info.pbr?.value);
    if (per != null) perValues.push(per);
    if (pbr != null) pbrValues.push(pbr);
  }

  const avgPer = perValues.length ? perValues.reduce((a, b) => a + b, 0) / perValues.length : null;
  const avgPbr = pbrValues.length ? pbrValues.reduce((a, b) => a + b, 0) / pbrValues.length : null;
  return { avgPer, avgPbr };
}

function buildValuationCompareMetrics(info, avgPer, avgPbr, dateKey) {
  const per = parseNumber(info.per?.value);
  const pbr = parseNumber(info.pbr?.value);
  const perGap = per != null && avgPer != null && avgPer !== 0 ? ((per / avgPer) - 1) * 100 : null;
  const pbrGap = pbr != null && avgPbr != null && avgPbr !== 0 ? ((pbr / avgPbr) - 1) * 100 : null;

  return {
    기준일: dateKey,
    "내 PER": info.per?.value || "N/A",
    "업종 평균 PER": avgPer == null ? "N/A" : `${avgPer.toFixed(2)}배`,
    "PER 괴리": formatSignedPct(perGap),
    "내 PBR": info.pbr?.value || "N/A",
    "업종 평균 PBR": avgPbr == null ? "N/A" : `${avgPbr.toFixed(2)}배`,
    "PBR 괴리": formatSignedPct(pbrGap)
  };
}

function buildConsensusMetrics(integration, basic, dateKey) {
  const consensus = integration?.consensusInfo || {};
  const recommMean = parseNumber(consensus.recommMean);
  const targetMean = parseNumber(consensus.priceTargetMean);
  const currentPrice = parseNumber(basic?.closePrice);
  const upside =
    targetMean != null && currentPrice != null && currentPrice !== 0
      ? ((targetMean / currentPrice) - 1) * 100
      : null;

  return {
    기준일: consensus.createDate || dateKey,
    "투자의견 점수": recommMean == null ? "N/A" : recommMean.toFixed(2),
    "목표가 평균": consensus.priceTargetMean || "N/A",
    "목표가 상단": consensus.priceTargetHigh || "N/A",
    "목표가 하단": consensus.priceTargetLow || "N/A",
    "상승여력(목표가 기준)": formatSignedPct(upside)
  };
}

async function getDailyInsights({ market, code, basic, integration, base }) {
  const dateKey = getTodayKey();
  const cacheKey = `${dateKey}:${market}:${code}`;
  const cached = DAILY_INSIGHTS_CACHE.get(cacheKey);
  if (cached) return cached;

  const info = getTotalInfoMap(basic, integration);
  const assetType = detectAssetType(basic);

  let avgPer = null;
  let avgPbr = null;
  if (assetType === "STOCK") {
    const peerCodes = extractPeerCodes(market, integration, code);
    const averages = await fetchPeerValuationAverages(base, peerCodes);
    avgPer = averages.avgPer;
    avgPbr = averages.avgPbr;
  }

  const insights = {
    valuationCompare: buildValuationCompareMetrics(info, avgPer, avgPbr, dateKey),
    analystConsensus: buildConsensusMetrics(integration, basic, dateKey)
  };

  DAILY_INSIGHTS_CACHE.set(cacheKey, insights);
  return insights;
}

function toEodhdUsSymbol(symbol) {
  const raw = String(symbol || "").trim().toUpperCase();
  if (!raw) return "";
  if (raw.endsWith(".US")) return raw;

  if (raw.includes(".")) {
    const base = raw.slice(0, raw.lastIndexOf("."));
    return `${base}.US`;
  }

  return `${raw}.US`;
}

function extractForwardPe(payload) {
  if (payload == null) return null;

  if (typeof payload === "number" || typeof payload === "string") {
    const direct = Number(payload);
    return Number.isFinite(direct) ? direct : null;
  }

  const raw =
    payload?.Highlights?.ForwardPE ??
    payload?.Valuation?.ForwardPE ??
    payload?.forward_pe ??
    payload?.ForwardPE;

  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

async function fetchUsForwardPe(symbol, apiKey) {
  if (!symbol) return null;

  const key = apiKey || "demo";
  const eodhdSymbol = toEodhdUsSymbol(symbol);
  const encodedSymbol = encodeURIComponent(eodhdSymbol);
  const encodedKey = encodeURIComponent(key);
  const urls = [
    `https://eodhd.com/api/fundamentals/${encodedSymbol}?filter=Highlights::ForwardPE&api_token=${encodedKey}&fmt=json`,
    `https://eodhd.com/api/fundamentals/${encodedSymbol}?api_token=${encodedKey}&fmt=json`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json"
        }
      });
      if (!response.ok) continue;

      const payload = await response.json();
      const value = extractForwardPe(payload);
      if (value != null) return value;
    } catch (_) {
      // Ignore parsing/network errors and try fallback endpoint.
    }
  }

  return null;
}

function buildPayload(meta, basic, integration, finance, forwardPe, insights) {
  const info = getTotalInfoMap(basic, integration);
  const assetType = detectAssetType(basic);
  const shareholderMetrics = buildShareholderMetrics(assetType, info, integration);

  const perRaw = info.per?.value;
  const pbrRaw = info.pbr?.value;
  const cnsPerRaw = forwardPe != null ? `${forwardPe.toFixed(2)}배` : info.cnsPer?.value;
  const cnsEpsRaw = info.cnsEps?.value;
  const per = parseNumber(perRaw);
  const epsGrowth = calcEpsGrowth(finance);
  const peg = per != null && epsGrowth != null && epsGrowth > 0 ? per / epsGrowth : null;

  const opMargin = calcOperatingMargin(finance);
  const revenueGrowth = calcRevenueGrowth(finance);

  const high52 = parseNumber(info.highPriceOf52Weeks?.value);
  const low52 = parseNumber(info.lowPriceOf52Weeks?.value);
  const priceNow = parseNumber(basic?.closePrice);
  const pos52 =
    priceNow != null && high52 != null && low52 != null && high52 > low52
      ? ((priceNow - low52) / (high52 - low52)) * 100
      : null;

  const change = basic?.fluctuationsRatio ? `${basic.fluctuationsRatio}%` : "N/A";
  const point = basic?.compareToPreviousClosePrice ?? "N/A";

  return {
    market: meta.market,
    code: meta.code,
    quote: {
      name: basic?.stockName || meta.name,
      symbol: basic?.symbolCode || meta.symbol,
      exchange: basic?.stockExchangeName || meta.exchange,
      price: basic?.closePrice || "N/A",
      change,
      point,
      marketCap: info.marketValue?.value || "N/A",
      volume: info.accumulatedTradingVolume?.value || "N/A",
      updatedAt: basic?.localTradedAt || "N/A"
    },
    sections: {
      valuation: {
        badge: "실시간 반영",
        metrics: {
          PER: perRaw || "N/A",
          PEG: formatNum(peg),
          PBR: pbrRaw || "N/A",
          "추정PER": cnsPerRaw || "N/A",
          "추정EPS": cnsEpsRaw || "N/A"
        }
      },
      profitability: {
        badge: "재무요약 기반",
        metrics: {
          "영업이익률": formatPct(opMargin),
          "시가총액": info.marketValue?.value || "N/A",
          "거래대금": info.accumulatedTradingValue?.value || "N/A"
        }
      },
      growth: {
        badge: "최근 분기/연간",
        metrics: {
          "EPS 성장률(추정)": formatPct(epsGrowth),
          "매출 성장률(YoY)": formatPct(revenueGrowth),
          "52주 최고": info.highPriceOf52Weeks?.value || "N/A",
          "52주 최저": info.lowPriceOf52Weeks?.value || "N/A"
        }
      },
      stability: {
        badge: "변동성 참고",
        metrics: {
          "52주 위치": formatPct(pos52),
          "전일 대비": point,
          "등락률": change,
          "시장": basic?.stockExchangeName || "N/A"
        }
      },
      shareholder: {
        badge: assetType === "ETF" ? "ETF 분배" : assetType === "BOND" ? "채권 이자" : "주주환원",
        metrics: shareholderMetrics
      },
      comparison: {
        badge: "일 1회 갱신",
        metrics: insights?.valuationCompare || {}
      },
      consensus: {
        badge: "일 1회 갱신",
        metrics: insights?.analystConsensus || {}
      }
    }
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status}`);
  }

  return response.json();
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

function normalizeSearchItems(rawItems, market) {
  const targetNation = market === "KR" ? "KOR" : "USA";
  const seen = new Set();
  const list = [];

  for (const item of rawItems || []) {
    if (item?.nationCode !== targetNation) continue;
    const url = String(item?.url || "");
    if (!(url.includes("/stock/") || url.includes("/etf/") || url.includes("/bond/"))) continue;

    const isKR = market === "KR";
    const symbol = item.code;
    const code = isKR ? item.code : (item.reutersCode || item.code);
    if (!symbol || !code) continue;

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

async function handleStockData(request, env) {
  const url = new URL(request.url);
  const market = (url.searchParams.get("market") || "").toUpperCase();
  const code = url.searchParams.get("code") || "";

  if (!["KR", "US"].includes(market)) {
    return json({ error: "Invalid market" }, 400);
  }

  if (!/^[A-Za-z0-9.]+$/.test(code)) {
    return json({ error: "Invalid code" }, 400);
  }

  const isKR = market === "KR";
  const base = isKR ? "https://m.stock.naver.com/api/stock" : "https://api.stock.naver.com/stock";

  const basicUrl = `${base}/${encodeURIComponent(code)}/basic`;
  const integrationUrl = `${base}/${encodeURIComponent(code)}/integration`;
  const financeUrl = `${base}/${encodeURIComponent(code)}/finance/summary`;

  const [basic, integration, finance] = await Promise.all([
    fetchJson(basicUrl),
    fetchJson(integrationUrl),
    fetchJson(financeUrl)
  ]);

  if (basic?.code === "StockConflict") {
    return json({ error: "Symbol not found" }, 404);
  }

  let forwardPe = null;
  if (market === "US") {
    forwardPe = await fetchUsForwardPe(basic?.symbolCode, env?.EODHD_API_KEY);
  }

  const insights = await getDailyInsights({ market, code, basic, integration, base });
  return json(buildPayload({ market, code }, basic, integration, finance, forwardPe, insights));
}

async function handleSymbolSearch(request) {
  const url = new URL(request.url);
  const market = (url.searchParams.get("market") || "").toUpperCase();
  const q = (url.searchParams.get("q") || "").trim();

  if (!["KR", "US"].includes(market)) {
    return json({ error: "Invalid market" }, 400);
  }

  if (!q) {
    return json({ error: "Query is required" }, 400);
  }

  const params = new URLSearchParams({
    q,
    target: "stock",
    size: "30",
    page: "1"
  });

  const upstream = await fetch(`https://m.stock.naver.com/front-api/search?${params.toString()}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json"
    }
  });

  if (!upstream.ok) {
    throw new Error(`Upstream request failed: ${upstream.status}`);
  }

  const payload = await upstream.json();
  const items = normalizeSearchItems(payload?.result?.items || [], market);

  return json({
    market,
    query: q,
    total: items.length,
    items
  });
}

async function handleChartData(request) {
  const url = new URL(request.url);
  const market = (url.searchParams.get("market") || "").toUpperCase();
  const code = (url.searchParams.get("code") || "").trim();

  if (!["KR", "US"].includes(market)) {
    return json({ error: "Invalid market" }, 400);
  }

  if (!/^[A-Za-z0-9.]+$/.test(code)) {
    return json({ error: "Invalid code" }, 400);
  }

  const end = new Date();
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 450);
  const startDateTime = formatDateTime(start);
  const endDateTime = formatDateTime(end);

  const path = market === "KR" ? `domestic/item/${code}/day` : `foreign/item/${code}/day`;
  const chartUrl = `https://api.stock.naver.com/chart/${path}?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
  const payload = await fetchJson(chartUrl);

  const rows = Array.isArray(payload) ? payload : [];
  const points = rows.map(toOhlcPoint).filter(Boolean);

  return json({
    market,
    code,
    interval: "day",
    points
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/stock-data") {
      try {
        return await handleStockData(request, env);
      } catch (error) {
        return json({ error: "Failed to load stock data", detail: String(error?.message || error) }, 500);
      }
    }

    if (url.pathname === "/api/symbol-search") {
      try {
        return await handleSymbolSearch(request);
      } catch (error) {
        return json({ error: "Failed to search symbols", detail: String(error?.message || error) }, 500);
      }
    }

    if (url.pathname === "/api/chart-data") {
      try {
        return await handleChartData(request);
      } catch (error) {
        return json({ error: "Failed to load chart data", detail: String(error?.message || error) }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
