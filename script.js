const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 32;
const PLAYER_SIZE = 32;
const ENEMY_SIZE = 32;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;

const playerImage = new Image();
const enemyImage = new Image();
const tileImage = new Image();
const swordImage = new Image();
const healthImage = new Image();

playerImage.src = 'assets/player.png';
enemyImage.src = 'assets/enemy.png';
tileImage.src = 'assets/tile.png';
swordImage.src = 'assets/sword.png';
healthImage.src = 'assets/health.png';

const player = {
    x: canvas.width / 2 - PLAYER_SIZE / 2,
    y: canvas.height / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: 100,
    score: 0,
    level: 1
};

const enemies = [];
const tiles = [];
const sword = {
    x: -50,
    y: -50,
    width: 20,
    height: 20,
    active: false
};

function spawnEnemies() {
    enemies.length = 0; // Clear previous enemies
    for (let i = 0; i < 5 + player.level; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - ENEMY_SIZE),
            y: Math.random() * (canvas.height - ENEMY_SIZE),
            width: ENEMY_SIZE,
            height: ENEMY_SIZE
        });
    }
}

function createTiles() {
    tiles.length = 0; // Clear previous tiles
    for (let x = 0; x < canvas.width; x += TILE_SIZE) {
        for (let y = 0; y < canvas.height; y += TILE_SIZE) {
            tiles.push({ x, y });
        }
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function drawTiles() {
    for (const tile of tiles) {
        ctx.drawImage(tileImage, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
    }
}

function drawSword() {
    if (sword.active) {
        ctx.drawImage(swordImage, sword.x, sword.y, sword.width, sword.height);
    }
}

function drawUI() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText(`Health: ${player.health}`, 10, 30);
    ctx.fillText(`Score: ${player.score}`, 10, 50);
    ctx.fillText(`Level: ${player.level}`, 10, 70);
}

function updatePlayer() {
    if (keys['ArrowLeft'] || touchControls.moveLeft) player.x -= MOVE_SPEED;
    if (keys['ArrowRight'] || touchControls.moveRight) player.x += MOVE_SPEED;
    if (keys['ArrowUp'] || touchControls.moveUp) player.y -= MOVE_SPEED;
    if (keys['ArrowDown'] || touchControls.moveDown) player.y += MOVE_SPEED;
    
    if (keys[' '] || touchControls.attack) {
        sword.x = player.x + PLAYER_SIZE / 2 - sword.width / 2;
        sword.y = player.y + PLAYER_SIZE / 2 - sword.height / 2;
        sword.active = true;
        setTimeout(() => sword.active = false, 200);
    }
}

function updateEnemies() {
    for (const enemy of enemies) {
        if (player.x < enemy.x) enemy.x -= ENEMY_SPEED;
        if (player.x > enemy.x) enemy.x += ENEMY_SPEED;
        if (player.y < enemy.y) enemy.y -= ENEMY_SPEED;
        if (player.y > enemy.y) enemy.y += ENEMY_SPEED;
    }
}

function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        if (sword.active &&
            sword.x < enemy.x + enemy.width &&
            sword.x + sword.width > enemy.x &&
            sword.y < enemy.y + enemy.height &&
            sword.y + sword.height > enemy.y) {
            enemies.splice(enemyIndex, 1);
            player.score += 10;
            if (enemies.length === 0) {
                player.level += 1;
                spawnEnemies();
            }
        }
        
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            player.health -= 10;
            if (player.health <= 0) {
                player.health = 0;
                gameOver = true;
            }
        }
    });
}

function gameLoop() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateEnemies();
    checkCollisions();

    drawTiles();
    drawPlayer();
    drawEnemies();
    drawSword();
    drawUI();

    requestAnimationFrame(gameLoop);
}

const keys = {};
let gameOver = false;
const touchControls = {
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    attack: false
};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.getElementById('moveLeft').addEventListener('touchstart', () => touchControls.moveLeft = true);
document.getElementById('moveLeft').addEventListener('touchend', () => touchControls.moveLeft = false);
document.getElementById('moveRight').addEventListener('touchstart', () => touchControls.moveRight = true);
document.getElementById('moveRight').addEventListener('touchend', () => touchControls.moveRight = false);
document.getElementById('moveUp').addEventListener('touchstart', () => touchControls.moveUp = true);
document.getElementById('moveUp').addEventListener('touchend', () => touchControls.moveUp = false);
document.getElementById('moveDown').addEventListener('touchstart', () => touchControls.moveDown = true);
document.getElementById('moveDown').addEventListener('touchend', () => touchControls.moveDown = false);
document.getElementById('attack').addEventListener('touchstart', () => touchControls.attack = true);
document.getElementById('attack').addEventListener('touchend', () => touchControls.attack = false);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createTiles(); // Recreate tiles on resize
});

spawnEnemies();
createTiles();
gameLoop();
