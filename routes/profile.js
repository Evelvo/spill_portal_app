const express = require('express');
const router = express.Router();
const { run, get } = require('../db');
const { verifyPassword, createPasswordHash } = require('../auth-utils');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all profile routes
router.use(isAuthenticated);

// Profile update route
router.post('/update', async (req, res) => {
    try {
        const { email, first_name, last_name } = req.body;
        const userId = req.session.user.id;
        
        // Check if email already exists for another user
        if (email !== req.session.user.email) {
            const existingUser = await get('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existingUser) {
                return res.render('profile.html', { 
                    user: req.session.user,
                    error: 'E-postadressen er allerede i bruk av en annen bruker'
                });
            }
        }
        
        // Update user information in database
        await run(
            'UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?',
            [email, first_name || null, last_name || null, userId]
        );
        
        // Update session
        req.session.user = {
            ...req.session.user,
            email,
            first_name,
            last_name
        };
        
        res.render('profile.html', { 
            user: req.session.user,
            success: 'Profilen din har blitt oppdatert'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.render('profile.html', { 
            user: req.session.user,
            error: 'Det oppstod en feil under oppdatering av profilen din'
        });
    }
});

// Change password route
router.post('/change-password', async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        const userId = req.session.user.id;
        
        // Check if passwords match
        if (new_password !== confirm_password) {
            return res.render('profile.html', { 
                user: req.session.user,
                error: 'De nye passordene samsvarer ikke'
            });
        }
        
        // Get user from database to check current password
        const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            return res.render('profile.html', { 
                user: req.session.user,
                error: 'Bruker ikke funnet'
            });
        }
        
        // Verify current password
        const isPasswordValid = await verifyPassword(current_password, user.password_hash, user.salt);
        
        if (!isPasswordValid) {
            return res.render('profile.html', { 
                user: req.session.user,
                error: 'Nåværende passord er feil'
            });
        }
        
        // Create new password hash
        const { hash, salt } = await createPasswordHash(new_password);
        
        // Update password in database
        await run(
            'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
            [hash, salt, userId]
        );
        
        res.render('profile.html', { 
            user: req.session.user,
            success: 'Passordet ditt har blitt endret'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.render('profile.html', { 
            user: req.session.user,
            error: 'Det oppstod en feil under endring av passord'
        });
    }
});

module.exports = router;