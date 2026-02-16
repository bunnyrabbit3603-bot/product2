const STOCKS = {
  KR: [
    {
      symbol: "005930",
      name: "삼성전자",
      exchange: "KRX",
      tvSymbol: "KRX:005930",
      price: "76,200원",
      change: "+1.18%",
      marketCap: "454.8조원",
      volume: "12.4M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "업종 평균 대비 무난",
        metrics: {
          PER: "15.4",
          PEG: "1.20",
          PBR: "1.46",
          PSR: "2.14",
          "EV/EBITDA": "7.9"
        }
      },
      profitability: {
        badge: "수익성 회복 구간",
        metrics: {
          ROE: "9.8%",
          ROA: "6.7%",
          "영업이익률": "15.1%",
          "순이익률": "11.4%"
        }
      },
      growth: {
        badge: "완만한 개선",
        metrics: {
          "매출 성장률(YoY)": "7.2%",
          "EPS 성장률(YoY)": "12.8%",
          "FCF 성장률(YoY)": "9.1%"
        }
      },
      stability: {
        badge: "재무안정 우수",
        metrics: {
          "부채비율": "27.5%",
          "유동비율": "224%",
          "이자보상배율": "32.1x",
          베타: "0.92"
        }
      },
      cashflow: {
        badge: "현금창출 견조",
        metrics: {
          OCF: "58.3조원",
          FCF: "31.4조원",
          "OCF/순이익": "1.23x"
        }
      },
      shareholder: {
        badge: "주주환원 유지",
        metrics: {
          "배당수익률": "2.6%",
          "배당성향": "35%",
          "자사주 매입수익률": "0.7%"
        }
      },
      technical: {
        badge: "중립-강세",
        metrics: {
          "RSI(14)": "57.8",
          MACD: "+0.8",
          "MA20 / MA60": "상향",
          "MA120": "상회",
          "52주 위치": "72%",
          MDD: "-24.5%"
        }
      }
    },
    {
      symbol: "000660",
      name: "SK하이닉스",
      exchange: "KRX",
      tvSymbol: "KRX:000660",
      price: "181,500원",
      change: "+2.04%",
      marketCap: "132.1조원",
      volume: "3.7M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "성장 프리미엄",
        metrics: {
          PER: "18.7",
          PEG: "0.98",
          PBR: "2.10",
          PSR: "2.62",
          "EV/EBITDA": "9.1"
        }
      },
      profitability: {
        badge: "이익레버리지 강함",
        metrics: {
          ROE: "13.9%",
          ROA: "8.1%",
          "영업이익률": "20.8%",
          "순이익률": "16.7%"
        }
      },
      growth: {
        badge: "고성장",
        metrics: {
          "매출 성장률(YoY)": "18.2%",
          "EPS 성장률(YoY)": "34.5%",
          "FCF 성장률(YoY)": "27.6%"
        }
      },
      stability: {
        badge: "무난",
        metrics: {
          "부채비율": "41.9%",
          "유동비율": "168%",
          "이자보상배율": "18.4x",
          베타: "1.21"
        }
      },
      cashflow: {
        badge: "개선 추세",
        metrics: {
          OCF: "18.6조원",
          FCF: "8.9조원",
          "OCF/순이익": "1.11x"
        }
      },
      shareholder: {
        badge: "환원 확대 여지",
        metrics: {
          "배당수익률": "1.3%",
          "배당성향": "21%",
          "자사주 매입수익률": "0.2%"
        }
      },
      technical: {
        badge: "강세",
        metrics: {
          "RSI(14)": "63.1",
          MACD: "+2.1",
          "MA20 / MA60": "상향",
          "MA120": "상회",
          "52주 위치": "84%",
          MDD: "-31.2%"
        }
      }
    },
    {
      symbol: "035420",
      name: "NAVER",
      exchange: "KRX",
      tvSymbol: "KRX:035420",
      price: "228,000원",
      change: "-0.35%",
      marketCap: "36.7조원",
      volume: "0.9M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "중립",
        metrics: {
          PER: "22.1",
          PEG: "1.45",
          PBR: "1.33",
          PSR: "2.03",
          "EV/EBITDA": "11.8"
        }
      },
      profitability: {
        badge: "안정",
        metrics: {
          ROE: "7.4%",
          ROA: "5.1%",
          "영업이익률": "14.3%",
          "순이익률": "10.8%"
        }
      },
      growth: {
        badge: "완만",
        metrics: {
          "매출 성장률(YoY)": "6.5%",
          "EPS 성장률(YoY)": "8.3%",
          "FCF 성장률(YoY)": "5.2%"
        }
      },
      stability: {
        badge: "재무안정",
        metrics: {
          "부채비율": "39.2%",
          "유동비율": "141%",
          "이자보상배율": "15.9x",
          베타: "0.86"
        }
      },
      cashflow: {
        badge: "안정",
        metrics: {
          OCF: "2.9조원",
          FCF: "1.7조원",
          "OCF/순이익": "1.07x"
        }
      },
      shareholder: {
        badge: "보통",
        metrics: {
          "배당수익률": "1.0%",
          "배당성향": "20%",
          "자사주 매입수익률": "0.4%"
        }
      },
      technical: {
        badge: "중립",
        metrics: {
          "RSI(14)": "49.2",
          MACD: "-0.2",
          "MA20 / MA60": "횡보",
          "MA120": "근접",
          "52주 위치": "56%",
          MDD: "-27.6%"
        }
      }
    }
  ],
  US: [
    {
      symbol: "AAPL",
      name: "Apple",
      exchange: "NASDAQ",
      tvSymbol: "NASDAQ:AAPL",
      price: "$228.14",
      change: "+0.84%",
      marketCap: "$3.5T",
      volume: "58.1M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "프리미엄 밸류",
        metrics: {
          PER: "31.5",
          PEG: "2.30",
          PBR: "45.1",
          PSR: "8.6",
          "EV/EBITDA": "23.8"
        }
      },
      profitability: {
        badge: "수익성 매우 높음",
        metrics: {
          ROE: "145.3%",
          ROA: "28.7%",
          "Operating Margin": "31.2%",
          "Net Margin": "24.7%"
        }
      },
      growth: {
        badge: "중간 성장",
        metrics: {
          "Revenue Growth(YoY)": "5.8%",
          "EPS Growth(YoY)": "9.4%",
          "FCF Growth(YoY)": "7.1%"
        }
      },
      stability: {
        badge: "현금흐름 기반 안정",
        metrics: {
          "Debt/Equity": "1.73",
          "Current Ratio": "1.06",
          "Interest Coverage": "44.9x",
          Beta: "1.14"
        }
      },
      cashflow: {
        badge: "강력",
        metrics: {
          OCF: "$128.2B",
          FCF: "$109.6B",
          "OCF/Net Income": "1.12x"
        }
      },
      shareholder: {
        badge: "환원 최상",
        metrics: {
          "Dividend Yield": "0.55%",
          "Payout Ratio": "15.1%",
          "Buyback Yield": "3.2%"
        }
      },
      technical: {
        badge: "상방 우위",
        metrics: {
          "RSI(14)": "59.4",
          MACD: "+1.6",
          "MA20 / MA60": "Bullish",
          "MA120": "Above",
          "52W Position": "81%",
          MDD: "-22.4%"
        }
      }
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      exchange: "NASDAQ",
      tvSymbol: "NASDAQ:MSFT",
      price: "$481.72",
      change: "+1.03%",
      marketCap: "$3.6T",
      volume: "29.4M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "AI 프리미엄 반영",
        metrics: {
          PER: "35.2",
          PEG: "2.01",
          PBR: "12.8",
          PSR: "13.4",
          "EV/EBITDA": "24.9"
        }
      },
      profitability: {
        badge: "최상위",
        metrics: {
          ROE: "37.9%",
          ROA: "18.2%",
          "Operating Margin": "45.2%",
          "Net Margin": "36.8%"
        }
      },
      growth: {
        badge: "고성장",
        metrics: {
          "Revenue Growth(YoY)": "15.4%",
          "EPS Growth(YoY)": "21.7%",
          "FCF Growth(YoY)": "18.1%"
        }
      },
      stability: {
        badge: "재무 견고",
        metrics: {
          "Debt/Equity": "0.42",
          "Current Ratio": "1.73",
          "Interest Coverage": "41.3x",
          Beta: "0.93"
        }
      },
      cashflow: {
        badge: "강력",
        metrics: {
          OCF: "$133.9B",
          FCF: "$98.4B",
          "OCF/Net Income": "1.08x"
        }
      },
      shareholder: {
        badge: "안정 환원",
        metrics: {
          "Dividend Yield": "0.67%",
          "Payout Ratio": "23.2%",
          "Buyback Yield": "1.1%"
        }
      },
      technical: {
        badge: "강세",
        metrics: {
          "RSI(14)": "61.7",
          MACD: "+2.8",
          "MA20 / MA60": "Bullish",
          "MA120": "Above",
          "52W Position": "86%",
          MDD: "-18.7%"
        }
      }
    },
    {
      symbol: "NVDA",
      name: "NVIDIA",
      exchange: "NASDAQ",
      tvSymbol: "NASDAQ:NVDA",
      price: "$148.05",
      change: "-0.62%",
      marketCap: "$3.7T",
      volume: "319.3M",
      updateAt: "2026-02-14",
      valuation: {
        badge: "고평가-고성장",
        metrics: {
          PER: "46.3",
          PEG: "1.12",
          PBR: "47.5",
          PSR: "24.6",
          "EV/EBITDA": "39.8"
        }
      },
      profitability: {
        badge: "압도적",
        metrics: {
          ROE: "91.6%",
          ROA: "52.4%",
          "Operating Margin": "62.8%",
          "Net Margin": "54.2%"
        }
      },
      growth: {
        badge: "초고성장",
        metrics: {
          "Revenue Growth(YoY)": "87.2%",
          "EPS Growth(YoY)": "105.7%",
          "FCF Growth(YoY)": "96.8%"
        }
      },
      stability: {
        badge: "안정",
        metrics: {
          "Debt/Equity": "0.27",
          "Current Ratio": "3.61",
          "Interest Coverage": "70.5x",
          Beta: "1.74"
        }
      },
      cashflow: {
        badge: "폭발적",
        metrics: {
          OCF: "$74.8B",
          FCF: "$66.2B",
          "OCF/Net Income": "1.09x"
        }
      },
      shareholder: {
        badge: "배당보단 성장",
        metrics: {
          "Dividend Yield": "0.03%",
          "Payout Ratio": "1.1%",
          "Buyback Yield": "0.8%"
        }
      },
      technical: {
        badge: "고변동 강세",
        metrics: {
          "RSI(14)": "64.3",
          MACD: "+3.7",
          "MA20 / MA60": "Bullish",
          "MA120": "Above",
          "52W Position": "89%",
          MDD: "-34.2%"
        }
      }
    }
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
  symbol: ""
};

function getMarketList() {
  return STOCKS[state.market] ?? [];
}

function filteredList() {
  const query = state.query.trim().toLowerCase();
  const list = getMarketList();

  if (!query) {
    return list;
  }

  return list.filter((item) => {
    return (
      item.symbol.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.tvSymbol.toLowerCase().includes(query)
    );
  });
}

function ensureSelectedSymbol(list) {
  if (!list.length) {
    state.symbol = "";
    return;
  }

  const exists = list.some((item) => item.symbol === state.symbol);
  if (!exists) {
    state.symbol = list[0].symbol;
  }
}

function selectedStock() {
  const list = filteredList();
  return list.find((item) => item.symbol === state.symbol) ?? null;
}

function renderTabs() {
  marketTabs.forEach((tab) => {
    const isActive = tab.dataset.market === state.market;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function renderSelect(list) {
  const options = list
    .map((item) => `<option value="${item.symbol}">${item.name} (${item.symbol})</option>`)
    .join("");

  symbolSelect.innerHTML = options;
  symbolSelect.value = state.symbol;
}

function renderQuickList(list) {
  quickList.innerHTML = list
    .slice(0, 6)
    .map((item) => {
      const activeClass = item.symbol === state.symbol ? "is-picked" : "";
      return `<button class="quick-item ${activeClass}" data-symbol="${item.symbol}" type="button">${item.name}</button>`;
    })
    .join("");
}

function renderSummary(stock) {
  const trendClass = stock.change.startsWith("-") ? "down" : "up";

  summaryPanel.innerHTML = `
    <article class="stat">
      <p class="stat-label">종목</p>
      <p class="stat-value">${stock.name} <span class="stat-sub">(${stock.symbol} · ${stock.exchange})</span></p>
      <p class="stat-sub">기준일 ${stock.updateAt}</p>
    </article>
    <article class="stat">
      <p class="stat-label">현재가</p>
      <p class="stat-value">${stock.price}</p>
      <p class="stat-sub ${trendClass}">${stock.change}</p>
    </article>
    <article class="stat">
      <p class="stat-label">시가총액</p>
      <p class="stat-value">${stock.marketCap}</p>
      <p class="stat-sub">Market Cap</p>
    </article>
    <article class="stat">
      <p class="stat-label">거래량</p>
      <p class="stat-value">${stock.volume}</p>
      <p class="stat-sub">Volume</p>
    </article>
  `;
}

function metricCardTemplate(title, category) {
  const rows = Object.entries(category.metrics)
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
        <span class="badge">${category.badge}</span>
      </div>
      <ul class="metric-list">${rows}</ul>
    </article>
  `;
}

function renderMetrics(stock) {
  metricsGrid.innerHTML = CATEGORY_ORDER.map(([key, title]) => metricCardTemplate(title, stock[key])).join("");
}

function renderChart(stock) {
  chartCaption.textContent = `${stock.name} (${stock.tvSymbol})`;

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
    symbol: stock.tvSymbol,
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

function renderEmptyState() {
  summaryPanel.innerHTML = "<article class='stat'><p class='stat-label'>검색 결과가 없습니다.</p><p class='stat-value'>다른 키워드로 검색하세요.</p></article>";
  metricsGrid.innerHTML = "";
  chartCaption.textContent = "";
  chartBox.innerHTML = "";
}

function renderAll() {
  const list = filteredList();
  ensureSelectedSymbol(list);
  renderTabs();
  renderSelect(list);
  renderQuickList(list);

  const stock = selectedStock();
  if (!stock) {
    renderEmptyState();
    return;
  }

  renderSummary(stock);
  renderMetrics(stock);
  renderChart(stock);
}

marketTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.market = tab.dataset.market;
    state.query = "";
    searchInput.value = "";
    state.symbol = "";
    renderAll();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.symbol = "";
  renderAll();
});

symbolSelect.addEventListener("change", (event) => {
  state.symbol = event.target.value;
  renderAll();
});

quickList.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-symbol]");
  if (!target) {
    return;
  }

  state.symbol = target.dataset.symbol;
  renderAll();
});

window.addEventListener("load", () => {
  renderAll();
});
