let spriteSheet1;
let frameWidth1 = 81.4;
let frameHeight1 = 78;
let totalFrames1 = 9;

let currentFrame = 0;
let frameCounter = 0;
let frameDelay = 8; // 控制動畫速度
let scale = 2.5; // 放大倍數
let isLoaded = false; // 確認圖片是否加載完成
let loadedCount = 0;

// 角色/圖鑑位置與速度
let leftX = 0; // 左邊的角色 (可移動)
let leftY = 0;
let rightX = 0; // 右邊的角色 (靜止)
let rightY = 0;
let speed = 6;
let image1Loaded = false;
// 粒子系統（火花）
let particles = [];
let gravity = 0.15;
let maxParticles = 500;

function preload() {
  spriteSheet1 = loadImage('1/all_1.png', function() {
    image1Loaded = true;
    loadedCount++;
    if (loadedCount === 1) isLoaded = true;
  }, function(err) {
    console.error('無法載入 1/all_1.png', err);
    image1Loaded = false;
    loadedCount++;
    if (loadedCount === 1) isLoaded = true;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始位置：將角色置中
  let spacing = 50;
  let scaledWidth1 = frameWidth1 * scale;
  let scaledHeight1 = frameHeight1 * scale;
  let totalWidth = scaledWidth1; // 只計入左側角色
  let maxH = scaledHeight1;
  leftX = (windowWidth - totalWidth) / 2;
  leftY = (windowHeight - maxH) / 2;
}

function draw() {
  // 墨綠色背景
  background(34, 70, 60);
  
  // 只有在圖片加載完成後才播放動畫
  if (!isLoaded) {
    // 如果已經嘗試載入過兩張圖片，但有至少一張失敗，改用方塊佔位並允許移動
    if (loadedCount === 1 && !image1Loaded) {
      // 使用與正式圖相同的縮放與位置邏輯，讓你能看到移動行為（單張佔位）
      let spacing = 50;
      let scaledWidth1 = frameWidth1 * scale;
      let scaledHeight1 = frameHeight1 * scale;
      let totalWidth = scaledWidth1;
      let maxGroupHeight = scaledHeight1;

      // 鍵盤控制 - 僅控制左邊角色
      if (keyIsDown(LEFT_ARROW)) leftX -= speed;
      if (keyIsDown(RIGHT_ARROW)) leftX += speed;
      if (keyIsDown(UP_ARROW)) leftY -= speed;
      if (keyIsDown(DOWN_ARROW)) leftY += speed;
      leftX = constrain(leftX, 0, windowWidth - totalWidth);
      leftY = constrain(leftY, 0, windowHeight - maxGroupHeight);

      // 如果按上鍵，從左邊角色底部噴出火花（佔位模式也可見）
      if (keyIsDown(UP_ARROW)) {
        let emitterX = leftX + scaledWidth1 / 2;
        let emitterY = leftY + scaledHeight1;
        let count = floor(random(2, 5));
        for (let i = 0; i < count; i++) spawnParticle(emitterX, emitterY);
      }

      // 繪製佔位方塊
      noStroke();
      fill(200, 80, 80);
      let destX1 = leftX;
      let destY1 = leftY;
      rect(destX1, destY1, scaledWidth1, scaledHeight1);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(12);
      text('missing', destX1 + scaledWidth1 / 2, destY1 + scaledHeight1 / 2);

      // 更新與繪製粒子（佔位模式）
      updateParticles();
      return;
    }

    // 還在載入中
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(255);
    text('載入中...', width / 2, height / 2);
    return;
  }
  
  // 計算動畫幀
  frameCounter++;
  if (frameCounter >= frameDelay) {
    frameCounter = 0;
    currentFrame = (currentFrame + 1) % totalFrames1;
  }
  
  // 計算動畫之間的間距和群組大小（只剩左側角色）
  let spacing = 50;
  let scaledWidth1 = frameWidth1 * scale;
  let scaledHeight1 = frameHeight1 * scale;
  let totalWidth = scaledWidth1;
  let maxGroupHeight = scaledHeight1;
  // 只讓左邊角色受鍵盤控制
  if (keyIsDown(LEFT_ARROW)) {
    leftX -= speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    leftX += speed;
  }
  if (keyIsDown(UP_ARROW)) {
    leftY -= speed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    leftY += speed;
  }
  // 邊界限制（針對左邊角色）
  leftX = constrain(leftX, 0, windowWidth - totalWidth);
  leftY = constrain(leftY, 0, windowHeight - maxGroupHeight);

  // 如果按上鍵，從左邊角色底部噴出火花
  if (keyIsDown(UP_ARROW)) {
    let emitterX = leftX + scaledWidth1 / 2;
    let emitterY = leftY + scaledHeight1;
    let count = floor(random(2, 5));
    for (let i = 0; i < count; i++) spawnParticle(emitterX, emitterY);
  }
  
  // 繪製第一個動畫（依 posX, posY）
  let srcX1 = currentFrame * frameWidth1;
  let destX1 = leftX;
  let destY1 = leftY;
  image(spriteSheet1, destX1, destY1, scaledWidth1, scaledHeight1, srcX1, 0, frameWidth1, frameHeight1);

  // 更新與繪製粒子（在角色繪製後，讓火花蓋在上面）
  updateParticles();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 產生單一火花粒子
function spawnParticle(x, y) {
  if (particles.length > maxParticles) return;
  let angle = random(-PI / 2 - 0.6, -PI / 2 + 0.6); // 往上的錐形
  let speedInit = random(1, 4);
  let vx = cos(angle) * speedInit + random(-0.5, 0.5);
  let vy = sin(angle) * speedInit + random(-0.5, 0.5);
  let life = floor(random(20, 40));
  let size = random(3, 6);
  // 色彩偏向橘黃
  let r = floor(random(220, 255));
  let g = floor(random(140, 200));
  let b = floor(random(40, 80));
  particles.push({x, y, vx, vy, life, size, r, g, b});
}

// 更新並繪製粒子
function updateParticles() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.vy += gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    let alpha = map(p.life, 0, 40, 0, 255);
    fill(p.r, p.g, p.b, alpha);
    ellipse(p.x, p.y, p.size);
    if (p.life <= 0) particles.splice(i, 1);
  }
}
