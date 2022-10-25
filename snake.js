const canvas = document.getElementById("canvas")

const ctx = canvas.getContext('2d')
//grid
const cellWidth = 25
const cellHeight = 25

const numOfColumns = Math.ceil((canvas.width-25) / cellWidth)
const numOfRows = Math.ceil((canvas.height-25) / cellHeight)

//maçã

var xApple = 4;
var yApple = 4;

function isApple(x, y) {
    return xApple == x  && yApple == y 
}


function createApple() {
    xApple = Math.ceil((numOfColumns - 1) * Math.random()) 
    yApple = Math.ceil((numOfRows - 1) * Math.random()) 

    if (isWall(xApple,yApple) || isSnake(xApple, yApple)) {
       createApple() 
    }
    console.log(xApple)
}

function isWall(x, y) {
    return !(x >= 1 && x < numOfColumns && y >= 1 && y < numOfRows)
}
//cobra

var snake = [
    {x: 2, y: 1},
    {x: 1, y: 1}
]

var xSpeed = 1
var ySpeed = 0

function isSnake(x, y) {
    for (const part of snake) {
        if (part.x == x  && part.y == y){
        return true
    }
}
return false
}

function updateSnake() {
    const newhead = {x: snake[0].x + xSpeed, y: snake[0].y + ySpeed}


    if (isWall(newhead.x, newhead.y) || isSnake(newhead.x, newhead.y)) {
        gameover()

    }

    snake = [newhead].concat(snake) 

    if (isApple(newhead.x, newhead.y)) {
        createApple()
    } else {
        snake.pop()
    }
}

//render
function render() {
console.log("render...")

for(let x = 1; x < numOfColumns; x++) {
for(let y = 1; y < numOfRows; y++) {
    let xPos = x*cellWidth
    let yPos = y*cellHeight
    if (isApple(x, y)) {
        ctx.fillStyle = "red"
        ctx.fillRect(xPos + 4, yPos + 4, cellWidth, cellHeight) 
    } else if (isSnake(x, y)) {
        ctx.fillStyle = "#854d0e"
        ctx.fillRect(xPos + 4, yPos + 4, cellWidth, cellHeight)
            
    } else {
        ctx.fillStyle = "#4ADE80"
        ctx.fillRect(xPos + 4, yPos + 4, cellWidth , cellHeight )
    }
}
}
}

var isRunning = false

function gameover() {
    isRunning = false
  var menu =  document.getElementById("menu")
  menu.style = "display: flex"
  var texto =  document.getElementById("texto")
  texto.textContent = 'MORREU!'
  document. onkeydown = function() {
    start()
  }
}

//gameloop
function gameloop(){ 
    updateSnake()
    render()
    if (isRunning)
        setTimeout(gameloop, 100)
}

function handleKeyboardMove(e) {
    switch(e.key) {
        case 'ArrowUp':
           moveUp()
            break
            case 'ArrowDown':
                moveDown()
                break
                case 'ArrowLeft':
                    moveLeft()
                    break
                case 'ArrowRight':
                    moveRigth()
                    break
    }
}

function start() {
    console.log("asdf")
    isRunning = true
    var menu =  document.getElementById("menu")
    menu.style = "display: none"
    snake = [
        {x: 2, y: 1},
        {x: 1, y: 1}
    ]
    xSpeed = 1
    ySpeed = 0

    xApple= 4
    yApple= 4
    
    document.onkeydown =  handleKeyboardMove

    gameloop()
}

document.onkeydown = function() {
    start()
}

//celular

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if(!isRunning) {
        start()
    }
    
    if ( ! xDown || ! yDown ) {
        return;
    }


    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* right swipe */ 
            moveLeft()
        } else {
            /* left swipe */
            moveRigth()
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* down swipe */ 
            moveUp()
        } else { 
            /* up swipe */
            moveDown()
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

function moveRigth() {
    if (xSpeed <= -1)
    return;
    ySpeed = 0
    xSpeed = 1
}

function moveLeft() {
    if (xSpeed >= 1)
    return;
    ySpeed = 0
    xSpeed = -1
}

function moveUp() {
    if (ySpeed >= 1)
            return;
            ySpeed = -1
            xSpeed = 0
}

function moveDown() {
    if (ySpeed <= -1)
                return;
                ySpeed = 1
                xSpeed = 0
}