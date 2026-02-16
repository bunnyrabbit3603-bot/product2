const DEFAULT_STOCKS = {
  KR: [
    { code: "005930", symbol: "005930", name: "삼성전자", exchange: "KRX", tvSymbol: "KRX:005930", market: "KR" },
    { code: "000660", symbol: "000660", name: "SK하이닉스", exchange: "KRX", tvSymbol: "KRX:000660", market: "KR" },
    { code: "035420", symbol: "035420", name: "NAVER", exchange: "KRX", tvSymbol: "KRX:035420", market: "KR" }
  ],
  US: [
    { code: "AAPL.O", symbol: "AAPL", name: "Apple", exchange: "NASDAQ", tvSymbol: "NASDAQ:AAPL", market: "US" },
    { code: "MSFT.O", symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ", tvSymbol: "NASDAQ:MSFT", market: "US" },
    { code: "NVDA.O", symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ", tvSymbol: "NASDAQ:NVDA", market: "US" }
  ]
};

const CATEGORY_ORDER = [
  ["valuation", "가치지표"],
  ["profitability", "수익성"],
  ["growth", "성장성"],
  ["stability", "안정성"],
  ["cashflow", "현금흐름"],
  ["shareholder", "주주환원"],
  ["technical", "기술지표"]
];

const marketTabs = document.querySelectorAll(".market-tab");
const searchInput = document.getElementById("symbol-search");
const symbolSelect = document.getElementById("symbol-select");
const quickList = document.getElementById("quick-list");
const summaryPanel = document.getElementById("summary-panel");
const metricsGrid = document.getElementById("metrics-grid");
const chartCaption = document.getElementById("chart-caption");
const chartBox = document.getElementById("tv-chart");

const state = {
  market: "KR",
  query: "",
  selectedCode: "",
  cache: new Map(),
  loading: false,
  error: "",
  searchResults: [],
  searchError: "",
  searchCache: new Map(),
  searchSeq: 0
};

function getCurrentList() {
  const query = state.query.trim();
  if (!query) {
    return DEFAULT_STOCKS[state.market] || [];
  }
  return state.searchResults;
}

function ensureSelectedCode(list) {
  if (!list.length) {
    state.selectedCode = "";
    return;
  }

  if (!list.some((item) => item.code === state.selectedCode)) {
    state.selectedCode = list[0].code;
  }
}

function selectedMeta(list) {
  return list.find((item) => item.code === state.selectedCode) || null;
}

function renderTabs() {
  marketTabs.forEach((tab) => {
    const active = tab.dataset.market === state.market;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function renderSelect(list) {
  if (!list.length) {
    symbolSelect.innerHTML = `<option value="">검색 결과 없음</option>`;
    symbolSelect.value = "";
    return;
  }

  symbolSelect.innerHTML = list
    .map((item) => `<option value="${item.code}">${item.name} (${item.symbol})</option>`)
    .join("");
  symbolSelect.value = state.selectedCode;
}

function renderQuickList(list) {
  quickList.innerHTML = list
    .slice(0, 6)
    .map(
      (item) =>
        `<button class="quick-item ${item.code === state.selectedCode ? "is-picked" : ""}" data-code="${item.code}" type="button">${item.name}</button>`
    )
    .join("");
}

function renderSummary(data, meta) {
  if (state.loading) {
    summaryPanel.innerHTML = `<article class="stat"><p class="stat-label">로딩 중</p><p class="stat-value">실시간 지표를 불러오는 중입니다...</p></article>`;
    return;
  }

  if (state.error) {
    summaryPanel.innerHTML = `<article class="stat"><p class="stat-label">오류</p><p class="stat-value">${state.error}</p></article>`;
    return;
  }

  if (!data) {
    summaryPanel.innerHTML = `<article class="stat"><p class="stat-label">데이터 없음</p><p class="stat-value">지표 데이터를 찾지 못했습니다.</p></article>`;
    return;
  }

  const quote = data.quote;
  const trendClass = String(quote.change).startsWith("-") ? "down" : "up";

  summaryPanel.innerHTML = `
    <article class="stat">
      <p class="stat-label">종목</p>
      <p class="stat-value">${quote.name} <span class="stat-sub">(${quote.symbol} · ${quote.exchange || meta.exchange})</span></p>
      <p class="stat-sub">업데이트 ${quote.updatedAt}</p>
    </article>
    <article class="stat">
      <p class="stat-label">현재가</p>
      <p class="stat-value">${quote.price}</p>
      <p class="stat-sub ${trendClass}">${quote.change} (${quote.point})</p>
    </article>
    <article class="stat">
      <p class="stat-label">시가총액</p>
      <p class="stat-value">${quote.marketCap}</p>
      <p class="stat-sub">Market Cap</p>
    </article>
    <article class="stat">
      <p class="stat-label">거래량</p>
      <p class="stat-value">${quote.volume}</p>
      <p class="stat-sub">Volume</p>
    </article>
  `;
}

function metricCardTemplate(title, section) {
  const rows = Object.entries(section.metrics)
    .map(
      ([key, value]) => `
      <li class="metric-item">
        <span class="metric-key">${key}</span>
        <span class="metric-value">${value}</span>
      </li>
    `
    )
    .join("");

  return `
    <article class="metric-card">
      <div class="metric-head">
        <h3 class="metric-title">${title}</h3>
        <span class="badge">${section.badge || "실시간"}</span>
      </div>
      <ul class="metric-list">${rows}</ul>
    </article>
  `;
}

function renderMetrics(data) {
  if (state.loading) {
    metricsGrid.innerHTML = `<article class="metric-card"><div class="metric-head"><h3 class="metric-title">지표 로딩 중</h3></div><ul class="metric-list"><li class="metric-item"><span class="metric-key">상태</span><span class="metric-value">실시간 데이터 요청 중...</span></li></ul></article>`;
    return;
  }

  if (!data) {
    metricsGrid.innerHTML = "";
    return;
  }

  metricsGrid.innerHTML = CATEGORY_ORDER.map(([key, title]) => metricCardTemplate(title, data.sections[key])).join("");
}

function renderChart(meta) {
  chartCaption.textContent = `${meta.name} (${meta.tvSymbol})`;

  if (!window.TradingView || typeof window.TradingView.widget !== "function") {
    chartBox.innerHTML = "<p class='chart-fallback'>차트 스크립트 로딩 중입니다. 잠시 후 다시 확인하세요.</p>";
    return;
  }

  chartBox.innerHTML = "";
  const innerId = "tv-chart-inner";
  const inner = document.createElement("div");
  inner.id = innerId;
  inner.style.height = "440px";
  chartBox.appendChild(inner);

  new window.TradingView.widget({
    width: "100%",
    height: 440,
    symbol: meta.tvSymbol,
    interval: "D",
    timezone: "Asia/Seoul",
    theme: "light",
    style: "1",
    locale: "kr",
    toolbar_bg: "#f8f5ed",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    studies: ["MACD@tv-basicstudies", "RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
    container_id: innerId
  });
}

function selectedCacheData(meta) {
  if (!meta) {
    return null;
  }

  return state.cache.get(`${meta.market}:${meta.code}`) || null;
}

async function loadStockData(meta) {
  if (!meta) {
    return;
  }

  const cacheKey = `${meta.market}:${meta.code}`;
  if (state.cache.has(cacheKey)) {
    state.error = "";
    return;
  }

  state.loading = true;
  state.error = "";
  renderSummary(null, meta);
  renderMetrics(null);

  try {
    const endpoint = `/api/stock-data?market=${encodeURIComponent(meta.market)}&code=${encodeURIComponent(meta.code)}`;
    const response = await fetch(endpoint);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      const raw = await response.text();
      throw new Error(`API ${response.status} ${raw.slice(0, 80)}`);
    }
    if (!contentType.includes("application/json")) {
      const raw = await response.text();
      throw new Error(`Non-JSON response: ${raw.slice(0, 80)}`);
    }

    const payload = await response.json();
    state.cache.set(cacheKey, payload);
  } catch (error) {
    state.error = `실시간 데이터를 불러오지 못했습니다 (${error.message}).`;
  } finally {
    state.loading = false;
  }
}

async function loadSymbolSearch() {
  const query = state.query.trim();
  if (!query) {
    state.searchResults = [];
    state.searchError = "";
    return;
  }

  const cacheKey = `${state.market}:${query.toLowerCase()}`;
  if (state.searchCache.has(cacheKey)) {
    state.searchResults = state.searchCache.get(cacheKey);
    state.searchError = "";
    return;
  }

  const seq = ++state.searchSeq;
  try {
    const endpoint = `/api/symbol-search?market=${encodeURIComponent(state.market)}&q=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const raw = await response.text();
      throw new Error(`API ${response.status} ${raw.slice(0, 80)}`);
    }
    if (!contentType.includes("application/json")) {
      const raw = await response.text();
      throw new Error(`Non-JSON response: ${raw.slice(0, 80)}`);
    }

    const payload = await response.json();
    if (seq !== state.searchSeq) return;

    state.searchResults = Array.isArray(payload.items) ? payload.items : [];
    state.searchError = "";
    state.searchCache.set(cacheKey, state.searchResults);
  } catch (error) {
    if (seq !== state.searchSeq) return;
    state.searchError = `종목 검색에 실패했습니다 (${error.message}).`;
    state.searchResults = [];
  }
}

async function renderAll() {
  await loadSymbolSearch();

  const list = getCurrentList();
  ensureSelectedCode(list);
  renderTabs();
  renderSelect(list);
  renderQuickList(list);

  const meta = selectedMeta(list);
  if (!meta) {
    const message = state.searchError || "다른 종목명을 입력해 보세요.";
    summaryPanel.innerHTML = `<article class="stat"><p class="stat-label">검색 결과 없음</p><p class="stat-value">${message}</p></article>`;
    metricsGrid.innerHTML = "";
    chartCaption.textContent = "";
    chartBox.innerHTML = "";
    return;
  }

  renderChart(meta);
  await loadStockData(meta);
  const data = selectedCacheData(meta);
  renderSummary(data, meta);
  renderMetrics(data);
}

marketTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    state.market = tab.dataset.market;
    state.query = "";
    state.selectedCode = "";
    state.searchError = "";
    searchInput.value = "";
    await renderAll();
  });
});

searchInput.addEventListener("input", async (event) => {
  state.query = event.target.value;
  state.selectedCode = "";
  await renderAll();
});

symbolSelect.addEventListener("change", async (event) => {
  state.selectedCode = event.target.value;
  await renderAll();
});

quickList.addEventListener("click", async (event) => {
  const target = event.target.closest("button[data-code]");
  if (!target) {
    return;
  }

  state.selectedCode = target.dataset.code;
  await renderAll();
});

window.addEventListener("load", async () => {
  await renderAll();
});
