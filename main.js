let board = [];
let rows = 5;
let columns = 5;

let gameOver = false;

let time = 0;
let timeCounter;

let confirmCheck = false;

window.onload = function() {
    document.getElementById("restart-button").addEventListener("click", function() {
        if (!confirmCheck) {
            confirmCheck = true;
            if (!gameOver) {
                if (!confirm("Are you sure you want to restart?")) {
                    confirmCheck = false;
                    return;
                }
            }
            reloadGame();
            confirmCheck = false;
        }
    });
    document.getElementById("set-board-dimension-button").addEventListener("click", SetBoardDimension);
    window.onkeydown = function(event) {
        if (event.key == "r" && !event.ctrlKey) {
            if (!confirmCheck) {
                confirmCheck = true;
                if (!gameOver) {
                    if (!confirm("Are you sure you want to restart?")) {
                        confirmCheck = false;
                        return;
                    }
                }
                reloadGame();
                confirmCheck = false;
            }
        }
    }
    startGame();
}

function reloadGame() {
    clearBoard();
    gameOver = false;
    clearInterval(timeCounter);
    timeCounter = null;
    startGame();
}

function SetBoardDimension() {
    AskForBoardDimensionRows();
    AskForBoardDimensionColumns();
    document.getElementById("set-board-dimension").innerText = localStorage.getItem("TileSwapPuzzleBoardDimension") || "5x5";
}

function AskForBoardDimensionRows() {
    let rows = prompt("How many rows do you want to play with? (3-15)");
    if (rows >= 3 && rows <= 15) {
        localStorage.setItem("TileSwapPuzzleBoardDimension", parseInt(rows));
        return;
    } else if (rows == null) {
        return;
    } else {
        alert("The amount you put in is either invalid or bigger than 10. Please enter a number between 1 and 10.");
        AskForBoardDimensionRows();
    }
}

function AskForBoardDimensionColumns() {
    let columns = prompt("How many columns do you want to play with? (3-15)");
    if (columns >= 3 && columns <= 15) {
        localStorage.setItem("TileSwapPuzzleBoardDimension", localStorage.getItem("TileSwapPuzzleBoardDimension") + "x" + columns);
        return;
    } else if (columns == null) {
        localStorage.setItem("TileSwapPuzzleBoardDimension", localStorage.getItem("TileSwapPuzzleBoardDimension") + "x" + 5);
        return;
    } else {
        alert("The amount you put in is either invalid or bigger that 10. Please enter a number between 1 and 10.");
        AskForBoardDimensionColumns();
    }
}

function startGame() {
    rows = parseInt(localStorage.getItem("TileSwapPuzzleBoardDimension") ? localStorage.getItem("TileSwapPuzzleBoardDimension").split("x")[0] : 5);
    columns = parseInt(localStorage.getItem("TileSwapPuzzleBoardDimension") ? localStorage.getItem("TileSwapPuzzleBoardDimension").split("x")[1] : 5);
    document.getElementById("board-dimension").innerText = rows + "x" + columns;
    document.getElementById("set-board-dimension").innerText = rows + "x" + columns || "5x5";
    
    moves = 0;
    document.getElementById("moves-count").innerText = moves;

    time = 0;
    document.getElementById("time-count").innerText = "00:00";

    document.getElementById("solved-text").setAttribute("hidden", "");

    //set our board size
    document.getElementById("board").style.width = columns * 50 + "px";
    document.getElementById("board").style.height = rows * 50 + "px";
    //populate our board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add(Math.random() >= 0.5 ? "tile-state-1" : "tile-state-2");
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);

    let startTime = new Date().getTime();
    timeCounter = setInterval(function() {
        let now = new Date().getTime();
        let timeElapsed = now - startTime;
        let minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
        let secondsInTotal = Math.floor(timeElapsed / 1000);
        let processedTime;
        time = secondsInTotal;
        if (minutes > 0) {
            if (minutes >= 10) {
                if (seconds >= 10) {
                    processedTime = minutes + ":" + seconds
                } else {
                    processedTime = minutes + ":" + "0" + seconds;
                }
            } else {
                if (seconds >= 10) {
                    processedTime = "0" + minutes + ":" + seconds
                } else {
                    processedTime = "0" + minutes + ":" + "0" + seconds;
                }
            }
        } else {
            if (seconds >= 10) {
                processedTime = "00" + ":" + seconds
            } else {
                processedTime = "00" + ":" + "0" + seconds;
            }
        }
        document.getElementById("time-count").innerText = processedTime;
    }, 1000);
}

function clearBoard() {
    tiles = document.getElementById("board").children;
    for (let i = tiles.length - 1; i >= 0; i--) {
        tiles[i].remove();
    }
    board = [];
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }
    
    let tile = this;
    
    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    moves++;
    document.getElementById("moves-count").innerText = moves;
    
    toggleTile(r, c);
   
    //top
    toggleTile(r-1, c);
    //left and right
    toggleTile(r, c-1);//left
    toggleTile(r, c+1);//right
    //bottom
    toggleTile(r+1, c);

    let tilesAtState1 = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].classList.contains("tile-state-1")) {
                tilesAtState1++;
            }
        }
    }
    if (tilesAtState1 == rows * columns) {
        gameOver = true;
        clearInterval(timeCounter);
        timeCounter = null;
        document.getElementById("solved-text").removeAttribute("hidden");
        alert("You win!");
    }
}

function toggleTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    
    if (board[r][c].classList.contains("tile-state-1")) {
        board[r][c].classList.remove("tile-state-1");
        board[r][c].classList.add("tile-state-2");
    }
    else {
        board[r][c].classList.remove("tile-state-2");
        board[r][c].classList.add("tile-state-1");
    }
}
