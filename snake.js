const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

// Configurações do grid
const cellSize = 25;
const cellPadding = 2; 
const numOfColumns = Math.floor(canvas.width / cellSize);
const numOfRows = Math.floor(canvas.height / cellSize);

// Configurações do jogo
const baseSpeed = 150;
const speedIncrement = 2;
let currentSpeed = baseSpeed;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isRunning = false;
let isPaused = false;
let applePulse = 0;

// Maçã
let apple = { x: 0, y: 0 };
let appleType = 'normal';

function createApple() {
    const availablePositions = [];
    
    for (let x = 0; x < numOfColumns; x++) {
        for (let y = 0; y < numOfRows; y++) {
            if (!isSnake(x, y)) {
                availablePositions.push({ x, y });
            }
        }
    }
    
    if (availablePositions.length > 0) {
        const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        apple = { x: randomPos.x, y: randomPos.y };
        
        const rand = Math.random();
        appleType = rand < 0.05 ? 'special' : rand < 0.15 ? 'golden' : 'normal';
    } else {
        gameover(true);
    }
}

function isApple(x, y) {
    return apple.x === x && apple.y === y;
}

// Cobra
let snake = [
    {x: 2, y: 1},
    {x: 1, y: 1}
];
let xSpeed = 1;
let ySpeed = 0;

function isSnake(x, y) {
    return snake.some(part => part.x === x && part.y === y);
}

function updateSnake() {
    if (isPaused) return;
    
    const newHead = {
        x: snake[0].x + xSpeed,
        y: snake[0].y + ySpeed
    };

    // Verifica colisão com as bordas
    if (newHead.x < 0 || newHead.x >= numOfColumns || 
        newHead.y < 0 || newHead.y >= numOfRows) {
        gameover(false);
        return;
    }

    // Verifica colisão com o próprio corpo
    if (isSnake(newHead.x, newHead.y)) {
        gameover(false);
        return;
    }

    snake.unshift(newHead);

    if (isApple(newHead.x, newHead.y)) {
        switch(appleType) {
            case 'golden':
                score += 3;
                break;
            case 'special':
                score += 1;
                currentSpeed = Math.min(baseSpeed, currentSpeed + 30);
                break;
            default:
                score += 1;
        }
        
        currentSpeed = Math.max(50, baseSpeed - (score * speedIncrement));
        updateScore();
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            updateScore();
        }
        
        createApple();
    } else {
        snake.pop();
    }
}

function isWall(x, y) {
    return x < 0 || x >= numOfColumns || y < 0 || y >= numOfRows;
}

// Renderização 
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fundo
    ctx.fillStyle = "#1a2e22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.fillStyle = "#4ADE80";
    for (let x = 0; x < numOfColumns; x++) {
        for (let y = 0; y < numOfRows; y++) {
            ctx.fillRect(
                x * cellSize, 
                y * cellSize, 
                cellSize - 1, 
                cellSize - 1
            );
        }
    }
    
    // Maçã
    applePulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    const appleSize = cellSize * 0.8 * applePulse;
    const appleOffset = (cellSize - appleSize) / 2;
    
    switch(appleType) {
        case 'golden':
            const goldenGradient = ctx.createRadialGradient(
                apple.x * cellSize + cellSize/2,
                apple.y * cellSize + cellSize/2,
                0,
                apple.x * cellSize + cellSize/2,
                apple.y * cellSize + cellSize/2,
                cellSize/2
            );
            goldenGradient.addColorStop(0, '#FFD700');
            goldenGradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = goldenGradient;
            break;
            
        case 'special':
            ctx.fillStyle = '#FF00FF';
            break;
            
        default:
            ctx.fillStyle = 'red';
    }
    
    ctx.beginPath();
    ctx.arc(
        apple.x * cellSize + cellSize/2,
        apple.y * cellSize + cellSize/2,
        appleSize/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Cobra
    snake.forEach((part, index) => {
        const isHead = index === 0;
        const size = isHead ? cellSize * 0.9 : cellSize * 0.8;
        const offset = (cellSize - size) / 2;
        
        ctx.fillStyle = isHead ? '#5a3e0f' : '#854d0e';
        ctx.beginPath();
        ctx.roundRect(
            part.x * cellSize + offset,
            part.y * cellSize + offset,
            size,
            size,
            isHead ? size/4 : size/3
        );
        ctx.fill();
        
        // Olhos na cabeça
        if (isHead) {
            ctx.fillStyle = 'white';
            const eyeSize = size/5;
            const leftEyeX = part.x * cellSize + offset + size/3;
            const rightEyeX = part.x * cellSize + offset + size * 2/3;
            const eyeY = part.y * cellSize + offset + size/3;
            
            ctx.beginPath();
            ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupilas
            ctx.fillStyle = 'black';
            const pupilOffsetX = xSpeed * eyeSize/2;
            const pupilOffsetY = ySpeed * eyeSize/2;
            ctx.beginPath();
            ctx.arc(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, eyeSize/2, 0, Math.PI * 2);
            ctx.arc(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Pause 
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    }
}


function updateScore() {
    document.getElementById("score").textContent = `Score: ${score} | High Score: ${highScore}`;
}

function moveRight() {
    if (xSpeed === -1 || isPaused) return;
    xSpeed = 1;
    ySpeed = 0;
}

function moveLeft() {
    if (xSpeed === 1 || isPaused) return;
    xSpeed = -1;
    ySpeed = 0;
}

function moveUp() {
    if (ySpeed === 1 || isPaused) return;
    xSpeed = 0;
    ySpeed = -1;
}

function moveDown() {
    if (ySpeed === -1 || isPaused) return;
    xSpeed = 0;
    ySpeed = 1;
}

function togglePause() {
    if (!isRunning) return;
    
    isPaused = !isPaused;
    if (!isPaused) {
        lastUpdate = performance.now();
    }
    render();
}

function handleKeyboardMove(e) {
    if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowUp': moveUp(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
    }
}

let lastUpdate = 0;
function gameloop(timestamp) {
    if (!isRunning || isPaused) {
        requestAnimationFrame(gameloop);
        return;
    }
    
    if (timestamp - lastUpdate > currentSpeed) {
        updateSnake();
        render();
        lastUpdate = timestamp;
    }
    
    requestAnimationFrame(gameloop);
}

function start() {
    isRunning = true;
    isPaused = false;
    document.getElementById("menu").style.display = "none";
    
    snake = [
        {x: 2, y: 1},
        {x: 1, y: 1}
    ];
    xSpeed = 1;
    ySpeed = 0;
    
    currentSpeed = baseSpeed;
    score = 0;
    updateScore();
    
    createApple();
    document.onkeydown = handleKeyboardMove;
    requestAnimationFrame(gameloop);
}

function gameover(isWin) {
    isRunning = false;
    const menu = document.getElementById("menu");
    const texto = document.getElementById("texto");
    
    menu.style.display = "flex";
    texto.innerHTML = isWin ? 'VOCÊ VENCEU!<br>Todos os espaços preenchidos!' : 
                             `GAME OVER!<br>Sua pontuação: ${score}<br>Recorde: ${highScore}`;
    
    document.onkeydown = function() {
        start();
    };
}

document.onkeydown = function(e) {
    if (!isRunning && e.key) {
        start();
    }
};

// Touch
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown || !isRunning || isPaused) return;
    
    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;
    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;
    
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        xDiff > 0 ? moveLeft() : moveRight();
    } else {
        yDiff > 0 ? moveUp() : moveDown();
    }
    
    xDown = null;
    yDown = null;
}

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);