// helpers.js
exports.getGameName = (gameType) => {
    const gameNames = {
        'hangman': 'Hangman',
        'tic-tac-toe': 'Tic-Tac-Toe',
        'stein-saks-papir': 'Stein-Saks-Papir',
        'blackjack': 'Blackjack'
    };
    return gameNames[gameType] || gameType;
};