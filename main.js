const gameboard = document.getElementById("gameboard");
const newGameForm = document.getElementById("new-game-form");
const difficultySelection = document.getElementById("difficulty");
const messageArea = document.getElementById("game-message");
const flag = "🚩";
const mine = "💣";

let game;

/** Create grid representing gameboard in the DOM */
function displayBoard(board) {
  const body = gameboard.createTBody();
  board.map(row => {
    const tr = body.insertRow();
    row.map(cell => {
      const td = tr.insertCell();
      td.appendChild(document.createTextNode(""));
      td.id = cell.id;
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  game = new Game();
  displayBoard(game.board);
  showCells();
  addEventListeners();
});

/** Send coordinates of first click to game instance */
function handleFirstClick(evt) {
  console.log("first click=", evt.target);
  const [tY, tX] = evt.target.id.split("-");
  game.setMines(tY, tX);
  game.checkCell(tY, tX);
  showCells();
  gameboard.addEventListener("click", handleClick);
}

/** Check cell and uncover it */
function handleClick(evt) {
  console.log("next click=", evt.target);
  const [tY, tX] = evt.target.id.split("-");
  game.checkCell(tY, tX);
  showCells();
  console.log("won=", game.isWon())
  if (game.gameOver || game.isWon()) {
    gameboard.removeEventListener("click", handleClick);
    gameboard.removeEventListener("contextmenu", handleRightClick);
    displayMessage();
  }
}

/** Allow right clicking to flag a cell */
function handleRightClick(evt) {
  console.log("right click=", evt.target);
  evt.preventDefault();
  const [tY, tX] = evt.target.id.split("-");
  const cell = game.board[tY][tX];
  if (cell.clicked) return;
  cell.flagged = !cell.flagged;
  evt.target.classList.toggle("flagged");
  evt.target.innerText = cell.flagged ? flag : " ";
}

/** Update cells that are uncovered or flagged */
function showCells() {
  game.board.map(row => {
    row.map(cell => {
      const td = document.getElementById(`${cell.id}`);
      if (cell.mine === 1 && cell.clicked === true) {
        td.innerText = mine;
        td.classList.add("clicked", "mine");
      }
      else if (cell.clicked === true) {
        td.innerText = cell.mineCount !== 0 ? cell.mineCount : " ";
        td.classList.add("clicked", `count-${cell.mineCount}`);
      }
    })
  })
}

/** Create a new game on form submission */
function newGame(evt) {
  evt.preventDefault();
  const level = difficultySelection.value;
  game = new Game(level);
  const board = document.querySelector("tbody")
  gameboard.removeChild(board);
  displayBoard(game.board);
  showCells();
  addEventListeners();
  clearMessage();
}

function displayMessage() {
  if (game.gameOver) {
    messageArea.innerText = "Game over!";
  }
  if (game.isWon()) {
    messageArea.innerText = "Victory!";
  }
}

function clearMessage() {
  messageArea.innerText = "";
}

/** Add click listeners for gameplay */
function addEventListeners() {
  gameboard.removeEventListener("click", handleClick);
  gameboard.removeEventListener("contextmenu", handleRightClick);
  gameboard.addEventListener("click", handleFirstClick, {once: true});
  gameboard.addEventListener("contextmenu", handleRightClick);
}

newGameForm.addEventListener("submit", newGame);