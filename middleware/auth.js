// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.loggedIn) {
        return next();
    }
    
    // Redirect to login if not authenticated
    res.redirect('/auth/login');
}

// For routes that should not be accessible if logged in
function isNotAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.loggedIn) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = {
    isAuthenticated,
    isNotAuthenticated
};