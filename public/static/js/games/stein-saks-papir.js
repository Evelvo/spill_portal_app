document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const userScoreDisplay = document.getElementById('user-score');
    const computerScoreDisplay = document.getElementById('computer-score');
    const resultMessage = document.getElementById('result-message');
    const userHandDisplay = document.getElementById('user-hand');
    const computerHandDisplay = document.getElementById('computer-hand');
    const rockBtn = document.getElementById('rock');
    const paperBtn = document.getElementById('paper');
    const scissorsBtn = document.getElementById('scissors');
    const resetBtn = document.getElementById('reset-btn');
    
    // Game variables
    let userScore = 0;
    let computerScore = 0;
    const handEmojis = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };
    
    // Initialize game
    function init() {
        userScore = 0;
        computerScore = 0;
        updateScore();
        resultMessage.textContent = 'Velg ditt trekk!';
        resultMessage.className = 'result-message';
        userHandDisplay.textContent = '?';
        computerHandDisplay.textContent = '?';
    }
    
    // Update score display
    function updateScore() {
        userScoreDisplay.textContent = userScore;
        computerScoreDisplay.textContent = computerScore;
    }
    
    // Computer's random choice
    function getComputerChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        const randomIndex = Math.floor(Math.random() * 3);
        return choices[randomIndex];
    }
    
    // Determine winner
    function getWinner(userChoice, computerChoice) {
        if (userChoice === computerChoice) {
            return 'draw';
        }
        
        if (
            (userChoice === 'rock' && computerChoice === 'scissors') ||
            (userChoice === 'paper' && computerChoice === 'rock') ||
            (userChoice === 'scissors' && computerChoice === 'paper')
        ) {
            return 'user';
        }
        
        return 'computer';
    }
    
    // Play game
    function play(userChoice) {
        // Animate hands
        userHandDisplay.textContent = '✊';
        computerHandDisplay.textContent = '✊';
        
        userHandDisplay.classList.add('animate');
        computerHandDisplay.classList.add('animate');
        
        // Get computer choice
        const computerChoice = getComputerChoice();
        
        // Show result after animation
        setTimeout(() => {
            // Remove animation class
            userHandDisplay.classList.remove('animate');
            computerHandDisplay.classList.remove('animate');
            
            // Update hand displays
            userHandDisplay.textContent = handEmojis[userChoice];
            computerHandDisplay.textContent = handEmojis[computerChoice];
            
            // Determine winner
            const result = getWinner(userChoice, computerChoice);
            
            // Update score and message
            if (result === 'user') {
                userScore++;
                resultMessage.textContent = 'Du vinner!';
                resultMessage.className = 'result-message user-win';
            } else if (result === 'computer') {
                computerScore++;
                resultMessage.textContent = 'Datamaskinen vinner!';
                resultMessage.className = 'result-message computer-win';
            } else {
                resultMessage.textContent = 'Uavgjort!';
                resultMessage.className = 'result-message draw';
            }
            
            updateScore();
            
            // Save game statistics
            saveGameStats(result);
        }, 500);
    }
    
    // Function to save game statistics to the server
    function saveGameStats(result) {
        // Calculate statistics based on result
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let score = 0;
        
        if (result === 'user') {
            wins = 1;
            score = 5;
        } else if (result === 'computer') {
            losses = 1;
        } else {
            draws = 1;
            score = 1;
        }
        
        // Prepare statistics
        const stats = {
            gameType: 'stein-saks-papir',
            wins: wins,
            losses: losses,
            draws: draws,
            score: score
        };
        
        // Send data to the server
        fetch('/api/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stats)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Error saving game stats:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving game stats:', error);
        });
    }
    
    // Event listeners
    rockBtn.addEventListener('click', () => play('rock'));
    paperBtn.addEventListener('click', () => play('paper'));
    scissorsBtn.addEventListener('click', () => play('scissors'));
    resetBtn.addEventListener('click', init);
    
    // Initialize the game
    init();
});