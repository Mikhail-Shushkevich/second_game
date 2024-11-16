
    document.addEventListener("DOMContentLoaded", function () {
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Устанавливаем размеры холста
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7;

        // Настройки героя
        const heroImage = new Image();
        heroImage.src = "https://i.imgur.com/iMSuV7S.png";
        let heroX = 20;
        let heroY = canvas.height - 80;
        const heroWidth = 40;
        const heroHeight = 60;
        let heroVelocityY = 0;
        let isJumping = false;

        // Настройки дороги
        const roadSegments = [];
        const roadHeight = 20;

        // Настройки врагов
        const enemies = [];
        const enemyImage = new Image();
        enemyImage.src = "https://i.imgur.com/88vYM0R.png";

        // Настройки для пуль
        const bullets = [];

        // Конец уровня
        const levelEndX = 2000;

        function createRoadSegments() {
            roadSegments.push({ x: 0, y: canvas.height - roadHeight, width: levelEndX });
            roadSegments.push({ x: 150, y: canvas.height - 150, width: 300 });
            roadSegments.push({ x: 500, y: canvas.height - 250, width: 250 });
            roadSegments.push({ x: 800, y: canvas.height - 200, width: 200 });
            roadSegments.push({ x: 1100, y: canvas.height - 100, width: 350 });
            roadSegments.push({ x: 1450, y: canvas.height - 150, width: 250 });
            roadSegments.push({ x: 1700, y: canvas.height - 250, width: 300 });
            roadSegments.push({ x: 2100, y: canvas.height - 100, width: 400 });

            roadSegments.forEach(segment => {
                enemies.push({
                    x: segment.x + segment.width / 2 - 20,
                    y: segment.y - 40,
                    width: 40,
                    height: 40
                });
            });
        }

        function drawRoad() {
            ctx.fillStyle = "darkgreen";
            roadSegments.forEach(segment => {
                ctx.fillRect(segment.x - cameraX, segment.y, segment.width, roadHeight);
            });

            ctx.fillStyle = "red";
            ctx.fillRect(levelEndX - cameraX, canvas.height - roadHeight - 30, 20, 30);
        }

        function drawEnemies() {
            enemies.forEach(enemy => {
                ctx.drawImage(enemyImage, enemy.x - cameraX, enemy.y, enemy.width, enemy.height);
            });
        }

        let moveLeft = false;
        let moveRight = false;

        let cameraX = 0;

        function drawHero() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawRoad();
            drawEnemies();
            drawBullets();
            ctx.drawImage(heroImage, heroX - cameraX, heroY, heroWidth, heroHeight);
        }

        function drawBullets() {
            ctx.fillStyle = "black";
            bullets.forEach(bullet => {
                ctx.fillRect(bullet.x - cameraX, bullet.y, bullet.width, bullet.height);
            });
        }

        function updateHeroPosition() {
            if (moveLeft) {
                heroX -= 5;
            }
            if (moveRight) {
                heroX += 5;
            }

            if (heroX > levelEndX) {
                heroX = levelEndX;
            }

            cameraX = heroX - canvas.width / 2 + heroWidth / 2;
            cameraX = Math.max(0, cameraX);

            if (isJumping) {
                heroVelocityY += 0.5;
                heroY += heroVelocityY;

                let onPlatform = false;
                for (const segment of roadSegments) {
                    if (
                        heroX + heroWidth > segment.x &&
                        heroX < segment.x + segment.width &&
                        heroY + heroHeight >= segment.y &&
                        heroY + heroHeight <= segment.y + 5
                    ) {
                        heroY = segment.y - heroHeight;
                        heroVelocityY = 0;
                        isJumping = false;
                        onPlatform = true;
                        break;
                    }
                }

                if (!onPlatform && heroY >= canvas.height - heroHeight) {
                    heroY = canvas.height - heroHeight;
                    heroVelocityY = 0;
                    isJumping = false;
                }
            } else {
                let onGround = false;
                for (const segment of roadSegments) {
                    if (
                        heroX + heroWidth > segment.x &&
                        heroX < segment.x + segment.width &&
                        heroY + heroHeight >= segment.y
                    ) {
                        heroY = segment.y - heroHeight;
                        heroVelocityY = 0;
                        onGround = true;
                        break;
                    }
                }

                if (!onGround) {
                    heroY += heroVelocityY;
                }
            }
        }

        function updateBullets() {
            const bulletsToRemove = new Set();
            const enemiesToRemove = new Set();

            bullets.forEach((bullet, bulletIndex) => {
                bullet.x += bullet.speed;
                if (bullet.x > canvas.width + cameraX) {
                    bulletsToRemove.add(bulletIndex);
                }

                enemies.forEach((enemy, enemyIndex) => {
                    if (
                        bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.

                        y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                ) {
                        enemiesToRemove.add(enemyIndex); // Отмечаем врага для удаления
                        bulletsToRemove.add(bulletIndex); // Отмечаем пулю для удаления
                    }
                });
            });

            // Удаляем отмеченные пули и врагов
            [...bulletsToRemove].reverse().forEach(index => bullets.splice(index, 1));
            [...enemiesToRemove].reverse().forEach(index => enemies.splice(index, 1));
        }

        function gameLoop() {
            updateHeroPosition();
            updateBullets();
            drawHero();
            requestAnimationFrame(gameLoop);
        }

        document.getElementById("leftButton").addEventListener("touchstart", () => (moveLeft = true));
        document.getElementById("leftButton").addEventListener("touchend", () => (moveLeft = false));
        document.getElementById("rightButton").addEventListener("touchstart", () => (moveRight = true));
        document.getElementById("rightButton").addEventListener("touchend", () => (moveRight = false));

        document.getElementById("jumpButton").addEventListener("touchstart", () => {
            if (!isJumping) {
                heroVelocityY = -12;
                isJumping = true;
            }
        });

        document.getElementById("fireButton").addEventListener("touchstart", () => {
            bullets.push({
                x: heroX + heroWidth / 2,
                y: heroY + heroHeight / 2,
                width: 10,
                height: 10,
                speed: 5
            });
        });

        createRoadSegments();
        heroImage.onload = function () {
            gameLoop();
        };
    });
