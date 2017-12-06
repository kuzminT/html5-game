var ballX = 75;
var ballY = 100;
var ballSpeedX = 3;
var ballSpeedY = 3;
var canvas, canvasContext;

var mouseX = 0; 
var mouseY = 0;

const PADDLE_WIDTH = 80;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
const BRICK_W = 80;
const BRICK_H = 20; // temporarily doubled
const BRICK_COLS = 10;
const BRICK_ROWS = 14; // temporarily halfed

const BRICK_GAP = 2;

var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);

var bricksLeft = 0;

var paddleX = 400;

function updateMousePos (evt) {

    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX =  evt.clientX - rect.left - root.scrollLeft;
    mouseY =  evt.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH/2;

    // cheat / hack to test ball in any position
    // ballX =  mouseX;
    // ballY = mouseY;
    // ballSpeedX = 5;
    // ballSpeedY = -4;

} 


function ballReset() {
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

let fps =  60;


window.onload = function () {
    canvas =  document.getElementById('myCanvas');
    canvasContext =  canvas.getContext('2d');

    // Game loop
    // setInterval(updateAll, 1000/framesPerSecond);
    
    updateAll();
    

    canvas.addEventListener('mousemove', updateMousePos);

    brickReset();
    ballReset();
   
}

function updateAll() {

    requestAnimationFrame(updateAll);

    moveAll();
    drawAll();
    // setTimeout(function () {
    // requestAnimationFrame(updateAll);
    // moveAll();
    // drawAll();
    // }, 1000 / fps);
}

function ballMove () {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // console.log(ballSpeedX);

    if(ballX > canvas.width && ballSpeedX > 0.0) { // right
        ballSpeedX *= -1;
    }

    else if (ballX < 0 && ballSpeedX < 0.0 ) { // left
        ballSpeedX *= -1;
    }


   if(ballY > canvas.height) { // bottom
        // ballSpeedY *= -1;
        
        ballSpeedX  = 5;
        ballSpeedY = 5;

        ballReset();
        brickReset();
    }

    else if (ballY < 0 && ballSpeedY < 0.0 ) { // top
        ballSpeedY *= -1;
    }


    // console.log(ballSpeedX, ballSpeedY);
}

function isBrickAtRowCol(col, row)  {
    if (col >= 0 && col < BRICK_COLS &&
        row >= 0 && row < BRICK_ROWS) {

        var brickIndexUnderCoord =  rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    }
    else {
        return false;
    }
} 

function ballBrickHandling() {

    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow =  Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if(ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
       ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS
       )
    {
        if(isBrickAtRowCol(ballBrickCol, ballBrickRow) ) {
            brickGrid[brickIndexUnderBall] = false;
            bricksLeft--;
            // console.log(bricksLeft);


            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);

            var bothTestsFailed =  true;

            if (prevBrickCol != ballBrickCol) {

                 if(isBrickAtRowCol(prevBrickCol, ballBrickRow) == false ) {
                    // var adjBrickSide = rowColToArrayIndex(prevBrickCol, ballBrickRow);
                        ballSpeedX *= -1;
                        bothTestsFailed = false;
                 }

                

                // if (brickGrid[adjBrickSide] == false) {

                //    ballSpeedX *= -1;
                //    bothTestsFailed = false;
                // }
                

                

            }

            if (prevBrickRow != ballBrickRow) {

                if(isBrickAtRowCol(ballBrickCol, prevBrickRow) == false ) {

                // var adjBrickTopBot = rowColToArrayIndex(ballBrickCol, prevBrickRow);
                
                ballSpeedY *= -1;
                bothTestsFailed = false;

                // if (brickGrid[adjBrickTopBot] == false) {

                //     ballSpeedY *= -1;
                //     bothTestsFailed = false;

                // }

                if (bothTestsFailed) { // prevents ball from coming through
                    ballSpeedX *= -1;
                    ballSpeedY *= -1; 
                }
            }
        } // end of brick found
    }

}

} // end of ballBrickHandling function


function ballPaddleHandling () {

    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;

    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

    if( ballY > paddleTopEdgeY && // bellow the top of paddle
        ballY < paddleBottomEdgeY && // above bottom of paddle
        ballX > paddleLeftEdgeX && // right of the left side of paddle
        ballX < paddleRightEdgeX // left of the right side of paddle
       ) 
    {
        ballSpeedY *= -1;

        var centerOfPaddleX =  paddleX + PADDLE_WIDTH/2;
        var ballDistFromPaddleCenterX = ballX  - centerOfPaddleX;
        ballSpeedX =  ballDistFromPaddleCenterX * 0.35;


        if (bricksLeft == 0) {
            brickReset();
        } // out of bricks
    } // ball center inside paddle
} // end of ballPaddleHadling



function moveAll() {

    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
    // console.log(ballX);
  
}

function drawAll() {

    colorRect(0, 0, canvas.width, canvas.height, 'black'); // clear screen

    // draw a ball
    colorCircle(ballX, ballY, 10, 'white'); 

    // drow paddle

    colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, 
              PADDLE_WIDTH, PADDLE_THICKNESS, 'white');

    // console.log(mouseX);
    drawBricks();

    var mouseBrickCol = Math.floor(mouseX / BRICK_W);
    var mouseBrickRow = Math.floor(mouseY / BRICK_H);
    var brickIndexUnderMouse = rowColToArrayIndex(mouseBrickCol, mouseBrickRow);

    colorText(mouseBrickCol+","+mouseBrickRow + ":" + brickIndexUnderMouse, mouseX, mouseY, 'yellow');


}

function colorRect (topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle (centerX, centerY, radius, fillColor) {

    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor) {

    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY)
}

function rowColToArrayIndex(col, row) {
    return col + BRICK_COLS * row;
}

function drawBricks () {


    for (var eachRow=0; eachRow < BRICK_ROWS; eachRow++) {
        for (var eachCol = 0; eachCol <= BRICK_COLS; eachCol++) {

            var arrayIndex =  rowColToArrayIndex(eachCol, eachRow);
            
            if (brickGrid[arrayIndex])
                colorRect(BRICK_W*eachCol, BRICK_H*eachRow, BRICK_W-BRICK_GAP,BRICK_H-BRICK_GAP, 'blue');

        } // end for eachRow

    }
} 

 function brickReset () {

    var i;
    bricksLeft = 0;

    for(i=0; i < 3*BRICK_COLS; i++){
        brickGrid[i] = false;
    }

    for (; i < BRICK_COLS * BRICK_ROWS; i++) {
  /*      if(Math.random() < 0.5) {
            brickGrid[i] = true;
            bricksLeft++;

        }

        else {
           brickGrid[i] = false;
        }*/

        brickGrid[i] = true;
        bricksLeft++;

        // brickGrid[i] = true;
    }
} 
