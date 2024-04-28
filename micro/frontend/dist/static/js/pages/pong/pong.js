
export default function pong() {
  const CANVAS = document.getElementById('canvas');

  CANVAS.style.backgroundColor = 'black';
const GAME_SETTINGS = {
	wallColor: "#202020",
  buttonColor: "#111",
  buttonTextColor: "#eee",
  scoreTextColor: '#eee',
  playerOneColor: "red",
  playerTwoColor: "blue",
  
  smallFont: "16px Arial",
  largeFont: "20px Arial",
  
  scoreSoundUrl: 'https://opengameart.org/sites/default/files/Win%20sound.wav',
  hitSoundUrl: 'https://opengameart.org/sites/default/files/pingpongbat.ogg',
  hitWallSoundUrl: 'https://opengameart.org/sites/default/files/pingpongboard_0.ogg',
  
  winScore: 7,
  paddleWidth: 12,
  paddleHeight: 48,
  ballRadius: 8,
  wallSize: 20,
  courtMarginX: 12,
  courtMarginY: 4,

  targetFps: 60,
  
  getIntervalLength: function() { return 1.0 / this.targetFps; }
}

let isMuted = false;

const PlayerIndex = {
	playerOne: 1,
  playerTwo: 2
}

class TennisGame {
	
  constructor(canvas) {
  	
    this._court = new Court(canvas);
    this._canvas = canvas;
    
    this._startButtonRect = new Rectangle(
    	canvas.width / 2 - 60, 
      canvas.height / 2 - 20, 
      120, 
      40
    );
    
    let that = this;
    
    this._canvas.addEventListener('click', function(e) {
    
    	let canvasBounds = canvas.getBoundingClientRect();
      
    	let mouseX = e.clientX - canvasBounds.left;
      let mouseY = e.clientY - canvasBounds.top;
      
      if(that._startButtonRect.contains(mouseX, mouseY) && !that._court.isMatchRunning)
      	that._court.startMatch();

    
    });
    
    document.addEventListener('keydown', function(e) {

      if((e.key === ' ' || e.key === 'Space') && !that._court.isMatchRunning)
          that._court.startMatch();
    
    });
        
  }
  
  draw() {
  
  	let ctx = this._canvas.getContext('2d');
    
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  
  	this._court.draw(this._canvas);
    
    if(!this._court.isMatchRunning) {
    
    	ctx.fillStyle = GAME_SETTINGS.buttonColor;
    	ctx.fillRect(
      	this._startButtonRect.x, 
        this._startButtonRect.y, 
        this._startButtonRect.width,
        this._startButtonRect.height
      );
      
      ctx.fillStyle = GAME_SETTINGS.buttonTextColor;
      ctx.font = GAME_SETTINGS.smallFont;
      ctx.fillText(
      	'Start Match', 
      	this._startButtonRect.x + 20, 
        this._startButtonRect.y + this._startButtonRect.height / 2 + 6
      );
      
    
    }
  
  }
  
  _update(deltaTime) {
  
  	this._court.update(deltaTime);
  
  }
  
  run() {
  
  	this._canvas.style.display = "block";
  
  	let that = this;
    
    let previousUpdateTime = Date.now();
  
  	setInterval(function() {
    
    	let updateTime = Date.now();
    	let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
      
    	that._update(deltaTime);
      that.draw()
      
      previousUpdateTime = updateTime;
    
    }, GAME_SETTINGS.getIntervalLength() * 1000);
  
  }
  
}

class Court {

	constructor(canvas) {
  
  	this._canvas = canvas;
  
  	this._leftPaddle = new Paddle(
    	GAME_SETTINGS.paddleWidth, 
      canvas.height / 2 - GAME_SETTINGS.paddleHeight / 2, 
      GAME_SETTINGS.paddleWidth, 
      GAME_SETTINGS.paddleHeight, 
      PlayerIndex.playerOne, 
      this
    );
    
    this._rightPaddle = new Paddle(
    	canvas.width - GAME_SETTINGS.paddleWidth - 12, 
      canvas.height / 2 - GAME_SETTINGS.paddleHeight / 2, 
      GAME_SETTINGS.paddleWidth, 
      GAME_SETTINGS.paddleHeight, 
      PlayerIndex.playerTwo, 
      this
    );
    
    this._playerController = new PlayerPaddleController(this._leftPaddle);  
    
    this._ball = new Ball(
    	GAME_SETTINGS.ballRadius, 
      canvas.width / 2, 
      canvas.height / 2, 
      this
    );
    
    this._cpuController = new CpuPaddleController(this._rightPaddle, this._ball);

    this._isMatchRunning = false;
    
    this._scoreSound = new Audio(GAME_SETTINGS.scoreSoundUrl);
    
    this._scoreBoard = new ScoreBoard();
    
  }
  
  get leftPaddle() { return this._leftPaddle; }
  get rightPaddle() { return this._rightPaddle; }
  
  get isMatchRunning() { return this._isMatchRunning; }
  
  get bounds() {
  	return {
    	upper: GAME_SETTINGS.courtMarginY + GAME_SETTINGS.wallSize,
      lower: this._canvas.height - (GAME_SETTINGS.courtMarginY + GAME_SETTINGS.wallSize),
      left: 0,
      right: this._canvas.width
    }
  }
  
  update(deltaTime) {
  
  	if(!this._isMatchRunning)
    	return;
  
    this._playerController.update(deltaTime);
    this._cpuController.update(deltaTime);
    this._ball.update(deltaTime);
    
  }
  
  draw(canvas) {
  
  	let ctx = canvas.getContext('2d');
    ctx.fillStyle = GAME_SETTINGS.wallColor;
    
    ctx.fillRect(0, GAME_SETTINGS.courtMarginY, this._canvas.width, GAME_SETTINGS.wallSize);
    ctx.fillRect(0, this._canvas.height - GAME_SETTINGS.courtMarginY - GAME_SETTINGS.wallSize, this._canvas.width, GAME_SETTINGS.wallSize);
    
    this._leftPaddle.draw(canvas);
    this._rightPaddle.draw(canvas);
    this._ball.draw(canvas);
    
    this._scoreBoard.draw(canvas);
  
  }
  
  startMatch() {
  
  	this._isMatchRunning = true;
  	this._spawnBall();
    this._scoreBoard.reset();
    this._scoreBoard.round = 1;
    this._leftPaddle.reset();
    this._rightPaddle.reset();
    
  }
  
  _spawnBall() {  

  	this._ball.velocity = { 
    	x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
    };
    
    this._ball.posX = this._canvas.width / 2;
    this._ball.posY = this._canvas.height / 2;
    
    this._ball.speed = Ball.minSpeed;
  
  }
  
  scorePoint(playerIndex) {
  
  	if(!isMuted) {
     	this._scoreSound.currentTime = 0;
  		this._scoreSound.play(); 
    }

  
  	if(playerIndex == PlayerIndex.playerOne) {
    
    	this._scoreBoard.playerOneScore++; 
    
    }
    else {
    
      this._scoreBoard.playerTwoScore++; 
 
    }
    
    if(this._scoreBoard.winner) {
    
    	this._isMatchRunning = false;
       
    }
    else {
    
      this._scoreBoard.round++;
    	this._spawnBall(); 
      
    }
  
  }

}

class PlayerPaddleController {

	constructor(paddle) {
  
  	this._paddle = paddle;
    this._isUpKeyPressed = false;
    this._isDownKeyPressed = false;
    
    let that = this;
    
    document.addEventListener('keydown', function(e) {
    	
      if(e.key == "ArrowUp" || e.key == "w") {
      
      	that._isUpKeyPressed = true;
      
      }
      else if(e.key == "ArrowDown" || e.key == "s") {
      
      	that._isDownKeyPressed = true;

      
      }
      
    });
    
    document.addEventListener('keyup', function(e) {
     	
      if(e.key == "ArrowUp" || e.key == "w") {
      
      	that._isUpKeyPressed = false;
      
      }
      else if(e.key == "ArrowDown" || e.key == "s") {
      
      	that._isDownKeyPressed = false;

      
      }
      
    });
  
  }
  
  get velocityY() {
  
  	let velocityY = 0;
    
    if(this._isUpKeyPressed)
    	velocityY -= 1;
    
    if(this._isDownKeyPressed)
    	velocityY += 1;
      
    return velocityY;
  
  }
  
  update(deltaTime) {
  
  	if(this.velocityY > 0)
    	this._paddle.moveDown(deltaTime);
    else if(this.velocityY < 0)
    	this._paddle.moveUp(deltaTime);
  
  }

}
class CpuPaddleController {

	constructor(paddle, ball) {
  
  	this._paddle = paddle;
    this._ball = ball;
    
  }
  
  static get predictionDistanceMax() {
  	return 400.0;
  }
  
  static get predictionDistanceMin() {
  	return 20.0;
  }
  
  static get errorMarginMax() {
  	return 0.5;
  }
  
  update(deltaTime) {
  
  	let rng = Math.random();
    let predictChance = this._getBallPredictionChance();
    
    let ballDeltaY = Math.sign(this._paddle.posY - this._ball.posY + this._paddle.height/2);
    
    if(rng <= predictChance) {
    
    	if(ballDeltaY > 0)
      	this._paddle.moveUp(deltaTime);
      else
      	this._paddle.moveDown(deltaTime);
    
    }
    else {
    
    	rng = Math.random();
      
      if(rng < 0.2) {
      
        if(ballDeltaY > 0)
          this._paddle.moveDown(deltaTime);
        else
          this._paddle.moveUp(deltaTime);
      
      }
    
    }
    
  
  }
  
  _calculateErrorMargin() {
  	return CpuPaddleController.errorMarginMax * this._ball.normalizedSpeed;
  }
  
  _getBallPredictionChance() {
  
  	let distance = this._getBallDistance() - CpuPaddleController.predictionDistanceMin;
    let errorMargin = this._calculateErrorMargin();
  
  	return 1.0 - (distance / CpuPaddleController.predictionDistanceMax) - errorMargin;
  
  }
  
  _getBallDistance() {
  	
    return Math.abs(this._paddle.posX - this._ball.posX);
  
  }

}

class Paddle {

	constructor(posX, posY, width, height, playerIndex, court) {
  	this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this._playerIndex = playerIndex;
    this._court = court;
    this._startPosX = posX;
    this._startPosY = posY;
  }
  
  static get speed() {
  	return 150;
  }
  
  get collisionBox() {
  
  	return new Rectangle(this.posX, this.posY, this.width, this.height);
  
  }
  
  draw(canvas) {
  
  	let ctx = canvas.getContext('2d');
    ctx.fillStyle = this.renderColor;
    ctx.fillRect(this.posX, this.posY, this.width, this.height);
  
  }
  
  get renderColor() {
  	return this._playerIndex == PlayerIndex.playerOne 
    	? GAME_SETTINGS.playerOneColor 
      : GAME_SETTINGS.playerTwoColor;
  }
  
  moveUp(deltaTime) {

		this.posY -= Paddle.speed * deltaTime;   
    
    if(this.posY < this._court.bounds.upper)
    	this.posY = this._court.bounds.upper;
  
  }
  
  moveDown(deltaTime) {
  	
  	this.posY += Paddle.speed * deltaTime;
  
    if(this.posY + this.height > this._court.bounds.lower)
    	this.posY = this._court.bounds.lower - this.height;
  }
  
  reset() {
  	this.posX = this._startPosX;
    this.posY = this._startPosY;
  }

}

class Ball {

	constructor(radius, posX, posY, court) {
  	this.posX = posX;
    this.posY = posY;
  	this.radius = radius;
    this._velocity = { x: 0, y: 0};
    this._court = court;
    this._hitSound = new Audio(GAME_SETTINGS.hitSoundUrl);
    this._hitWallSound = new Audio(GAME_SETTINGS.hitWallSoundUrl);
    this._speed = Ball.minSpeed;
  }
  
  static get minSpeed() { return 100; }
  static get maxSpeed() { return 300; }
  static get acceleration() { return  2; }
  
  get speed() { return this._speed; }
  set speed(val) {
  	
    if(val < Ball.minSpeed)
    	val = Ball.minSpeed;
    else if(val > Ball.maxSpeed)
    	val = Ball.maxSpeed;
      
    this._speed = val;
    
  }
  
  get normalizedSpeed() {
  	return (this._speed - Ball.minSpeed) / (Ball.maxSpeed - Ball.minSpeed);
  }
  
  
  get collisionBox() {
  
  	return new Rectangle(
    	this.posX - this.radius, 
      this.posY - this.radius, 
      this.radius * 2, 
      this.radius * 2
    );
    
  }
  
  get velocity() { return this._velocity; }
  set velocity(velo) { this._velocity = velo; }
  
  _playHitSound() {
  
      if(!isMuted) {
      	this._hitSound.currentTime = 0;
        this._hitSound.play();
      }
      
  }
  
  _playHitWallSound() {
  
  	if(!isMuted) {
    	this._hitWallSound.currentTime = 0;
      this._hitWallSound.play();
    }
  
  }
  
  update(deltaTime) {
  
  	this.posY += Math.sign(this.velocity.y) * this.speed * deltaTime;
    
    if(this.posY - this.radius < this._court.bounds.upper) {
    	this.posY = this._court.bounds.upper + this.radius;
      this.velocity.y *= -1;
      
      this._playHitWallSound();
    }
    else if(this.posY + this.radius > this._court.bounds.lower) {
    	this.posY = this._court.bounds.lower - this.radius;
      this.velocity.y *= -1;
      
      this._playHitWallSound();
    }
    
    if(this.collisionBox.overlaps(this._court.leftPaddle.collisionBox)) {
       
    	this.velocity.x *= -1;   
      this.posX = this._court.leftPaddle.collisionBox.right + this.radius;
      
			this._playHitSound();
       
    }
    
    if(this.collisionBox.overlaps(this._court.rightPaddle.collisionBox)) {
       
    	this.velocity.x *= -1;   
      this.posX = this._court.rightPaddle.collisionBox.left - this.radius;
       
      this._playHitSound();
       
    }
    
    this.posX += Math.sign(this.velocity.x) * this.speed * deltaTime;
    
    if(this.posX < this._court.bounds.left)
    	this._court.scorePoint(PlayerIndex.playerTwo);
    else if(this.posX > this._court.bounds.right)
    	this._court.scorePoint(PlayerIndex.playerOne);
      
    this.speed += Ball.acceleration * deltaTime;
  
  }
  
  draw(canvas) {
  
  	let ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
  
  }
  
}

class ScoreBoard {

	constructor() {
     this.reset();
  }
  
  get winner() {
  
  	if(this.playerOneScore >= GAME_SETTINGS.winScore) {
    
    	return PlayerIndex.playerOne;
    
    }
    else if(this.playerTwoScore >= GAME_SETTINGS.winScore) {
    
    	return PlayerIndex.playerTwo;
    
    }
    
    return 0;
  
  }
    
  draw(canvas) {
  
    var ctx = canvas.getContext('2d');
    ctx.font = GAME_SETTINGS.smallFont;
    ctx.fillStyle = GAME_SETTINGS.scoreTextColor;
    
    ctx.fillText("Red Player | " + this.playerOneScore, 8, 20);
		ctx.fillText(this.playerTwoScore + " | Blue Player", canvas.width - 115, 20);
    
    ctx.fillText("Round: " + this.round, canvas.width / 2 - 50, 20);
        
    if(this.winner) {
    
    	let winnerName = this.winner == PlayerIndex.playerOne ? "Red Player" : "Blue Player";
      
      ctx.font = GAME_SETTINGS.largeFont;
      ctx.fillStyle = "#eee";
      ctx.fillText(winnerName + " wins!", canvas.width / 2 - 75, 60);      
    
    }
  
  }
  
  reset() {
    this.playerOneScore = 0;
    this.playerTwoScore = 0;
    this.round = 0;
  }

}

class Rectangle {

	constructor(x, y, width, height) {
  	this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  
  overlaps(other) {
  
    return other.left < this.right &&
      this.left < other.right &&
      other.top < this.bottom &&
      this.top < other.bottom;
  
  }
  
  contains(x, y) {
  
  	return this.left < x && this.right > x
    		&& this.top < y && this.bottom > y;
  
  }

}

let game = new TennisGame(CANVAS);

function startGame() {
	document.getElementById('btn-start').style.display = "none";
  document.getElementById('btn-toggle-sound').style.display = "inline-block";
	game.run();
}

function toggleSound() {
	isMuted = !isMuted;
	document.getElementById('btn-toggle-sound').innerHTML = isMuted 
  	? "Sound On" 
    : "Sound Off";
}
document.getElementById('btn-start').addEventListener('click', function() {
  // Burada oyunu başlatmak için gerekli kodlar yer alacak
  event.preventDefault();
  startGame();
});
document.getElementById('btn-toggle-sound').addEventListener('click', function() {
  // Burada oyunu başlatmak için gerekli kodlar yer alacak
  event.preventDefault();

  toggleSound();
});
}
