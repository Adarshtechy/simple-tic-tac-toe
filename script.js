// Game state variables
        let playerTurn = "x";
        let moves = 0;
        let isGameOver = false;
        let gameMode = "pvp"; // 'pvp' or 'ai'
        let scores = { x: 0, o: 0 };
        let gameHistory = [];
        let aiDifficulty = "medium";
        
        // DOM elements
        const boxes = document.querySelectorAll(".box span");
        const turnIndicator = document.getElementById("turn-indicator");
        const scoreX = document.getElementById("score-x");
        const scoreO = document.getElementById("score-o");
        const historyList = document.getElementById("history-list");
        const modeButtons = document.querySelectorAll(".mode-btn");
        const difficultySelect = document.getElementById("ai-difficulty");
        const thinkingIndicator = document.getElementById("thinking");
        const particlesContainer = document.getElementById("particles");
        const winLineContainer = document.getElementById("win-line");

        // Create background particles
        function createParticles() {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement("div");
                particle.classList.add("particle");
                
                const size = Math.random() * 20 + 5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                particle.style.left = `${Math.random() * 100}vw`;
                particle.style.top = `${Math.random() * 100}vh`;
                
                const duration = Math.random() * 20 + 10;
                particle.style.animationDuration = `${duration}s`;
                
                particlesContainer.appendChild(particle);
            }
        }

        // Initialize the game
        function initGame() {
            createParticles();
            resetGame();
            updateTurnIndicator();
            updateScores();
            addToHistory("Game started");
            
            // Set up event listeners
            difficultySelect.addEventListener("change", function() {
                aiDifficulty = this.value;
                addToHistory(`AI difficulty set to ${this.value}`);
            });
        }

        // Play a move
        function play(element) {
            if (element.dataset.player !== "none" || isGameOver) return;
            
            // Set the move
            element.innerHTML = playerTurn;
            element.dataset.player = playerTurn;
            
            // Add class for styling
            if (playerTurn === "x") {
                element.classList.add("x-move");
            } else {
                element.classList.add("o-move");
            }
            
            moves++;
            
            // Check for win or draw
            const winInfo = checkWinner();
            if (winInfo.win) {
                drawWinningLine(winInfo.line);
                gameOver(winInfo.box);
                return;
            }
            
            if (moves === 9 && !isGameOver) {
                draw();
                return;
            }
            
            // Switch player if game is not over
            if (!isGameOver) {
                playerTurn = playerTurn === "x" ? "o" : "x";
                updateTurnIndicator();
                
                // If playing against AI and it's AI's turn
                if (gameMode === "ai" && playerTurn === "o") {
                    thinkingIndicator.style.display = "block";
                    setTimeout(makeAIMove, 800);
                }
            }
        }

        // Check for a winner
        function checkWinner() {
            const winConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]             // Diagonals
            ];
            
            for (let condition of winConditions) {
                const [a, b, c] = condition;
                if (
                    boxes[a].dataset.player !== "none" &&
                    boxes[a].dataset.player === boxes[b].dataset.player &&
                    boxes[a].dataset.player === boxes[c].dataset.player
                ) {
                    // Highlight winning boxes
                    boxes[a].parentElement.classList.add("activeBox");
                    boxes[b].parentElement.classList.add("activeBox");
                    boxes[c].parentElement.classList.add("activeBox");
                    
                    return { win: true, box: a, line: condition };
                }
            }
            
            return { win: false };
        }

        // Draw winning line
        function drawWinningLine(line) {
            const [a, b, c] = line;
            const boxSize = 100;
            const gap = 15;
            const container = document.getElementById("container");
            const rect = container.getBoundingClientRect();
            
            // Get positions of the first and last boxes in the winning line
            const firstBox = boxes[a].parentElement;
            const lastBox = boxes[c].parentElement;
            
            const firstRect = firstBox.getBoundingClientRect();
            const lastRect = lastBox.getBoundingClientRect();
            
            // Calculate line coordinates
            const startX = firstRect.left - rect.left + firstRect.width / 2;
            const startY = firstRect.top - rect.top + firstRect.height / 2;
            const endX = lastRect.left - rect.left + lastRect.width / 2;
            const endY = lastRect.top - rect.top + lastRect.height / 2;
            
            // Calculate line length and angle
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
            
            // Create and position the line
            const winLine = document.createElement("div");
            winLine.classList.add("win-line");
            winLine.style.width = `${length}px`;
            winLine.style.height = `8px`;
            winLine.style.left = `${startX}px`;
            winLine.style.top = `${startY}px`;
            winLine.style.transform = `rotate(${angle}deg)`;
            winLine.style.transformOrigin = `0 0`;
            
            winLineContainer.appendChild(winLine);
        }

        // Game over function
        function gameOver(winningBox) {
            isGameOver = true;
            const winner = boxes[winningBox].dataset.player.toUpperCase();
            
            // Update scores
            scores[winner.toLowerCase()]++;
            updateScores();
            
            // Show alert
            showAlert(`Player ${winner} Wins!`, `${winner} takes the victory!`);
            
            // Add to history
            addToHistory(`Player ${winner} won`);
            
            // If playing against AI, update message accordingly
            if (gameMode === "ai") {
                if (winner === "X") {
                    addToHistory("You defeated the AI!");
                } else {
                    addToHistory("AI won the game");
                }
            }
        }

        // Draw function
        function draw() {
            isGameOver = true;
            showAlert("It's a Draw!", "No one wins this round.");
            addToHistory("Game ended in a draw");
        }

        // Reset the game
        function resetGame() {
            boxes.forEach(box => {
                box.dataset.player = "none";
                box.innerHTML = "&nbsp;";
                box.classList.remove("x-move", "o-move");
                box.parentElement.classList.remove("activeBox", "pulse");
            });
            
            // Clear winning line
            winLineContainer.innerHTML = "";
            
            playerTurn = "x";
            moves = 0;
            isGameOver = false;
            updateTurnIndicator();
            thinkingIndicator.style.display = "none";
        }

        // Play again
        function playAgain() {
            resetGame();
            addToHistory("New game started");
            
            // Remove alert if exists
            const alert = document.querySelector(".alert");
            const overlay = document.querySelector(".overlay");
            
            if (alert) {
                alert.remove();
                overlay.remove();
            }
        }

        // Update turn indicator
        function updateTurnIndicator() {
            const indicator = document.querySelector(".player-indicator");
            indicator.className = "player-indicator";
            
            if (playerTurn === "x") {
                turnIndicator.textContent = gameMode === "ai" ? "Your Turn" : "Player X's Turn";
                indicator.classList.add("player-x-indicator");
            } else {
                turnIndicator.textContent = gameMode === "ai" ? "AI's Turn" : "Player O's Turn";
                indicator.classList.add("player-o-indicator");
            }
        }

        // Update scores
        function updateScores() {
            scoreX.textContent = scores.x;
            scoreO.textContent = scores.o;
        }

        // Show alert
        function showAlert(title, message) {
            // Create overlay
            const overlay = document.createElement("div");
            overlay.className = "overlay";
            document.body.appendChild(overlay);
            
            // Create alert
            const alert = document.createElement("div");
            alert.className = "alert";
            alert.innerHTML = `
                <h2>${title}</h2>
                <p>${message}</p>
                <button onclick="playAgain()">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            `;
            document.body.appendChild(alert);
        }

        // Set game mode
        function setGameMode(mode) {
            gameMode = mode;
            
            // Update mode buttons
            modeButtons.forEach(btn => {
                if (btn.onclick.toString().includes(mode)) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
            
            // Reset the game
            playAgain();
            
            // Add to history
            if (mode === "ai") {
                addToHistory("Mode: Player vs AI");
            } else {
                addToHistory("Mode: Player vs Player");
            }
        }

        // Make AI move using minimax algorithm for hard difficulty
        function makeAIMove() {
            if (isGameOver) return;
            
            thinkingIndicator.style.display = "none";
            
            let moveIndex;
            
            if (aiDifficulty === "easy") {
                // Easy: Random moves
                moveIndex = getRandomMove();
            } else if (aiDifficulty === "medium") {
                // Medium: 50% chance of best move, 50% chance of random move
                moveIndex = Math.random() > 0.5 ? getBestMove() : getRandomMove();
            } else {
                // Hard: Always best move (unbeatable)
                moveIndex = getBestMove();
            }
            
            if (moveIndex !== -1) {
                play(boxes[moveIndex]);
            }
        }

        // Get a random available move
        function getRandomMove() {
            const availableMoves = [];
            boxes.forEach((box, index) => {
                if (box.dataset.player === "none") {
                    availableMoves.push(index);
                }
            });
            
            if (availableMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableMoves.length);
                return availableMoves[randomIndex];
            }
            
            return -1;
        }

        // Get the best move using minimax algorithm
        function getBestMove() {
            // Convert NodeList to array for easier manipulation
            const board = Array.from(boxes).map(box => box.dataset.player);
            
            // AI is always 'o'
            const bestMove = minimax(board, "o").index;
            return bestMove;
        }

        // Minimax algorithm
        function minimax(board, player) {
            // Available moves
            const availableMoves = getEmptyCells(board);
            
            // Check for terminal states
            if (isWinning(board, "x")) {
                return { score: -10 };
            } else if (isWinning(board, "o")) {
                return { score: 10 };
            } else if (availableMoves.length === 0) {
                return { score: 0 };
            }
            
            // Array to collect all moves and scores
            const moves = [];
            
            // Loop through available moves
            for (let i = 0; i < availableMoves.length; i++) {
                const move = {};
                move.index = availableMoves[i];
                
                // Make the move
                board[availableMoves[i]] = player;
                
                // Collect score resulting from recursive minimax call
                if (player === "o") {
                    const result = minimax(board, "x");
                    move.score = result.score;
                } else {
                    const result = minimax(board, "o");
                    move.score = result.score;
                }
                
                // Undo the move
                board[availableMoves[i]] = "none";
                
                // Push the move to moves array
                moves.push(move);
            }
            
            // Choose best move
            let bestMove;
            if (player === "o") {
                // Look for move with highest score
                let bestScore = -Infinity;
                for (let i = 0; i < moves.length; i++) {
                    if (moves[i].score > bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
                }
            } else {
                // Look for move with lowest score
                let bestScore = Infinity;
                for (let i = 0; i < moves.length; i++) {
                    if (moves[i].score < bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
                }
            }
            
            // Return the best move
            return moves[bestMove];
        }

        // Get empty cells
        function getEmptyCells(board) {
            return board
                .map((cell, index) => (cell === "none" ? index : null))
                .filter(cell => cell !== null);
        }

        // Check if a player wins
        function isWinning(board, player) {
            const winConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]             // Diagonals
            ];
            
            return winConditions.some(condition => 
                condition.every(index => board[index] === player)
            );
        }

        // Add to history
        function addToHistory(event) {
            const now = new Date();
            const time = now.toLocaleTimeString();
            gameHistory.unshift({ event, time });
            
            // Update history list (keep only last 5)
            if (gameHistory.length > 5) {
                gameHistory.pop();
            }
            
            // Update UI
            historyList.innerHTML = "";
            gameHistory.forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `${item.event} <span>${item.time}</span>`;
                historyList.appendChild(li);
            });
        }

        // Show settings (placeholder)
        function showSettings() {
            showAlert("Settings", "Additional settings would go here. This is a placeholder for demonstration.");
        }

        // Initialize the game when page loads
        window.onload = initGame;