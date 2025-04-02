document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const dealerCards = document.getElementById('dealer-cards');
    const playerCards = document.getElementById('player-cards');
    const dealerScoreDisplay = document.getElementById('dealer-score');
    const playerScoreDisplay = document.getElementById('player-score');
    const gameMessage = document.getElementById('game-message');
    const hitBtn = document.getElementById('hit-btn');
    const standBtn = document.getElementById('stand-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    // Stats elements
    const winStreakDisplay = document.getElementById('win-streak');
    const winsDisplay = document.getElementById('wins');
    const lossesDisplay = document.getElementById('losses');
    const drawsDisplay = document.getElementById('draws');
    
    // Game variables
    let deck = [];
    let dealerHand = [];
    let playerHand = [];
    let gameOver = false;
    let playerStood = false;
    
    // Stats variables
    let winStreak = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    // Card values and suits
    const suits = ['♥', '♦', '♠', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Create a deck of cards
    function createDeck() {
        const deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ value, suit });
            }
        }
        return deck;
    }
    
    // Shuffle the deck
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    // Deal a card from the deck
    function dealCard() {
        return deck.pop();
    }
    
    // Calculate the score of a hand
    function calculateScore(hand) {
        let score = 0;
        let hasAce = false;
        
        for (const card of hand) {
            if (card.value === 'A') {
                hasAce = true;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        
        // If score is over 21 and there's an ace, count the ace as 1 instead of 11
        if (score > 21 && hasAce) {
            for (const card of hand) {
                if (card.value === 'A') {
                    score -= 10;
                    if (score <= 21) {
                        break;
                    }
                }
            }
        }
        
        return score;
    }
    
    // Render a card in the UI
    function renderCard(card, container, hidden = false) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        if (hidden) {
            cardElement.classList.add('hidden');
        } else {
            // Add color class
            if (card.suit === '♥' || card.suit === '♦') {
                cardElement.classList.add('red');
            } else {
                cardElement.classList.add('black');
            }
            
            // Add value and suit
            const valueElement = document.createElement('div');
            valueElement.classList.add('card-value');
            valueElement.textContent = card.value;
            
            const suitElement = document.createElement('div');
            suitElement.classList.add('card-suit');
            suitElement.textContent = card.suit;
            
            cardElement.appendChild(valueElement);
            cardElement.appendChild(suitElement);
        }
        
        container.appendChild(cardElement);
    }
    
    // Update scores in the UI
    function updateScores() {
        const playerScore = calculateScore(playerHand);
        const dealerScore = calculateScore(dealerHand);
        
        playerScoreDisplay.textContent = playerScore;
        
        // Only show dealer's visible cards score unless game is over
        if (gameOver || playerStood) {
            dealerScoreDisplay.textContent = dealerScore;
        } else {
            // Calculate dealer's visible score (exclude the hidden card)
            const visibleDealerHand = dealerHand.slice(1);
            const visibleScore = calculateScore(visibleDealerHand);
            dealerScoreDisplay.textContent = visibleScore;
        }
    }
    
    // Check for game end conditions
    function checkGameEnd() {
        const playerScore = calculateScore(playerHand);
        const dealerScore = calculateScore(dealerHand);
        
        // Player busts
        if (playerScore > 21) {
            endGame('lose', 'Du gikk over 21! Du tapte.');
            return true;
        }
        
        // If player has stood
        if (playerStood) {
            // Dealer busts
            if (dealerScore > 21) {
                endGame('win', 'Dealeren gikk over 21! Du vant!');
                return true;
            }
            
            // Compare scores
            if (playerScore > dealerScore) {
                endGame('win', `Du vant med ${playerScore} mot dealerens ${dealerScore}!`);
            } else if (dealerScore > playerScore) {
                endGame('lose', `Du tapte med ${playerScore} mot dealerens ${dealerScore}.`);
            } else {
                endGame('draw', `Uavgjort! Begge fikk ${playerScore}.`);
            }
            
            return true;
        }
        
        return false;
    }
    
    // End the game and update stats
    function endGame(result, message) {
        gameOver = true;
        revealDealerCards();
        updateScores();
        
        gameMessage.textContent = message;
        gameMessage.className = 'game-message';
        
        // Add appropriate class to message
        if (result === 'win') {
            gameMessage.classList.add('win-message');
            winStreak++;
            wins++;
        } else if (result === 'lose') {
            gameMessage.classList.add('lose-message');
            winStreak = 0;
            losses++;
        } else {
            gameMessage.classList.add('draw-message');
            draws++;
        }
        
        // Update stats display
        updateStats();
        
        // Disable game buttons
        hitBtn.disabled = true;
        standBtn.disabled = true;
        
        // Save game statistics
        saveGameStats(result);
    }
    
    // Reveal dealer's hidden card
    function revealDealerCards() {
        dealerCards.innerHTML = '';
        for (const card of dealerHand) {
            renderCard(card, dealerCards);
        }
    }
    
    // Update stats display
    function updateStats() {
        winStreakDisplay.textContent = winStreak;
        winsDisplay.textContent = wins;
        lossesDisplay.textContent = losses;
        drawsDisplay.textContent = draws;
    }
    
    // Start a new game
    function startNewGame() {
        // Reset game state
        deck = shuffleDeck(createDeck());
        dealerHand = [];
        playerHand = [];
        gameOver = false;
        playerStood = false;
        
        // Clear UI
        dealerCards.innerHTML = '';
        playerCards.innerHTML = '';
        gameMessage.textContent = '';
        gameMessage.className = 'game-message';
        
        // Deal initial cards
        dealerHand.push(dealCard());
        dealerHand.push(dealCard());
        playerHand.push(dealCard());
        playerHand.push(dealCard());
        
        // Render cards
        renderCard(dealerHand[0], dealerCards, true); // First dealer card is hidden
        renderCard(dealerHand[1], dealerCards);
        renderCard(playerHand[0], playerCards);
        renderCard(playerHand[1], playerCards);
        
        // Update scores
        updateScores();
        
        // Check for blackjack
        if (calculateScore(playerHand) === 21) {
            if (calculateScore(dealerHand) === 21) {
                endGame('draw', 'Begge fikk Blackjack! Uavgjort!');
            } else {
                endGame('win', 'Blackjack! Du vant!');
            }
        }
        
        // Enable game buttons
        hitBtn.disabled = false;
        standBtn.disabled = false;
    }
    
    // Player hits
    function playerHit() {
        if (gameOver) return;
        
        // Deal a new card to the player
        const card = dealCard();
        playerHand.push(card);
        renderCard(card, playerCards);
        
        // Update scores and check for game end
        updateScores();
        checkGameEnd();
    }
    
    // Player stands
    function playerStand() {
        if (gameOver) return;
        
        playerStood = true;
        revealDealerCards();
        
        // Dealer draws cards until score is 17 or higher
        let dealerScore = calculateScore(dealerHand);
        while (dealerScore < 17) {
            const card = dealCard();
            dealerHand.push(card);
            renderCard(card, dealerCards);
            dealerScore = calculateScore(dealerHand);
        }
        
        // Update scores and check for game end
        updateScores();
        checkGameEnd();
    }
    
    // Function to save game statistics to the server
    function saveGameStats(result) {
        // Prepare statistics based on game result
        const stats = {
            gameType: 'blackjack',
            wins: result === 'win' ? 1 : 0,
            losses: result === 'lose' ? 1 : 0,
            draws: result === 'draw' ? 1 : 0,
            score: calculateScore(playerHand) // Use player's score as the game score
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
    hitBtn.addEventListener('click', playerHit);
    standBtn.addEventListener('click', playerStand);
    newGameBtn.addEventListener('click', startNewGame);
    
    // Initialize game
    startNewGame();
});