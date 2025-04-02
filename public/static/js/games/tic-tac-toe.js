document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraw = document.getElementById('score-draw');
    
    // Game variables
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    
    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    // Initialize game
    function initGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        statusMessage.textContent = `X starter`;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        // Check if cell is already filled or game is not active
        if (board[index] !== '' || !gameActive || currentPlayer !== 'X') {
            return;
        }
        
        // Update board and UI
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Check game status
        if (checkGameStatus(false)) { // Pass false to not trigger player switch
            return; // Game ended
        }
        
        // Manually switch to computer's turn
        currentPlayer = 'O';
        statusMessage.textContent = `${currentPlayer}'s tur`;
        
        // Schedule computer move
        setTimeout(computerMove, 500);
    }
    
    // Check if there's a winner or draw
    function checkGameStatus(shouldSwitchPlayer = true) {
        let winningCombo = null;
        
        // Check for winning combinations
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                winningCombo = combination;
                break;
            }
        }
        
        if (winningCombo) {
            // Highlight winning cells
            winningCombo.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
            
            // Update message and score
            statusMessage.textContent = `${currentPlayer} vinner!`;
            scores[currentPlayer]++;
            updateScores();
            
            gameActive = false;
            return true; // Game ended
        }
        
        // Check for draw
        if (!board.includes('')) {
            statusMessage.textContent = 'Uavgjort!';
            scores.draw++;
            updateScores();
            
            gameActive = false;
            return true; // Game ended
        }
        
        // Continue game with next player if requested
        if (shouldSwitchPlayer) {
            switchPlayer();
        }
        
        return false; // Game continues
    }
    
    // Simplified switch player function
    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `${currentPlayer}'s tur`;
    }
    
    // Computer move based on difficulty
    function computerMove() {
        if (!gameActive || currentPlayer !== 'O') {
            return; // Safety check
        }
        
        const difficulty = difficultySelect.value;
        let moveIndex;
        
        switch (difficulty) {
            case 'easy':
                moveIndex = getRandomMove();
                break;
            case 'medium':
                // 50% chance of making a smart move
                moveIndex = Math.random() < 0.5 ? getSmartMove() : getRandomMove();
                break;
            case 'hard':
                moveIndex = getSmartMove();
                break;
            default:
                moveIndex = getRandomMove();
        }
        
        // Make the move
        if (moveIndex !== -1) {
            board[moveIndex] = currentPlayer;
            cells[moveIndex].textContent = currentPlayer;
            cells[moveIndex].classList.add(currentPlayer.toLowerCase());
            
            // Check game status
            if (checkGameStatus(false)) { // Pass false to not trigger player switch
                return; // Game ended
            }
            
            // Manually switch back to player's turn
            currentPlayer = 'X';
            statusMessage.textContent = `${currentPlayer}'s tur`;
        }
    }
    
    // Get random valid move
    function getRandomMove() {
        const availableMoves = [];
        
        board.forEach((cell, index) => {
            if (cell === '') {
                availableMoves.push(index);
            }
        });
        
        if (availableMoves.length === 0) {
            return -1;
        }
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Get smarter move (basic minimax approach)
    function getSmartMove() {
        // Try to win
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            
            // Check if computer can win
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
                return c;
            }
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') {
                return b;
            }
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') {
                return a;
            }
        }
        
        // Block player from winning
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            
            // Check if player can win
            if (board[a] === 'X' && board[b] === 'X' && board[c] === '') {
                return c;
            }
            if (board[a] === 'X' && board[c] === 'X' && board[b] === '') {
                return b;
            }
            if (board[b] === 'X' && board[c] === 'X' && board[a] === '') {
                return a;
            }
        }
        
        // Take center if available
        if (board[4] === '') {
            return 4;
        }
        
        // Take corners if available
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => board[corner] === '');
        
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Otherwise, make a random move
        return getRandomMove();
    }
    
    // Update score display
    function updateScores() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        scoreDraw.textContent = scores.draw;
    }
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetBtn.addEventListener('click', initGame);
    
    // Initialize the game
    initGame();
});