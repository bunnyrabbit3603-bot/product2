const form = document.getElementById("budget-form");
const incomeInput = document.getElementById("income");
const fixedInput = document.getElementById("fixed");
const subsInput = document.getElementById("subs");
const result = document.getElementById("result");
const resultList = document.getElementById("result-list");
const resultTip = document.getElementById("result-tip");

const currency = new Intl.NumberFormat("ko-KR");

function won(value) {
  return `${currency.format(Math.max(0, Math.round(value)))}원`;
}

function createItem(label, value) {
  const li = document.createElement("li");
  li.textContent = `${label}: ${value}`;
  return li;
}

function getTip(fixedRatio, subsRatio) {
  if (fixedRatio > 0.55) {
    return "고정지출이 높습니다. 통신비/보험/월세 재협상 항목부터 우선 점검하세요.";
  }

  if (subsRatio > 0.05) {
    return "구독비 비중이 큽니다. 사용 빈도 낮은 구독 1~2개만 정리해도 저축률이 빨리 올라갑니다.";
  }

  return "현재 구조가 안정적입니다. 월급일 자동이체로 저축을 먼저 빼두면 유지가 더 쉬워집니다.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const income = Number(incomeInput.value);
  const fixed = Number(fixedInput.value);
  const subs = Number(subsInput.value);

  if (income <= 0 || fixed < 0 || subs < 0 || fixed > income) {
    result.hidden = false;
    resultList.innerHTML = "";
    resultTip.textContent = "입력값을 다시 확인하세요. (실수령액은 0보다 크고, 고정지출은 실수령액보다 작아야 함)";
    return;
  }

  const need = income * 0.5;
  const want = income * 0.3;
  const save = income * 0.2;
  const fixedRatio = fixed / income;
  const subsRatio = subs / income;
  const possibleSave = Math.max(0, income - fixed - subs - want * 0.6);

  resultList.innerHTML = "";
  resultList.appendChild(createItem("권장 필수지출(50%)", won(need)));
  resultList.appendChild(createItem("권장 여유지출(30%)", won(want)));
  resultList.appendChild(createItem("권장 저축(20%)", won(save)));
  resultList.appendChild(createItem("현재 고정지출 비중", `${(fixedRatio * 100).toFixed(1)}%`));
  resultList.appendChild(createItem("현재 구독비 비중", `${(subsRatio * 100).toFixed(1)}%`));
  resultList.appendChild(createItem("이번 달 추가 저축 가능액(추정)", won(possibleSave)));

  resultTip.textContent = getTip(fixedRatio, subsRatio);
  result.hidden = false;
});
