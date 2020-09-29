let GameBoard = (function () {
  let content = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

  let display = function () {
    let cells = Array.from(document.querySelectorAll(".cell"));
    for (let i = 0; i < 9; i++) {
      cells[i].innerHTML = content[i];
    }
  };

  let setCell = function (index, marker) {
    if (content[index] == " ") {
      content[index] = marker;
      this.display();
      return true;
    }
    return false;
  };

  let notEmpty = function (cell) {
    return cell != " ";
  };

  let checkEndOfGame = function () {
    return content.every((cell) => notEmpty(cell));
  };

  let checkRow = function (row) {
    if (
      notEmpty(content[3 * row]) &&
      content[3 * row] == content[3 * row + 1] &&
      content[3 * row + 1] == content[3 * row + 2]
    ) {
      return true;
    }
  };

  let checkColumn = function (column) {
    if (
      notEmpty(content[column]) &&
      content[column] == content[column + 3] &&
      content[column + 3] == content[column + 6]
    ) {
      return true;
    }
  };

  let checkDiagonals = function () {
    if (!notEmpty(content[4])) return false;
    if (content[0] == content[4] && content[4] == content[8]) {
      return true;
    }
    if (content[2] == content[4] && content[4] == content[6]) {
      return true;
    }
  };

  let checkWinner = function () {
    for (let j = 0; j < 3; j++) {
      if (checkRow(j) || checkColumn(j)) {
        return true;
      }
    }

    return checkDiagonals() ? true : false;
  };

  let newGame = function () {
    content = content.map((cell) => (cell = " "));
    this.display();
  };

  return {
    display,
    setCell,
    checkWinner,
    checkEndOfGame,
    newGame,
  };
})();

let Player = function (marker) {
  return { marker };
};

let Bot = function (marker) {
  let randomMove = function () {};

  return { marker, randomMove };
};

let GameController = (function () {
  let players = [Player("X"), Bot("O")];
  let board = document.querySelector(".gameboard");
  let newGame = document.querySelector(".new-game");
  let commentsArea = document.querySelector(".comments");
  let warningsArea = document.querySelector(".warnings");
  let playing = 0;

  newGame.addEventListener("click", startNewGame);
  board.addEventListener("click", drawMarker);
  message();

  function startNewGame() {
    message();
    playing = 0;
    GameBoard.newGame();
  }

  function drawMarker(event) {
    let cell = event.target.closest(".cell");
    if (cell) {
      let cellIndex = parseInt(cell.dataset.index);
      if (GameBoard.setCell(cellIndex, players[playing].marker)) {
        cell.classList.add(`${players[playing].marker}`);
        endOfTurn();
      } else {
        message("warning");
      }
    }
  }

  function endOfTurn() {
    if (GameBoard.checkWinner()) {
      message("winner");
      board.removeEventListener("click", drawMarker);
    } else if (GameBoard.checkEndOfGame()) {
      message("draw");
      board.removeEventListener("click", drawMarker);
    } else {
      switchPlayers();
      message();
    }
  }

  function switchPlayers() {
    playing = (playing + 1) % 2;
  }

  function message(type) {
    switch (type) {
      case "warning":
        warningsArea.innerHTML = `This cell is not empty!`;
        break;
      case "winner":
        commentsArea.innerHTML = `<span class="${players[playing].marker}">${players[playing].marker}</span> wins!`;
        break;
      case "draw":
        commentsArea.innerHTML = `It's a draw!`;
        break;
      default:
        commentsArea.innerHTML = `Player <span class="${players[playing].marker}">${players[playing].marker}</span> turn`;
        warningsArea.innerHTML = "";
        break;
    }
  }
})();
