const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Load User Model
const User = require("../models/user");

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: "email"}, (email, password, done) => {
            //Match User
            User.findOne({ email: email })
            .then(User =>{
                if(!User){
                    return done(null, false, {message: "That email is not registered"});
                }

                //Match Password
                bcrypt.compare(password, User.password, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch){
                        return done(null, User)
                    } else {
                        return done(null, false, { message: "Password incorrect" });
                    }
                })
            })
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
}