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

const METRIC_HELP_TEXTS = {
  PER: "주가를 주당순이익(EPS)으로 나눈 값입니다. 낮을수록 이익 대비 주가가 낮다고 해석할 수 있습니다.",
  PEG: "PER을 이익성장률로 나눈 지표입니다. 성장성을 반영한 밸류에이션 비교에 사용합니다.",
  PBR: "주가를 주당순자산(BPS)으로 나눈 지표입니다. 장부가치 대비 주가 수준을 봅니다.",
  EPS: "주당순이익입니다. 기업이 벌어들인 이익을 주식 수로 나눈 값입니다.",
  BPS: "주당순자산입니다. 기업 순자산을 주식 수로 나눈 값입니다.",
  "추정PER": "애널리스트 추정 이익 기준 PER입니다. 미래 이익 기대가 반영됩니다.",
  "추정EPS": "애널리스트가 예상한 주당순이익입니다.",
  "영업이익률": "매출 대비 영업이익 비율입니다. 본업 수익성의 핵심 지표입니다.",
  "배당수익률": "현재 주가 대비 1년 배당금 비율입니다.",
  "시가총액": "기업의 전체 주식 가치입니다. 주가 × 상장주식수로 계산합니다.",
  "거래대금": "일정 기간 체결된 거래 금액 합계입니다.",
  "EPS 성장률(추정)": "EPS가 얼마나 증가/감소했는지 비율로 본 값입니다.",
  "매출 성장률(YoY)": "전년 동기 대비 매출 증가율입니다.",
  "52주 최고": "최근 52주 동안 가장 높았던 가격입니다.",
  "52주 최저": "최근 52주 동안 가장 낮았던 가격입니다.",
  "52주 위치": "현재가가 52주 고점/저점 구간에서 어느 위치인지 백분율로 표시합니다.",
  "전일 대비": "전일 종가 대비 현재 가격 차이입니다.",
  "등락률": "전일 종가 대비 가격 변동 비율입니다.",
  "시장": "해당 종목이 거래되는 거래소 또는 시장 구분입니다.",
  "영업활동 현금흐름": "영업에서 실제로 들어오고 나간 현금입니다.",
  "투자활동 현금흐름": "설비·지분 투자 등 투자활동에서 발생한 현금흐름입니다.",
  "재무활동 현금흐름": "차입, 상환, 배당, 자사주 등 재무활동 현금흐름입니다.",
  "거래량": "해당 기간 실제로 거래된 주식 수량입니다.",
  "주당배당금": "주식 1주당 지급되는 배당금입니다.",
  "배당일": "배당금이 실제 지급되는 날짜입니다.",
  "배당락일": "배당 권리가 사라져 배당을 받지 못하게 되는 기준일입니다.",
  "현재가": "가장 최근 체결된 가격입니다.",
  "시가": "해당 기간 시작 시점 가격입니다.",
  "고가": "해당 기간 중 가장 높았던 가격입니다.",
  "저가": "해당 기간 중 가장 낮았던 가격입니다.",
  "52W 위치": "52주 고점/저점 범위에서 현재가 위치를 나타낸 값입니다.",
  업데이트: "데이터가 마지막으로 갱신된 시각입니다."
};

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
  chartCache: new Map(),
  loading: false,
  chartLoading: false,
  error: "",
  chartError: "",
  searchResults: [],
  searchError: "",
  searchCache: new Map(),
  searchSeq: 0
};

let lwChart = null;
let candleSeries = null;
let chartResizeBound = false;
let metricHelpPopover = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureMetricHelpPopover() {
  if (metricHelpPopover) return metricHelpPopover;

  metricHelpPopover = document.createElement("div");
  metricHelpPopover.className = "metric-help-popover is-hidden";
  metricHelpPopover.setAttribute("role", "dialog");
  metricHelpPopover.setAttribute("aria-live", "polite");
  document.body.appendChild(metricHelpPopover);
  return metricHelpPopover;
}

function hideMetricHelp() {
  if (!metricHelpPopover) return;
  metricHelpPopover.classList.add("is-hidden");
}

function showMetricHelp(button, label, description) {
  const pop = ensureMetricHelpPopover();
  pop.innerHTML = `<p class="metric-help-title">${escapeHtml(label)}</p><p class="metric-help-desc">${escapeHtml(description)}</p>`;
  pop.classList.remove("is-hidden");

  const rect = button.getBoundingClientRect();
  const maxWidth = Math.min(340, window.innerWidth - 24);
  pop.style.maxWidth = `${maxWidth}px`;

  const popRect = pop.getBoundingClientRect();
  const left = Math.max(12, Math.min(window.innerWidth - popRect.width - 12, rect.left + rect.width / 2 - popRect.width / 2));
  const top = Math.max(12, rect.bottom + 10);

  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

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
        <span class="metric-key-wrap">
          <span class="metric-key">${key}</span>
          <button class="metric-help-btn" type="button" data-metric-label="${escapeHtml(key)}" aria-label="${escapeHtml(key)} 설명 보기">?</button>
        </span>
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

function ensureChartInstance() {
  if (!window.LightweightCharts || typeof window.LightweightCharts.createChart !== "function") {
    return false;
  }

  if (!lwChart) {
    chartBox.innerHTML = "";

    lwChart = window.LightweightCharts.createChart(chartBox, {
      width: chartBox.clientWidth || 800,
      height: 440,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#2a2a2a"
      },
      rightPriceScale: {
        borderColor: "#e5decf"
      },
      timeScale: {
        borderColor: "#e5decf",
        timeVisible: false
      },
      grid: {
        vertLines: { color: "#f2ecdf" },
        horzLines: { color: "#f2ecdf" }
      }
    });

    candleSeries = lwChart.addCandlestickSeries({
      upColor: "#1f9d55",
      downColor: "#d64545",
      wickUpColor: "#1f9d55",
      wickDownColor: "#d64545",
      borderVisible: false
    });

    if (!chartResizeBound) {
      window.addEventListener("resize", () => {
        if (lwChart) {
          lwChart.applyOptions({ width: chartBox.clientWidth || 800 });
        }
      });
      chartResizeBound = true;
    }
  }

  return true;
}

function renderChart(meta, chartData) {
  chartCaption.textContent = `${meta.name} (${meta.symbol})`;

  if (state.chartLoading) {
    chartBox.innerHTML = "<p class='chart-fallback'>차트 데이터를 불러오는 중입니다...</p>";
    return;
  }

  if (state.chartError) {
    chartBox.innerHTML = `<p class='chart-fallback'>${state.chartError}</p>`;
    return;
  }

  if (!chartData || !Array.isArray(chartData.points) || chartData.points.length === 0) {
    chartBox.innerHTML = "<p class='chart-fallback'>표시할 차트 데이터가 없습니다.</p>";
    return;
  }

  if (!ensureChartInstance()) {
    chartBox.innerHTML = "<p class='chart-fallback'>차트 라이브러리를 불러오지 못했습니다.</p>";
    return;
  }

  candleSeries.setData(chartData.points);
  lwChart.timeScale().fitContent();
}

function selectedCacheData(meta) {
  if (!meta) {
    return null;
  }

  return state.cache.get(`${meta.market}:${meta.code}`) || null;
}

function selectedChartCache(meta) {
  if (!meta) {
    return null;
  }

  return state.chartCache.get(`${meta.market}:${meta.code}`) || null;
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

async function loadChartData(meta) {
  if (!meta) {
    return;
  }

  const cacheKey = `${meta.market}:${meta.code}`;
  if (state.chartCache.has(cacheKey)) {
    state.chartError = "";
    return;
  }

  state.chartLoading = true;
  state.chartError = "";
  renderChart(meta, null);

  try {
    const endpoint = `/api/chart-data?market=${encodeURIComponent(meta.market)}&code=${encodeURIComponent(meta.code)}`;
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
    state.chartCache.set(cacheKey, payload);
  } catch (error) {
    state.chartError = `차트 데이터를 불러오지 못했습니다 (${error.message}).`;
  } finally {
    state.chartLoading = false;
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

  await Promise.all([loadStockData(meta), loadChartData(meta)]);

  const data = selectedCacheData(meta);
  const chartData = selectedChartCache(meta);

  renderSummary(data, meta);
  renderMetrics(data);
  renderChart(meta, chartData);
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

metricsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button.metric-help-btn");
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  const label = button.dataset.metricLabel || "";
  const description = METRIC_HELP_TEXTS[label] || "이 지표는 기업의 가치, 수익성, 성장성, 안정성을 해석하는 데 사용됩니다.";
  showMetricHelp(button, label, description);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".metric-help-btn")) return;
  if (event.target.closest(".metric-help-popover")) return;
  hideMetricHelp();
});

window.addEventListener("resize", hideMetricHelp);
window.addEventListener("scroll", hideMetricHelp, true);

window.addEventListener("load", async () => {
  await renderAll();
});
