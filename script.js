const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.6;
let velocity = 0;
let jumpPower = -11;

let gameStarted = false;
let gameOver = false;

let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
document.getElementById("highScore").innerText = "High Score: " + highScore;

let bird = {
  x: 150,
  y: canvas.height / 2,
  radius: 20
};

let pipes = [];
let pipeWidth = 80;
let pipeGap = 200;
let pipeSpeed = 4;

let clouds = [];

function createCloud() {
  clouds.push({
    x: canvas.width,
    y: Math.random() * canvas.height / 2,
    size: 40 + Math.random() * 40,
    speed: 1 + Math.random()
  });
}

function createPipe() {
  let topHeight = Math.random() * (canvas.height - pipeGap - 200) + 100;
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    passed: false
  });
}

function resetGame() {
  velocity = 0;
  bird.y = canvas.height / 2;
  pipes = [];
  score = 0;
  gameOver = false;
  document.getElementById("score").innerText = "Score: 0";
}

function drawBird() {
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

function drawCloud(cloud) {
  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
  ctx.arc(cloud.x + cloud.size * 0.6, cloud.y + 10, cloud.size * 0.5, 0, Math.PI * 2);
  ctx.arc(cloud.x - cloud.size * 0.6, cloud.y + 10, cloud.size * 0.5, 0, Math.PI * 2);
  ctx.arc(cloud.x, cloud.y + 20, cloud.size * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height);
  });
}

function update() {
  if (!gameStarted || gameOver) return;

  velocity += gravity;
  bird.y += velocity;

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
      document.getElementById("score").innerText = "Score: " + score;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
        document.getElementById("highScore").innerText = "High Score: " + highScore;
      }
    }

    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipeWidth &&
      (bird.y - bird.radius < pipe.topHeight ||
       bird.y + bird.radius > pipe.bottomY)
    ) {
      endGame();
    }
  });

  if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
    endGame();
  }

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
  clouds = clouds.filter(cloud => cloud.x - 100 < canvas.width);
}

function endGame() {
  gameOver = true;
  document.getElementById("message").innerText = "Game Over! Click to Restart";
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;
    drawCloud(cloud);
  });

  update();
  drawPipes();
  drawBird();

  requestAnimationFrame(animate);
}

setInterval(createPipe, 1800);
setInterval(createCloud, 2500);

document.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    document.getElementById("message").innerText = "";
  }

  if (gameOver) {
    resetGame();
    document.getElementById("message").innerText = "";
  }

  velocity = jumpPower;
});

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    velocity = jumpPower;
  }
});

animate();
