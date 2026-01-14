// Aim Trainer Game in JavaScript (HTML Canvas version)
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 600;
const TARGET_INCREMENT = 400;
const TARGET_PADDING = 30;
const TOP_BAR_HEIGHT = 50;
const BG_COLOR = "#001d24";
const LIVES = 3;

let targets = [];
let targetsPressed = 0;
let clicks = 0;
let misses = 0;
let startTime = Date.now();
let running = true;

function formatTime(ms) {
  const secs = ms / 1000;
  const milli = Math.floor((secs * 1000) % 1000 / 100);
  const seconds = Math.floor(secs % 60);
  const minutes = Math.floor(secs / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milli}`;
}

class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.grow = true;
    this.MAX_SIZE = 30;
    this.GROWTH_RATE = 0.2;
  }

  update() {
    if (this.size + this.GROWTH_RATE >= this.MAX_SIZE) {
      this.grow = false;
    }
    if (this.grow) {
      this.size += this.GROWTH_RATE;
    } else {
      this.size -= this.GROWTH_RATE;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.size * 0.8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.size * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.size * 0.4, 0, 2 * Math.PI);
    ctx.fill();
  }

  collide(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.size;
  }
}

function drawTopBar() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, WIDTH, TOP_BAR_HEIGHT);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  const elapsed = Date.now() - startTime;
  const speed = targetsPressed / (elapsed / 1000);
  ctx.fillText("Time: " + formatTime(elapsed), 10, 30);
  ctx.fillText("Speed: " + speed.toFixed(1) + " t/s", 200, 30);
  ctx.fillText("Hits: " + targetsPressed, 450, 30);
  ctx.fillText("Lives: " + (LIVES - misses), 650, 30);
}

function draw() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawTopBar();
  targets.forEach(t => t.draw(ctx));
}

function update() {
  targets.forEach(t => t.update());
  for (let i = targets.length - 1; i >= 0; i--) {
    if (targets[i].size <= 0) {
      targets.splice(i, 1);
      misses++;
      if (misses >= LIVES) {
        endScreen();
      }
    }
  }
}

function endScreen() {
  running = false;
  const elapsed = (Date.now() - startTime) / 1000;
  const accuracy = (targetsPressed / clicks) * 100 || 0;
  alert(`Game Over!\nTime: ${formatTime(elapsed * 1000)}\nSpeed: ${(targetsPressed / elapsed).toFixed(1)} t/s\nHits: ${targetsPressed}\nAccuracy: ${accuracy.toFixed(1)}%`);
  location.reload();
}

canvas.addEventListener("mousedown", (e) => {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  clicks++;
  for (let i = 0; i < targets.length; i++) {
    if (targets[i].collide(mx, my)) {
      targets.splice(i, 1);
      targetsPressed++;
      return;
    }
  }
});

function spawnTarget() {
  if (!running) return;
  const x = Math.random() * (WIDTH - 2 * TARGET_PADDING) + TARGET_PADDING;
  const y = Math.random() * (HEIGHT - TARGET_PADDING - TOP_BAR_HEIGHT) + TOP_BAR_HEIGHT;
  targets.push(new Target(x, y));
}

setInterval(spawnTarget, TARGET_INCREMENT);

function gameLoop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
