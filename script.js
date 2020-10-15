"use strict";

let GameBoard = (function () {
  let content = Array(9).fill("");

  let getState = function () {
    return content;
  };

  let display = function () {
    let cells = Array.from(document.querySelectorAll(".cell"));
    for (let i = 0; i < 9; i++) {
      cells[i].innerHTML = content[i];
    }
  };

  let setCell = function (index, marker) {
    if (isEmpty(content[index])) {
      content[index] = marker;
      this.display();
      return true;
    }
    return false;
  };

  let isEmpty = function (cell) {
    return cell == "";
  };

  let listEmptyCells = function (state = content) {
    let indexes = Array(9)
      .fill(0)
      .map((x, i) => x + i);
    return indexes.filter((x) => isEmpty(state[x]));
  };

  let checkEndOfGame = function (state = content) {
    return state.every((cell) => !isEmpty(cell));
  };

  let checkRow = function (
    row,
    state = content,
    playerMarker = state[3 * row]
  ) {
    if (
      !isEmpty(state[3 * row]) &&
      playerMarker == state[3 * row] &&
      state[3 * row] == state[3 * row + 1] &&
      state[3 * row + 2] == state[3 * row + 1]
    ) {
      return true;
    }
  };

  let checkColumn = function (
    column,
    state = content,
    playerMarker = state[column]
  ) {
    if (
      !isEmpty(state[column]) &&
      playerMarker == state[column] &&
      state[column] == state[column + 3] &&
      state[column + 6] == state[column + 3]
    ) {
      return true;
    }
  };

  let checkDiagonals = function (state = content, playerMarker = state[4]) {
    if (isEmpty(state[4])) return false;
    if (
      state[0] == state[4] &&
      state[4] == state[8] &&
      state[4] == playerMarker
    ) {
      return true;
    }
    if (
      state[2] == state[4] &&
      state[4] == state[6] &&
      state[4] == playerMarker
    ) {
      return true;
    }
  };

  let checkWinner = function (state, playerMarker) {
    for (let j = 0; j < 3; j++) {
      if (
        checkRow(j, state, playerMarker) ||
        checkColumn(j, state, playerMarker)
      ) {
        return true;
      }
    }

    return checkDiagonals(state, playerMarker) ? true : false;
  };

  let newGame = function () {
    let cells = document.querySelectorAll(".cell");
    cells.forEach((c) => (c.className = "cell"));
    content = Array(9).fill("");
    this.display();
  };

  return {
    getState,
    display,
    setCell,
    listEmptyCells,
    checkWinner,
    checkEndOfGame,
    newGame,
  };
})();

let Player = function (marker) {
  return { type: "human", marker };
};

let Bot = function (marker) {
  let randomMove = function (indexes) {
    let length = indexes.length;
    let randomIndex = Math.floor(Math.random() * length);
    return indexes[randomIndex];
  };

  return { type: "bot", marker, randomMove };
};

let GameController = (function () {
  let [player, bot] = [Player("X"), Bot("O")];
  let players = [player, bot];
  let playing = 0;
  let board = document.querySelector(".gameboard");
  let newGame = document.querySelector(".new-game");
  let commentsArea = document.querySelector(".comments");
  let warningsArea = document.querySelector(".warnings");
  let clickListenerOn = false;

  newGame.addEventListener("click", launchGame);
  launchGame();

  function launchGame() {
    playing = 0;
    message();
    GameBoard.newGame();
    addListener();
  }

  function addListener(){
    if (!clickListenerOn) {
      board.addEventListener("click", pickCell);
      clickListenerOn = true;
    }
  }

  function removeListener(){
    if (clickListenerOn) {
      board.removeEventListener("click", pickCell);
      clickListenerOn = false;
    }
  }

  function pickCell(event) {
    let cell = event.target.closest(".cell");
    if (cell) {
      let cellIndex = parseInt(cell.dataset.index);
      if (GameBoard.setCell(cellIndex, players[playing].marker)) {
        cell.classList.add(`${players[playing].marker}`);
        if (!endOfTurn()) {
          botTurn();
        }
      } else {
        message("warning");
      }
    }
  }

  function botTurn() {
    let botChoice = minimax(GameBoard.getState(), playing)[0];
    GameBoard.setCell(botChoice, bot.marker);
    let cell = document.querySelector(`[data-index="${botChoice}"]`);
    cell.classList.add(`${bot.marker}`);
    endOfTurn();
  }

  function endOfTurn() {
    if (GameBoard.checkWinner()) {
      message("winner");
      removeListener();
      return true;
    } else if (GameBoard.checkEndOfGame()) {
      message("draw");
      removeListener();
      return true;
    } else {
      switchPlayers();
      message();
      return false;
    }
  }

  function switchPlayers(player) {
    if (player != undefined) {
      return (player + 1) % 2;
    } else {
      playing = (playing + 1) % 2;
    }
  }

  function message(type) {
    switch (type) {
      case "warning":
        warningsArea.innerHTML = `This cell is not empty!`;
        break;
      case "winner":
        commentsArea.innerHTML = `<span class="${players[playing].marker}">${players[playing].marker}</span> wins!`;
        warningsArea.innerHTML = "";
        break;
      case "draw":
        commentsArea.innerHTML = `It's a draw!`;
        warningsArea.innerHTML = "";
        break;
      default:
        commentsArea.innerHTML = `Player <span class="${players[playing].marker}">${players[playing].marker}</span> turn`;
        warningsArea.innerHTML = "";
        break;
    }
  }

  function minimax(state, currentPlayer) {
    if (GameBoard.checkWinner(state, bot.marker)) {
      return ["", 10];
    } else if (GameBoard.checkWinner(state, player.marker)) {
      return ["", -10];
    } else if (GameBoard.checkEndOfGame(state)) {
      return ["", 0];
    }

    let moves = [];
    let scores = [];

    GameBoard.listEmptyCells(state).forEach((cellIndex) => {
      moves.push(cellIndex);
      let newState = [...state];
      newState.splice(cellIndex, 1, players[currentPlayer].marker);
      scores.push(minimax(newState, switchPlayers(currentPlayer))[1]);
    });

    if (currentPlayer == 1) {
      let maxScore = Math.max(...scores);
      let maxScoreIndex = scores.indexOf(maxScore);
      return [moves[maxScoreIndex], maxScore];
    } else {
      let minScore = Math.min(...scores);
      let minScoreIndex = scores.indexOf(minScore);
      return [moves[minScoreIndex], minScore];
    }
  }
})();
