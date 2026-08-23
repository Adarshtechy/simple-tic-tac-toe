/* Game State */
const board = Array(9).fill("");
let currentPlayer = "X";
let gameMode = "pvp";
let aiDifficulty = "medium";
let gameOver = false;
let aiThinking = false;
let scoreX = 0;
let scoreO = 0;
let moveCount = 0;

/* DOM Elements */
const boxes = document.querySelectorAll(".box");
const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");
const turnIndicator = document.getElementById("turn-indicator");
const playerIndicator = document.getElementById("player-indicator");
const playerOName = document.getElementById("player-o-name");
const difficultyContainer = document.getElementById("difficulty-container");
const difficultySelect = document.getElementById("ai-difficulty");
const thinkingElement = document.getElementById("thinking");
const historyList = document.getElementById("history-list");
const restartButton = document.getElementById("restart-btn");
const pvpButton = document.getElementById("pvp-btn");
const aiButton = document.getElementById("ai-btn");
const modalOverlay = document.getElementById("modal-overlay");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const resultIcon = document.getElementById("result-icon");
const playAgainButton = document.getElementById("play-again-btn");

/* Winning Combinations */
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

/* Board Click Events */
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    const index = Number(box.dataset.index);

    handleMove(index);
  });
});

/* Handle Player One */
function handleMove(index) {
  // Game already finished
  if (gameOver) {
    return;
  }

  // AI is currently thinking
  if (aiThinking) {
    return;
  }

  // Square already occupied
  if (board[index] !== "") {
    return;
  }

  // Player cannot make O move in AI mode
  if (gameMode === "ai" && currentPlayer === "O") {
    return;
  }

  makeMove(index, currentPlayer);

  const result = checkGameResult();

  if (result) {
    finishGame(result);
    return;
  }

  switchPlayer();

  // Computer turn
  if (gameMode === "ai" && currentPlayer === "O") {
    computerMove();
  }
}

/* Make Move */
function makeMove(index, player) {
  board[index] = player;

  moveCount++;

  const box = boxes[index];
  const span = box.querySelector("span");

  span.textContent = player;
  span.dataset.player = player;
  span.classList.remove("x-move", "o-move");

  if (player === "X") {
    span.classList.add("x-move");
  } else {
    span.classList.add("o-move");
  }

  box.disabled = true;
}

/* Switch Player */
function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnIndicator();
}

/* Update Turn UI */
function updateTurnIndicator() {
  if (gameMode === "ai") {
    if (currentPlayer === "X") {
      turnIndicator.textContent = "Your Turn";
    } else {
      turnIndicator.textContent = "Computer's Turn";
    }
  } else {
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  }

  playerIndicator.classList.remove("player-x-indicator", "player-o-indicator");

  if (currentPlayer === "X") {
    playerIndicator.classList.add("player-x-indicator");
  } else {
    playerIndicator.classList.add("player-o-indicator");
  }
}

/* Check Result */
function checkGameResult() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return {
        type: "win",
        player: board[a],
        combination,
      };
    }
  }

  // Draw
  if (moveCount === 9) {
    return {
      type: "draw",
    };
  }

  return null;
}

/* Finish Game */
function finishGame(result) {
  gameOver = true;
  aiThinking = false;

  thinkingElement.style.display = "none";

  if (result.type === "win") {
    highlightWinningCells(result.combination);

    if (result.player === "X") {
      scoreX++;

      scoreXElement.textContent = scoreX;
    } else {
      scoreO++;

      scoreOElement.textContent = scoreO;
    }

    const winner =
      gameMode === "ai" && result.player === "O"
        ? "Computer"
        : `Player ${result.player}`;

    addHistory(`${winner} won`, "Just now");

    showResult(
      `${winner} Wins!`,
      "Great job! You can play another round.",
      "win",
    );
  } else {
    addHistory("Game ended in a draw", "Just now");

    showResult("It's a Draw!", "Nobody won this round.", "draw");
  }
}

/* Highlight Winning Cells */
function highlightWinningCells(combination) {
  combination.forEach((index) => {
    boxes[index].classList.add("activeBox");
  });
}

/* Computer Move */
function computerMove() {
  aiThinking = true;

  thinkingElement.style.display = "block";

  boxes.forEach((box) => {
    box.disabled = true;
  });

  // Small delay makes the AI feel natural
  setTimeout(() => {
    if (gameOver) {
      return;
    }

    const move = getComputerMove();

    if (move === -1) {
      aiThinking = false;

      boxes.forEach((box, index) => {
        box.disabled = board[index] !== "";
      });

      return;
    }

    makeMove(move, "O");

    const result = checkGameResult();
    aiThinking = false;
    thinkingElement.style.display = "none";

    if (result) {
      finishGame(result);

      return;
    }

    switchPlayer();

    boxes.forEach((box, index) => {
      box.disabled = board[index] !== "";
    });
  }, 500);
}

/* Get Computer Move */
function getComputerMove() {
  const available = getAvailableMoves();

  if (available.length === 0) {
    return -1;
  }

  /* Easy */
  if (aiDifficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }

  /* Medium */
  if (aiDifficulty === "medium") {
    // 60% intelligent
    // 40% random

    if (Math.random() < 0.6) {
      return getBestMove();
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  /* Hard */
  return getBestMove();
}

/* Available Moves */
function getAvailableMoves() {
  const moves = [];

  board.forEach((value, index) => {
    if (value === "") {
      moves.push(index);
    }
  });

  return moves;
}

/* Best Move */
function getBestMove() {
  let bestScore = -Infinity;

  let bestMove = -1;

  for (const index of getAvailableMoves()) {
    board[index] = "O";

    const score = minimax(board, 0, false);

    board[index] = "";

    if (score > bestScore) {
      bestScore = score;

      bestMove = index;
    }
  }

  return bestMove;
}

/* Minimax AI */
function minimax(currentBoard, depth, maximizing) {
  const result = evaluateBoard(currentBoard);

  if (result !== null) {
    return result - depth;
  }

  if (maximizing) {
    let bestScore = -Infinity;

    for (const index of getEmptyIndexes(currentBoard)) {
      currentBoard[index] = "O";

      const score = minimax(currentBoard, depth + 1, false);

      currentBoard[index] = "";

      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (const index of getEmptyIndexes(currentBoard)) {
      currentBoard[index] = "X";

      const score = minimax(currentBoard, depth + 1, true);

      currentBoard[index] = "";

      bestScore = Math.min(bestScore, score);
    }

    return bestScore;
  }
}

/* Evaluate Board */
function evaluateBoard(currentBoard) {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (
      currentBoard[a] !== "" &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      if (currentBoard[a] === "O") {
        return 10;
      }

      return -10;
    }
  }

  if (currentBoard.every((cell) => cell !== "")) {
    return 0;
  }

  return null;
}

/* Get Empty Indexes */
function getEmptyIndexes(currentBoard) {
  const indexes = [];

  currentBoard.forEach((value, index) => {
    if (value === "") {
      indexes.push(index);
    }
  });

  return indexes;
}

/* Set Game Mode */
function setGameMode(mode) {
  if (gameMode === mode) {
    return;
  }

  gameMode = mode;

  if (gameMode === "pvp") {
    pvpButton.classList.add("active");

    aiButton.classList.remove("active");

    playerOName.textContent = "Player O";

    difficultyContainer.style.display = "none";
  } else {
    aiButton.classList.add("active");

    pvpButton.classList.remove("active");

    playerOName.textContent = "Computer";

    difficultyContainer.style.display = "block";
  }

  restartGame();
}

/* Difficult Change */
difficultySelect.addEventListener("change", () => {
  aiDifficulty = difficultySelect.value;

  restartGame();
});

/* Restart Game */
function restartGame() {
  board.fill("");

  currentPlayer = "X";

  gameOver = false;

  aiThinking = false;

  moveCount = 0;

  thinkingElement.style.display = "none";

  boxes.forEach((box) => {
    box.disabled = false;

    box.classList.remove("activeBox");

    const span = box.querySelector("span");

    span.textContent = "";

    span.dataset.player = "none";

    span.classList.remove("x-move", "o-move");
  });

  updateTurnIndicator();

  hideResult();
}

/* Restart Button */
restartButton.addEventListener("click", restartGame);

/* Game Mode Buttons */
pvpButton.addEventListener("click", () => {
  setGameMode("pvp");
});

aiButton.addEventListener("click", () => {
  setGameMode("ai");
});

/* Add History */
function addHistory(message, time) {
  const item = document.createElement("li");

  const messageSpan = document.createElement("span");

  messageSpan.textContent = message;

  const timeSpan = document.createElement("span");

  timeSpan.textContent = time;

  item.appendChild(messageSpan);

  item.appendChild(timeSpan);

  historyList.prepend(item);

  // Keep history small
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastElementChild);
  }
}

/* Show Result */
function showResult(title, message, type) {
  resultTitle.textContent = title;

  resultMessage.textContent = message;

  if (type === "draw") {
    resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';

    resultIcon.style.color = "#6b7280";

    resultIcon.style.background = "#f3f4f6";
  } else {
    resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';

    resultIcon.style.color = "#2563eb";

    resultIcon.style.background = "#eff6ff";
  }

  modalOverlay.classList.add("show");
}

/* Hide Result */
function hideResult() {
  modalOverlay.classList.remove("show");
}

/* Play Again */
playAgainButton.addEventListener("click", restartGame);

/* Close Modal When we Click Outside */
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    restartGame();
  }
});

/* Initial Setup */
difficultyContainer.style.display = "none";

updateTurnIndicator();
