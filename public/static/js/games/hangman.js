document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const wordDisplay = document.getElementById('word-display');
    const keyboard = document.getElementById('keyboard');
    const messageEl = document.getElementById('message');
    const guessesEl = document.getElementById('guesses');
    const newGameBtn = document.getElementById('new-game-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    
    // Hangman parts
    const hangmanParts = [
        document.getElementById('head'),
        document.getElementById('body'),
        document.getElementById('left-arm'),
        document.getElementById('right-arm'),
        document.getElementById('left-leg'),
        document.getElementById('right-leg')
    ];
    
    // Game variables
    let word = '';
    let guessedLetters = [];
    let wrongGuesses = 0;
    let gameActive = false;
    
    // Word lists by difficulty
    const wordLists = {
        easy: [
            'bil', 'hus', 'katt', 'hund', 'båt', 'sol', 'bord', 'stol', 'eple',
            'banan', 'bok', 'penn', 'dør', 'bro', 'fisk', 'hest', 'sko', 'kopp',
            'melk', 'brød', 'egg', 'vann', 'tre', 'ball', 'hatt', 'pose', 'sofa'
        ],
        medium: [
            'dataspill', 'telefon', 'fotball', 'sykkel', 'musikk', 'pizza', 'skole',
            'familie', 'sommer', 'vinter', 'høst', 'fjell', 'strand', 'jordbær',
            'appelsin', 'ananas', 'butikk', 'sjokolade', 'restaurant', 'festival',
            'bibliotek', 'hotell', 'stasjon', 'flyplass', 'tastatur', 'vindu'
        ],
        hard: [
            'programmering', 'astronaut', 'universitet', 'demokrati', 'atmosfære',
            'revolusjon', 'teknologi', 'matematikk', 'psykologi', 'filosofi',
            'økonomi', 'dinosaur', 'nordlys', 'spektakulær', 'akvarell', 'samfunn',
            'bærekraft', 'vitenskap', 'journalistikk', 'arkitektur', 'immunforsvar'
        ]
    };
    
    // Initialize the keyboard
    function initKeyboard() {
        keyboard.innerHTML = '';
        const letters = 'abcdefghijklmnopqrstuvwxyzæøå';
        
        for (const letter of letters) {
            const key = document.createElement('button');
            key.classList.add('key');
            key.textContent = letter;
            key.addEventListener('click', () => handleGuess(letter));
            keyboard.appendChild(key);
        }
    }
    
    // Start a new game
    function startNewGame() {
        // Get selected difficulty
        const difficulty = difficultySelect.value;
        const wordList = wordLists[difficulty];
        
        // Choose a random word
        word = wordList[Math.floor(Math.random() * wordList.length)];
        
        // Reset game state
        guessedLetters = [];
        wrongGuesses = 0;
        gameActive = true;
        
        // Reset UI
        messageEl.textContent = '';
        messageEl.className = 'message';
        guessesEl.textContent = 'Brukte bokstaver: ';
        
        // Reset keyboard
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('used', 'correct', 'wrong');
            key.disabled = false;
        });
        
        // Reset hangman
        hangmanParts.forEach(part => {
            part.style.display = 'none';
        });
        
        // Display word placeholder
        updateWordDisplay();
    }
    
    // Update the word display
    function updateWordDisplay() {
        wordDisplay.innerHTML = '';
        
        for (const letter of word) {
            const letterBox = document.createElement('div');
            letterBox.classList.add('letter-box');
            
            if (guessedLetters.includes(letter)) {
                letterBox.textContent = letter;
            }
            
            wordDisplay.appendChild(letterBox);
        }
    }
    
    // Handle letter guess
    function handleGuess(letter) {
        if (!gameActive || guessedLetters.includes(letter)) {
            return;
        }
        
        // Add letter to guessed letters
        guessedLetters.push(letter);
        
        // Update used letters display
        guessesEl.textContent = 'Brukte bokstaver: ' + guessedLetters.join(', ');
        
        // Find key button and mark as used
        const keyButton = Array.from(document.querySelectorAll('.key'))
            .find(key => key.textContent === letter);
        
        if (keyButton) {
            keyButton.classList.add('used');
        }
        
        // Check if letter is in the word
        if (word.includes(letter)) {
            if (keyButton) {
                keyButton.classList.add('correct');
            }
            updateWordDisplay();
            
            // Check if player won
            const hasWon = Array.from(word).every(letter => guessedLetters.includes(letter));
            
            if (hasWon) {
                gameActive = false;
                messageEl.textContent = 'Gratulerer, du vant!';
                messageEl.classList.add('success');
                
                // Save winning statistics
                saveGameStats(true);
            }
        } else {
            // Wrong guess
            if (keyButton) {
                keyButton.classList.add('wrong');
            }
            
            // Show next hangman part
            if (wrongGuesses < hangmanParts.length) {
                hangmanParts[wrongGuesses].style.display = 'block';
                wrongGuesses++;
            }
            
            // Check if player lost
            if (wrongGuesses >= hangmanParts.length) {
                gameActive = false;
                messageEl.textContent = `Du tapte! Ordet var: ${word}`;
                messageEl.classList.add('error');
                
                // Save losing statistics
                saveGameStats(false);
            }
        }
    }
    
    // Function to save game statistics to the server
    function saveGameStats(isWin) {
        // Calculate score based on remaining wrong guesses allowed
        const maxWrongGuesses = hangmanParts.length;
        const remainingGuesses = maxWrongGuesses - wrongGuesses;
        const score = isWin ? remainingGuesses * 10 : 0; // 10 points per remaining guess
        
        // Prepare statistics
        const stats = {
            gameType: 'hangman',
            wins: isWin ? 1 : 0,
            losses: isWin ? 0 : 1,
            draws: 0,
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
    
    // Handle keyboard events
    function handleKeyDown(e) {
        if (!gameActive) return;
        
        const key = e.key.toLowerCase();
        const allowedKeys = 'abcdefghijklmnopqrstuvwxyzæøå';
        
        if (allowedKeys.includes(key)) {
            handleGuess(key);
        }
    }
    
    // Event listeners
    newGameBtn.addEventListener('click', startNewGame);
    document.addEventListener('keydown', handleKeyDown);
    
    // Initialize game
    initKeyboard();
    startNewGame();
});