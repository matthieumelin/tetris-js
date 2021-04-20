const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const EMPTY = "WHITE";

const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "yellow"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"],
]

let piece = getRandomPiece();

let score = 0;

// draw square
function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * SQ, y * SQ, SQ, SQ);

    context.strokeStyle = "BLACK";
    context.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the board
let board = [];
for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = EMPTY;
    }
}

drawBoard();

// draw the board
function drawBoard() {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

// piece object
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];

    this.x = 3;
    this.y = -2;
}

// fill function
Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// draw piece to the board
Piece.prototype.draw = function () {
    this.fill(this.color);
}

// undraw a piece 
Piece.prototype.unDraw = function () {
    this.fill(EMPTY);
}

function getRandomPiece() {
    let random = randomN = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[random][0], PIECES[random][1]);
}

// controls
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        this.lock();
        piece = getRandomPiece();
    }
}

Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

document.addEventListener("keydown", CONTROL);

let moveDown = false;

function CONTROL(event) {
    if (event.keyCode == 37) {
        dropStart = Date.now();
        
        piece.moveLeft();

        if (!moveDown) {
            moveDown = true;

            piece.moveDown();

            setTimeout(() => {
                moveDown = false;
            }, 600);
        }

    } else if (event.keyCode == 38) {
        dropStart = Date.now();

        piece.rotate();
    } else if (event.keyCode == 39) {
        dropStart = Date.now();
       
        piece.moveRight();

        if (!moveDown) {
            moveDown = true;

            piece.moveDown();

            setTimeout(() => {
                moveDown = false;
            }, 600);
        }
    } else if (event.keyCode == 40) {
        piece.moveDown();
    }
}

// game logic
let dropStart = Date.now();
let gameOver = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;

    if (delta > 1000) {
        piece.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

Piece.prototype.collision = function (x, y, piece) {
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {
            if (!piece[r][c]) {
                continue;
            }

            // new coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }

            if (newY < 0) {
                continue;
            }

            if (board[newY][newX] != EMPTY) {
                return true;
            }
        }
    }
    return false;
}

Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let flip = 0;

    if (this.collision(0, 0, nextPattern)) {
        // it's the right wall
        if (this.x > COL / 2) {
            // we move the piece to the left
            flip = -1;
        } else {
            // we move the piece to the right
            flip = 1;
        }
    }

    if (!this.collision(flip, 0, nextPattern)) {
        this.unDraw();
        this.x += flip;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

Piece.prototype.lock = function () {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            if (!this.activeTetromino[r][c]) {
                continue;
            }

            if (this.y + r < 0) {
                alert("Game Over");
                gameOver = true;
                break;
            }

            board[this.y + r][this.x + c] = this.color;
        }
    }

    // remove full rows
    for (r = 0; r < ROW; r++) {
        let isRowFull = true;

        for (c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != EMPTY);
        }

        if (isRowFull) {
            for (y = r; y > 1; y--) {
                for (c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            for (c = 0; c < COL; c++) {
                board[0][c] = EMPTY;
            }

            // increment the score
            score += 10;
        }
    }

    // update the board
    drawBoard();

    // update the score
    scoreElement.innerHTML = score;
}

drop();
