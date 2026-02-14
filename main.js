const generateBtn = document.getElementById("generate-btn");
const numbersEl = document.getElementById("numbers");
const historyEl = document.getElementById("history");

let generateCount = 0;

function generateLottoNumbers() {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 6).sort((a, b) => a - b);
}

function renderNumbers(numbers) {
  numbersEl.innerHTML = "";
  numbers.forEach((number) => {
    const li = document.createElement("li");
    li.className = "number-ball";
    li.textContent = String(number);
    numbersEl.appendChild(li);
  });
}

generateBtn.addEventListener("click", () => {
  const numbers = generateLottoNumbers();
  renderNumbers(numbers);
  generateCount += 1;
  historyEl.textContent = `${generateCount}회 생성: ${numbers.join(", ")}`;
});
