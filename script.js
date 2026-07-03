const quests = {
  "палочка": "pages/palochka.html",
  "1223332": "pages/digits.html",
};

const form = document.querySelector("#code-form");
const inputs = Array.from(document.querySelectorAll("[data-code-input]"));
const statusLine = document.querySelector("#status-line");
const questCodes = Object.keys(quests);

function normalizeCode(value) {
  return Array.from(value.trim().toLocaleLowerCase("ru-RU")).filter((char) => char !== " ");
}

function clearResult() {
  statusLine.textContent = "";
  inputs.forEach((input) => {
    input.classList.remove("is-correct", "is-wrong");
  });
}

function fillFrom(startIndex, chars) {
  chars.slice(0, inputs.length - startIndex).forEach((char, offset) => {
    inputs[startIndex + offset].value = char;
  });

  const nextIndex = Math.min(startIndex + chars.length, inputs.length - 1);
  inputs[nextIndex].focus();
}

function readCode() {
  return inputs.map((input) => normalizeCode(input.value)[0] || "").join("");
}

function findClosestCode(code) {
  const typed = Array.from(code);

  return questCodes.reduce((best, target) => {
    const targetChars = Array.from(target);
    const score = targetChars.reduce((total, char, index) => {
      return total + (typed[index] === char ? 1 : 0);
    }, 0);

    return score > best.score ? { code: target, score } : best;
  }, { code: questCodes[0], score: -1 }).code;
}

function markAgainst(targetCode, typedCode) {
  const targetChars = Array.from(targetCode);
  const typedChars = Array.from(typedCode);

  inputs.forEach((input, index) => {
    input.classList.toggle("is-correct", typedChars[index] === targetChars[index]);
    input.classList.toggle("is-wrong", typedChars[index] !== targetChars[index]);
  });
}

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    clearResult();

    const chars = normalizeCode(input.value);
    if (chars.length === 0) {
      input.value = "";
      return;
    }

    if (chars.length > 1) {
      fillFrom(index, chars);
      return;
    }

    input.value = chars[0];
    if (index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    clearResult();
    fillFrom(index, normalizeCode(event.clipboardData.getData("text")));
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && index > 0) {
      inputs[index - 1].focus();
    }

    if (event.key === "ArrowRight" && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    if (event.key === "Backspace" && input.value === "" && index > 0) {
      event.preventDefault();
      inputs[index - 1].value = "";
      inputs[index - 1].focus();
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const code = readCode();
  const page = quests[code];

  if (page) {
    markAgainst(code, code);
    statusLine.textContent = "Код принят";
    window.setTimeout(() => {
      window.location.href = page;
    }, 750);
    return;
  }

  markAgainst(findClosestCode(code), code);
  statusLine.textContent = "Код не совпал";
});

inputs[0].focus();
