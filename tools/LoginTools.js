const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const refreshSecretUser = "7676fac37efe6722628b767e8cdf15708cd893b8dca1e51833af84c9065fdc246da9f0a89c538fc7bb756a1937fe0a69086207e20e5643d849d8189fd5bff5d7";
const refreshSecretPlatform = "7676fhjlöäfe6722628b767e8cdf15708cd893b8dca1e51833af84c9065fdc246da9f0a89c538fc7bb756a1937fe0a69086207e20e5643d849d8189fd5bff5d7";


// Load Models
const User = require("../models/user");
const Project = require("../models/project");

const handleUserLogin = async (req, res)=>{
    let errors = [];

    const {name, password} = req.body;
    if (!name || !password){
        errors.push("Fill out all Fields");
        return res.render("login", {
            errors: errors,
            TeamList: []
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
                errors: errors,
                TeamList: []
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
                    errors: errors,
                    TeamList: []
                })
            }else{
                //Passwort richtig => Create JWT
                const refreshToken = jwt.sign(
                    {
                        username: name

                    },
                    refreshSecretUser,
                    //Change That later
                    { expiresIn: '3d' }
                );    
                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'Strict', maxAge: 20 * 60 * 60 * 1000 });
                res.redirect("/dashboard")
            }
        }
    })
}

const handlePlatformLogin = async (req, res)=>{
    const {email, password} = req.body;
    if (email && password){
        Project.findOne({email: email})
        .then(project =>{
            if(!project){
                res.render("PlatformLogin", {
                    errors: ["Email-Adresse nicht registriert"],
                    TeamList: []
                });
            }else{
                //Projekt vorhanden
                const storedPassword = project.password;
                const match = bcrypt.compareSync(password, storedPassword);
                if (!match){
                    //Ungültiges Passwort
                    res.render("PlatformLogin", {
                        errors: ["Ungültiges Passwort"],
                        TeamList: []
                    });
                }else{
                    //Password richtig => Login erfolgreich
                    const refreshToken = jwt.sign(
                        {
                            email: email
                        },
                        refreshSecretPlatform,
                        //Change That later
                        { expiresIn: '3d' }
                    );    
                    res.cookie('platform', refreshToken, { httpOnly: true, sameSite: 'Strict', maxAge: 3* 24 * 60 * 60 * 1000 });
                    res.redirect("/platform/project/" + project.id)
                }
            }
        })
    }else{
        res.sendStatus(400);
    }
}

module.exports = {handleUserLogin, handlePlatformLogin};