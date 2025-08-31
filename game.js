class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startScreen = document.getElementById('startScreen');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.quitConfirm = document.getElementById('quitConfirm');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.scoreElement = document.querySelector('.score');
        this.gameOverScoreElement = document.querySelector('.game-over-score');
        this.pauseBtn = document.querySelector('.pause-btn');
        
        // Game constants
        this.gridSize = 20;
        this.resizeCanvas();
        this.gridWidth = this.canvasWidth / this.gridSize;
        this.gridHeight = this.canvasHeight / this.gridSize;
        
        // Game state
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        
        // Snake properties
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 0, y: 0};
        
        // Food properties
        this.food = this.generateFood();
        
        // Game loop
        this.lastTime = 0;
        this.gameSpeed = 250; // milliseconds between moves (slower)
        
        this.init();
    }
    
    resizeCanvas() {
        // Calculate canvas size to fill most of the viewport
        const maxWidth = Math.min(window.innerWidth - 120, 800);
        const maxHeight = Math.min(window.innerHeight - 160, 600);
        
        // Set canvas size
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.canvasWidth = maxWidth;
        this.canvasHeight = maxHeight;
        
        // Update grid dimensions
        this.gridWidth = this.canvasWidth / this.gridSize;
        this.gridHeight = this.canvasHeight / this.gridSize;
    }
    
    init() {
        this.bindEvents();
        this.showStartScreen();
        this.gameLoop();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) {
                // Handle game over state - any movement key restarts
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
                    this.restartGame();
                    return;
                }
                return;
            }
            
            if (!this.gameStarted) {
                this.startGame();
                return;
            }
            
            if (e.key === 'Escape') {
                this.togglePause();
                return;
            }
            
            if (this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y !== 1) {
                        this.nextDirection = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y !== -1) {
                        this.nextDirection = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x !== 1) {
                        this.nextDirection = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x !== -1) {
                        this.nextDirection = {x: 1, y: 0};
                    }
                    break;
            }
        });
        
        // Pause button click
        this.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
        
        // Menu options
        document.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
            });
        });
        
        // Close button
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.hidePauseMenu();
        });
        
        // Quit confirmation buttons
        document.getElementById('yesQuit').addEventListener('click', () => {
            this.quitGame();
        });
        
        document.getElementById('noQuit').addEventListener('click', () => {
            this.hideQuitConfirm();
        });
        
        // Menu navigation
        document.addEventListener('keydown', (e) => {
            if (!this.pauseMenu.classList.contains('hidden')) {
                this.handleMenuNavigation(e);
            }
        });
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.pauseMenu.classList.add('hidden');
        this.quitConfirm.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
    
    startGame() {
        this.gameStarted = true;
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.updateScore();
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
    }
    
    showGameOverScreen() {
        this.gameOverScreen.style.display = 'block';
        this.gameOverScoreElement.textContent = `Your Score: ${this.score.toString().padStart(4, '0')}`;
    }
    
    restartGame() {
        this.gameOver = false;
        this.gameStarted = false;
        this.showStartScreen();
    }
    
    togglePause() {
        if (!this.gameStarted || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
        }
    }
    
    showPauseMenu() {
        this.pauseMenu.classList.remove('hidden');
        this.selectMenuOption(0);
    }
    
    hidePauseMenu() {
        this.pauseMenu.classList.add('hidden');
        this.gamePaused = false;
    }
    
    showQuitConfirm() {
        this.quitConfirm.classList.remove('hidden');
        this.pauseMenu.classList.add('hidden');
    }
    
    hideQuitConfirm() {
        this.quitConfirm.classList.add('hidden');
        this.showPauseMenu();
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'continue':
                this.hidePauseMenu();
                break;
            case 'newgame':
                this.hidePauseMenu();
                this.startGame();
                break;
            case 'quit':
                this.showQuitConfirm();
                break;
        }
    }
    
    handleMenuNavigation(e) {
        const options = document.querySelectorAll('.menu-option');
        const selectedIndex = Array.from(options).findIndex(opt => opt.classList.contains('selected'));
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.selectMenuOption(Math.max(0, selectedIndex - 1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.selectMenuOption(Math.min(options.length - 1, selectedIndex + 1));
                break;
            case 'Enter':
                e.preventDefault();
                const selectedOption = options[selectedIndex];
                this.handleMenuAction(selectedOption.dataset.action);
                break;
        }
    }
    
    selectMenuOption(index) {
        document.querySelectorAll('.menu-option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
    }
    
    quitGame() {
        window.close();
        // Fallback for browsers that don't support window.close()
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: white;">Game closed. Refresh to play again.</div>';
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score.toString().padStart(4, '0');
    }
    
    update() {
        if (!this.gameStarted || this.gamePaused || this.gameOver) return;
        
        // Update direction
        this.direction = {...this.nextDirection};
        
        // Move snake
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Wrap around screen boundaries
        if (head.x < 0) head.x = this.gridWidth - 1;
        if (head.x >= this.gridWidth) head.x = 0;
        if (head.y < 0) head.y = this.gridHeight - 1;
        if (head.y >= this.gridHeight) head.y = 0;
        
        // Check collision with self (excluding the current head)
        if (this.snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            this.showGameOverScreen();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 4;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            // Remove tail if no food was eaten
            this.snake.pop();
        }
    }
    
    drawGrid() {
        // Set grid line style - much more subtle
        this.ctx.strokeStyle = 'rgba(74, 74, 74, 0.15)';
        this.ctx.lineWidth = 0.5;
        
        // Draw vertical grid lines
        for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (!this.gameStarted || this.gameOver) return;
        
        // Draw grid
        this.drawGrid();
        
        // Draw snake
        this.ctx.fillStyle = '#4A4A4A';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Draw head with rounded corners
                this.ctx.fillStyle = '#2A2A2A';
            } else {
                this.ctx.fillStyle = '#4A4A4A';
            }
            
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Rounded head
                this.ctx.beginPath();
                this.ctx.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 4);
                this.ctx.fill();
            } else {
                // Square body segments
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
        
        // Draw food
        this.ctx.fillStyle = '#4A4A4A';
        const foodX = this.food.x * this.gridSize;
        const foodY = this.food.y * this.gridSize;
        
        // Draw star-shaped food
        this.ctx.beginPath();
        const centerX = foodX + this.gridSize / 2;
        const centerY = foodY + this.gridSize / 2;
        const radius = this.gridSize / 3;
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.gameSpeed) {
            this.update();
            this.lastTime = currentTime;
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
