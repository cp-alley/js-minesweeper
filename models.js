const DIFFICULTY_LEVEL = {
  easy: {
    width: 9,
    height: 9,
    mines: 10
  },
  medium: {
    width: 16,
    height: 16,
    mines: 40
  },
  hard: {
    width: 30,
    height: 16,
    mines: 99
  },
}

/** Class for a game of minesweeper. */
class Game {
  board = [];
  height;
  width;
  mines;
  gameOver = false;

  constructor(difficulty = "easy") {
    const level = DIFFICULTY_LEVEL[difficulty]
    this.width = level.width;
    this.height = level.height;
    this.mines = level.mines;
    this.board = this.createBoard();
    console.log(this.board);
  }

  /** Given a square, count number of mines in adjacent squares */
  countMines(y, x) {
    const neighbors = this.getNeighbors(y, x);
    return neighbors.reduce((count, neighbor) => {
      return count += neighbor.mine;
    }, 0);
  }

  /** Given a cell coordinates, return array of neighboring cells */
  getNeighbors(y, x) {
    const neighbors = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let nY = y + i;
        let nX = x + j;

        // Skip current square
        if (nY === y && nX === x) continue;
        if (nY >= 0
          && nY < this.height
          && nX >= 0
          && nX < this.width) {
          neighbors.push(this.board[nY][nX]);
        }
      }
    }

    return neighbors;
  }

  /** Returns a 2d array of Cell instances */
  createBoard() {
    if (this.width * this.height < this.mines)
      throw new Error("Board size too small/too many mines");

    const board = [];

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        let cell = new Cell(y, x);
        row.push(cell);
      }
      board.push(row);
    }

    return board;
  }

  /** Fill board with mines and updae mine counts at start of game */
  setMines(startY, startX) {
    let i = 0;

    const startNeighbors = this.getNeighbors(+startY, +startX).map(n => n.id);
    const neighborCells = new Set(startNeighbors);

    while (i < this.mines) {
      let y = Math.floor(Math.random() * this.height);
      let x = Math.floor(Math.random() * this.width);

      // Don't place a mine on the starting square or its nighbors
      if (y === startY && x === startX || neighborCells.has(`${y}-${x}`)) continue;

      const cell = this.board[y][x];

      // Try again if this cell already has a mine
      if (cell.mine === 1) continue;

      cell.mine = 1;
      i++;
    }

    // Calculate mine counts for every cell
    this.board.map((r, i) => r.map((c, j) => c.mineCount = this.countMines(i, j)));
    console.log(this.board);
  }

  /** Check a cell. If cell is a mine, game is over. If cell is clear,
   *  uncover it. */
  checkCell(y, x) {
    const cell = this.board[y][x]
    if (cell.mine === 1) {
      this.endGame();
      return;
    }

    this.uncoverSafeCells(y, x)
  }

  /** Uncover a cell at the given coordinates. If given cell has no mines in 
   *  its neighboring cells, uncover those cells as well. */
  uncoverSafeCells(y, x) {
    console.debug("uncoverSafeCells")

    let cell = this.board[y][x];
    let queue = [cell];
    let visited = new Set();

    while (queue.length > 0) {
      let current = queue.shift();

      current.uncover();
      visited.add(current.id);

      if (current.mineCount === 0) {
        const [cY, cX] = current.id.split("-");
        const neighbors = this.getNeighbors(+cY, +cX);

        neighbors.map(neighbor => {
          if (!visited.has(neighbor.id)) {
            queue.push(neighbor);
            visited.add(neighbor.id);
          }
        })
      }
    }
  }

  /** Update game status at end of game */
  endGame() {
    this.revealMines();
    this.gameOver = true;
  }

  /** Uncover all mines on the current gameboard */
  revealMines() {
    this.board.map(row => {
      row.map(cell => {
        if (cell.mine === 1) {
          cell.uncover();
        }
      })
    })
  }

  isWon() {
    const target = this.width * this.height - this.mines;
    
    const currentCount = this.board.map(row => row.reduce((count, cell) => {
      if (cell.mine === 0 && cell.clicked) {
        return count += 1;
      }
      return count;
    }, 0)).reduce((count, curr) => count + curr);

    if (currentCount === target) return true;
    return false;
  }
}

/** Class for a minesweeper cell. Contains info for clicked and flagged status
 *  and mine count of surrounding cells.
 */
class Cell {
  id;
  mine = 0;
  mineCount = 0;
  flagged = false;
  clicked = false;

  constructor(y, x) {
    this.id = `${y}-${x}`;
    this.clicked = false;
    this.flagged = false;
  }

  uncover() {
    if (this.clicked === false) {
      this.clicked = true;
    }
  }
}