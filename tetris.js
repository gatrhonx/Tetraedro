const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

let board = Array.from({ length: 20 }, () => Array(10).fill(0));
let pieces = 'ijlostz';
let colors = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];
let currentPiece, currentX, currentY;
let isPaused = false;
let interval;

function createPiece(type) {
    switch (type) {
        case 'i': return [[1, 1, 1, 1]];
        case 'j': return [[0, 0, 1], [1, 1, 1]];
        case 'l': return [[1, 0, 0], [1, 1, 1]];
        case 'o': return [[1, 1], [1, 1]];
        case 's': return [[0, 1, 1], [1, 1, 0]];
        case 't': return [[0, 1, 0], [1, 1, 1]];
        case 'z': return [[1, 1, 0], [0, 1, 1]];
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(currentPiece);
}

function drawBoard() {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col]) {
                context.fillStyle = colors[board[row][col] - 1];
                context.fillRect(col, row, 1, 1);
            }
        }
    }
}

function drawPiece(piece) {
    context.fillStyle = colors[pieces.indexOf(currentPiece.type)];
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                context.fillRect(col + currentX, row + currentY, 1, 1);
            }
        }
    }
}

function merge() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                board[currentY + row][currentX + col] = pieces.indexOf(currentPiece.type) + 1;
            }
        }
    }
}

function resetGame() {
    board = Array.from({ length: 20 }, () => Array(10).fill(0));
    document.getElementById('gameOver').style.display = 'none';
    spawnPiece();
    draw();
}

function spawnPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = { type, shape: createPiece(type) };
    currentX = Math.floor((10 - currentPiece.shape[0].length) / 2);
    currentY = 0;
    if (collides()) {
        document.getElementById('gameOver').style.display = 'block';
        clearInterval(interval);
    }
}

function collides(offsetX = 0, offsetY = 0, pieceShape = currentPiece.shape) {
    for (let row = 0; row < pieceShape.length; row++) {
        for (let col = 0; col < pieceShape[row].length; col++) {
            if (pieceShape[row][col] && 
                (board[currentY + row + offsetY] === undefined || 
                 board[currentY + row + offsetY][currentX + col + offsetX] === 1 || 
                 currentX + col + offsetX < 0 || 
                 currentX + col + offsetX >= board[0].length)) {
                return true;
            }
        }
    }
    return false;
}

function rotate() {
    const rotatedPiece = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
    if (!collides(0, 0, rotatedPiece)) {
        currentPiece.shape = rotatedPiece;
    }
}

function dropPiece() {
    if (!collides(0, 1)) {
        currentY++;
    } else {
        merge();
        clearLines();
        spawnPiece();
    }
}

function clearLines() {
    outer: for (let row = board.length - 1; row >= 0; row--) {
        if (board[row].every(cell => cell)) {
            board.splice(row, 1);
            board.unshift(Array(10).fill(0));
            row++;
        }
    }
}

function move(direction) {
    if (!collides(direction)) {
        currentX += direction;
    }
}

function togglePause() {
    isPaused = !isPaused;
    const button = document.getElementById('pauseButton');
    button.textContent = isPaused ? 'Reanudar' : 'Pausar';
    if (isPaused) {
        clearInterval(interval);
    } else {
        interval = setInterval(() => {
            dropPiece();
            draw();
        }, 1000);
    }
}

document.addEventListener('keydown', event => {
    if (!isPaused) {
        switch (event.key) {
            case 'a':
                move(-1);
                if (collides(-1)) currentX++; // Revert if collides
                break;
            case 'd':
                move(1);
                if (collides(1)) currentX--; // Revert if collides
                break;
            case 's':
                dropPiece();
                break;
            case 'w':
                rotate();
                break;
        }
        draw();
    }
});

document.getElementById('pauseButton').addEventListener('click', togglePause);

resetGame();
interval = setInterval(() => {
    if (!isPaused) {
        dropPiece();
        draw();
    }
}, 1000);
