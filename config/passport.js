// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
// load up the user model
var User       = require('../models/user');

// load the auth variable

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // routedan gelen reqi almamızı sağlıyor
    },
    function(req, username, password, done) {
        if (username)
            username = username.toLowerCase(); // lowercase 

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Kullanıcı Bulunamadı'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Yanlış Parola'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {
        if (username)
            username = username.toLowerCase();

        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'local.username' :  username }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {
                        var newUser            = new User();

                        newUser.local.username    = username;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            console.log('hata burda');
                                return done(null, newUser);
                        });
                    }

                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

}));
};