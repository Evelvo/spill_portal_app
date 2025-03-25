const express = require('express');
const router = express.Router();
const { run, get } = require('../db');
const { createPasswordHash, verifyPassword } = require('../auth-utils');

// Render the registration page
router.get('/register', (req, res) => {
    if (req.session.user && req.session.user.loggedIn) {
        return res.redirect('/dashboard');
    }
    res.render('auth/register.html', { error: null });
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirm_password, first_name, last_name } = req.body;
        
        // Basic validation
        if (!username || !email || !password || !confirm_password) {
            return res.render('auth/register.html', { 
                error: 'Alle påkrevde felt må fylles ut',
                formData: { username, email, first_name, last_name }
            });
        }
        
        if (password !== confirm_password) {
            return res.render('auth/register.html', { 
                error: 'Passordene samsvarer ikke',
                formData: { username, email, first_name, last_name }
            });
        }
        
        // Check if username or email already exists
        const existingUser = await get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            const errorMessage = existingUser.username === username 
                ? 'Brukernavnet er allerede i bruk' 
                : 'E-postadressen er allerede i bruk';
            
            return res.render('auth/register.html', { 
                error: errorMessage,
                formData: { username, email, first_name, last_name }
            });
        }
        
        // Hash the password
        const { hash, salt } = await createPasswordHash(password);
        
        // Store the user in the database
        await run(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, salt) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hash, first_name || null, last_name || null, salt]
        );
        
        // Redirect to login page
        res.redirect('/auth/login?registered=true');
        
    } catch (error) {
        console.error('Registration error:', error);
        res.render('auth/register.html', { 
            error: 'Det oppstod en feil under registrering. Vennligst prøv igjen.',
            formData: req.body
        });
    }
});

// Render the login page
router.get('/login', (req, res) => {
    if (req.session.user && req.session.user.loggedIn) {
        return res.redirect('/dashboard');
    }
    
    const registered = req.query.registered === 'true';
    const error = req.query.error === 'true' ? 'Ugyldig brukernavn eller passord' : null;
    
    res.render('auth/login.html', { registered, error });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.redirect('/auth/login?error=true');
        }
        
        // Find the user
        const user = await get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
        
        if (!user) {
            return res.redirect('/auth/login?error=true');
        }
        
        // Verify the password
        const passwordValid = await verifyPassword(password, user.password_hash, user.salt);
        
        if (!passwordValid) {
            return res.redirect('/auth/login?error=true');
        }
        
        // Update last login time
        await run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        // Set user session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            loggedIn: true
        };
        
        // Redirect to dashboard
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/auth/login?error=true');
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;