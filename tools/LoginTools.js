const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const refreshSecret = "7676fac37efe6722628b767e8cdf15708cd893b8dca1e51833af84c9065fdc246da9f0a89c538fc7bb756a1937fe0a69086207e20e5643d849d8189fd5bff5d7";


// Load User Model
const User = require("../models/user");

const handleLogin = async (req, res)=>{
    let errors = [];

    const {name, password} = req.body;
    if (!name || !password){
        errors.push("Fill out all Fields");
        return res.render("login", {
            errors: errors
        })
    }
    //Find User by Username
    User.findOne({ name: name })
    .then(user =>{
        if (!user){
            //Username ist nicht registriert
            errors.push("This Username is not registered");
            req.flash("error_msg", "User nicht registriert");
            res.render("login", {
                errors: errors
            })
        }else{
            //User gefunden 
            const storedPassword = user.password;
            const match = bcrypt.compareSync(password, storedPassword)
            if (!match){
                //Passwort falsch
                errors.push("Password incorrect");
                req.flash("error_msg", "Password falsch");
                res.render("login", {
                    errors: errors
                })
            }else{
                //Passwort richtig => Create JWT
                const refreshToken = jwt.sign(
                    {
                        username: name

                    },
                    refreshSecret,
                    //Change That later
                    { expiresIn: '3d' }
                );    
                //User saven
                user.save();
                

                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
                res.redirect("/dashboard")
            }
        }
    })
}

module.exports = handleLogin;