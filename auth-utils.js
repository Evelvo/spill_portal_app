const crypto = require('crypto');

// Generate a secure salt
function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

// Hash a password with a salt
function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        // Use PBKDF2 for password hashing
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
            if (err) return reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
}

// Verify a password against a hash
async function verifyPassword(password, storedHash, salt) {
    const hash = await hashPassword(password, salt);
    return hash === storedHash;
}

// Create a combined hash with the salt for storage
async function createPasswordHash(password) {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    return {
        hash,
        salt
    };
}

module.exports = {
    generateSalt,
    hashPassword,
    verifyPassword,
    createPasswordHash
};