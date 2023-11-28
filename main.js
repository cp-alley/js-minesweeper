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


/** Show initial board on page load */
function showInitialBoard() {
  game = new Game();
  displayBoard(game.board);
  showCells();
  addEventListeners();
}

/** Check cell and uncover it. Sets mines for first click of the game. Remove
 *  event listeners and update message when game is over or won.
*/
function handleClick(evt) {
  console.log("next click=", evt.target);
  const [tY, tX] = evt.target.id.split("-");

  if (game.firstClick) {
    game.setMines(+tY, +tX);
  }

  game.checkCell(+tY, +tX);
  showCells();

  if (game.gameOver || game.isWon()) {
    gameboard.removeEventListener("click", handleClick);
    gameboard.removeEventListener("contextmenu", handleRightClick);
    displayMessage();
  }
}

/** Allow right clicking to flag a cell */
function handleRightClick(evt) {
  evt.preventDefault();

  const [tY, tX] = evt.target.id.split("-");
  const cell = game.board[tY][tX];

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

  const board = document.querySelector("tbody");
  gameboard.removeChild(board);

  displayBoard(game.board);
  showCells();
  addEventListeners();
  clearMessage();
}

/** Show game message for win or loss */
function displayMessage() {
  if (game.gameOver) {
    messageArea.innerText = "Game over!";
  }
  if (game.isWon()) {
    messageArea.innerText = "Victory!";
  }
}

/** Clear game message */
function clearMessage() {
  messageArea.innerText = "";
}

/** Add click listeners for gameplay */
function addEventListeners() {
  gameboard.removeEventListener("click", handleClick);
  gameboard.removeEventListener("contextmenu", handleRightClick);
  gameboard.addEventListener("click", handleClick);
  gameboard.addEventListener("contextmenu", handleRightClick);
}

newGameForm.addEventListener("submit", newGame);
document.addEventListener("DOMContentLoaded", showInitialBoard);