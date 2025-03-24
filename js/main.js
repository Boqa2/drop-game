const video = document.querySelector("#video");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("decline");
const volumeOn = document.getElementById("accept");

const firstEle = document.querySelector("#starts");
const gameStart = document.querySelector("#startGame");
const first = document.querySelector("#firstEle");
const secondEle = document.querySelector("#secondEle");
const therdEle = document.querySelector("#therdEle");
const textFor = document.querySelector("#textFor");
const scoreEl = document.querySelectorAll("#score");
const timerEl = document.querySelector("#time");
const restartGame = document.querySelector("#restartGame");
const place = document.querySelector("#place");
const words = document.querySelectorAll("#words");

let isSoundEnabled = false;
let hasPopupShown = false;
let hasVideoEnded = false;

video.muted = true;
video.play();
video.addEventListener("canplaythrough", () => {
  if (!hasVideoEnded) {
    video.play();
  }
  if (!hasPopupShown) {
    isSoundEnabled = !video.muted && video.volume > 0;

    setTimeout(() => {
      video.pause();
      popup.classList.add("show");
      if (popup.classList.contains("show")) {
        setTimeout(() => {
          popup.classList.remove("show");
          video.muted = false;
          video.play();
          video.volume = 1;
        }, 5000);
      }
    }, 4400);
    hasPopupShown = true;
  }
});

volumeOn.addEventListener("click", () => {
  video.muted = false;
  video.volume = 1;
  video.play();
  popup.classList.remove("show");
});

closePopup.addEventListener("click", closePopupFunc);

function closePopupFunc() {
  popup.classList.remove("show");

  video.play();
  if (isSoundEnabled) {
    video.muted = false;
    video.currentTime = 0;
    video.pause();
  }

  if (hasVideoEnded) {
    video.play();
  }
}

video.addEventListener("ended", () => {
  video.pause();
  firstEle.classList.remove("hidden");
  firstEle.classList.add("show");
});

const array = ["poison", "killer", "meme", "drop", "phone"];
const gridSize = 7;
const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
const directions = [
  { dx: 1, dy: 0 }, // Горизонтально вправо
  { dx: -1, dy: 0 }, // Горизонтально влево
  { dx: 0, dy: 1 }, // Вертикально вниз
  { dx: 0, dy: -1 }, // Вертикально вверх
  { dx: 1, dy: 1 }, // Диагональ вниз вправо
  { dx: -1, dy: -1 }, // Диагональ вверх влево
  { dx: 1, dy: -1 }, // Диагональ вверх вправо
  { dx: -1, dy: 1 }, // Диагональ вниз влево
];
function resize() {
  const height = window.innerHeight;
  if (height < 400) {
    video.src = "assets/15_Help_UPDR251511XH_DM.mp4";
  } else {
    video.src = "assets/15_HelpVertical_UPDR255086AH_DM.mp4";
  }
}
resize();

function placeWords() {
  array.forEach((word) => {
    let placed = false;

    while (!placed) {
      let startX = Math.floor(Math.random() * gridSize);
      let startY = Math.floor(Math.random() * gridSize);
      let direction = directions[Math.floor(Math.random() * directions.length)];

      if (canPlaceWord(word, startX, startY, direction)) {
        for (let i = 0; i < word.length; i++) {
          grid[startY + i * direction.dy][startX + i * direction.dx] = word[i];
        }
        placed = true;
      }
    }
  });
}

function canPlaceWord(word, x, y, direction) {
  for (let i = 0; i < word.length; i++) {
    let newX = x + i * direction.dx;
    let newY = y + i * direction.dy;

    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize)
      return false;
    if (grid[newY][newX] !== "" && grid[newY][newX] !== word[i]) return false;
  }
  return true;
}

function fillEmptyCells() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] === "") {
        grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function renderGrid() {
  const place = document.querySelector("#place");
  place.innerHTML = "";
  grid.flat().forEach((letter, index) => {
    const div = document.createElement("div");
    div.classList.add("items-grid");
    div.textContent = letter;
    div.dataset.index = index;
    place.appendChild(div);
  });
}

let selectedIndexes = [];
let isSelecting = false;
let startIndex = null;
let scoreCount = 0;
let foundWords = [];

place.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("items-grid")) {
    startIndex = Number(e.target.dataset.index);
    selectedIndexes = [startIndex];
    e.target.classList.add("selected");
    isSelecting = true;
  }
});

place.addEventListener("mousemove", (e) => {
  if (isSelecting && e.target.classList.contains("items-grid")) {
    const index = Number(e.target.dataset.index);

    if (!selectedIndexes.includes(index)) {
      if (isValidSelection(startIndex, index)) {
        selectedIndexes.push(index);
        e.target.classList.add("selected");
      }
    }
  }
});

place.addEventListener("mouseup", () => {
  checkWord();
  isSelecting = false;
});

function isValidSelection(start, end) {
  const rowStart = Math.floor(start / gridSize);
  const colStart = start % gridSize;
  const rowEnd = Math.floor(end / gridSize);
  const colEnd = end % gridSize;

  return (
    rowStart === rowEnd ||
    colStart === colEnd ||
    Math.abs(rowStart - rowEnd) === Math.abs(colStart - colEnd)
  );
}

function checkWord() {
  const selectedLetters = selectedIndexes
    .map((index) => place.children[index].textContent)
    .join("")
    .toLowerCase();

  if (
    array.includes(selectedLetters) &&
    !foundWords.includes(selectedLetters)
  ) {
    selectedIndexes.forEach((index) =>
      place.children[index].classList.add("active")
    );
    const wordElement = Array.from(textFor.children).find(
      (li) => li.textContent.toLowerCase() === selectedLetters
    );
    if (wordElement) {
      wordElement.classList.add("active");
    }
    scoreCount++;
    scoreEl.forEach((el) => {
      el.textContent = scoreCount;
    });

    foundWords.push(selectedLetters);

    if (foundWords.length === array.length) {
      setTimeout(() => {
        endGame(true);
      }, 1000);
    }
  }

  selectedIndexes.forEach((index) =>
    place.children[index].classList.remove("selected")
  );
  selectedIndexes = [];
}

array.forEach((elm) => {
  textFor.innerHTML += `<li id="words" class="">${elm}</li>`;
});
let time = 23;
let gameInterval;

function startGame() {
  first.classList.add("fadeIn");
  secondEle.classList.add("fadeIn");

  clearInterval(gameInterval);
  let timer = time;
  timerEl.textContent = timer;
  gameInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      timerEl.textContent = timer;
    } else {
      clearInterval(gameInterval);
      endGame(false);
    }
  }, 1000);

  placeWords();
  fillEmptyCells();
  renderGrid();
}
function restart() {
  startGame();
  first.classList.add("fadeIN");
  first.style.display = "flex";
  secondEle.style.display = "flex";
  therdEle.style.display = "none";
  therdEle.classList.add("hiddens");
  scoreCount = 0;
  scoreEl.forEach((el) => {
    el.textContent = scoreCount;
  });
  const wordElements = document.querySelectorAll("#words");
  wordElements.forEach((wordElement) => {
    wordElement.classList.remove("active");
  });
  foundWords = [];
  selectedIndexes = [];
}
gameStart.addEventListener("click", startGame);
restartGame.addEventListener("click", restart);

function endGame(win) {
  const text = document.querySelector("#forText");
  if (!win) {
    text.textContent = "";
    text.textContent += "We're one step closer to finding the killer";
  } else {
    text.textContent = "";
    text.textContent += "We're finding the killer";
  }
  clearInterval(gameInterval);
  setTimeout(() => {
    first.classList.add("hidden");
    first.style.display = "none";
    secondEle.style.display = "none";
    therdEle.style.display = "block";
    therdEle.classList.remove("hidden");
  }, 0);
}
