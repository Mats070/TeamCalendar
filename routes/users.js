const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport")

//Nodemailer 
const nodemailer = require("nodemailer");

// User Model
const user = require("../models/user");
const User = require("../models/user");
const { ensureAuthenticated } = require("../config/auth");

//Team Model
const Team = require("../models/Teams");
const { request } = require("express");

//Login Page
router.get('/login(/*)?', (req,res) =>{
    const loginInfos = req.params[1];
   res.render("login", {
       loginInfos: loginInfos,
       TeamList: []
   })
});

//Register Page
router.get("/register", (req, res)=>{
    res.render("register", {
        name: "",
        TeamList: []
    })
});

//Register Handle
router.post("/register", (req, res) =>{
    //console.log(req.body)
    const { name, email, password, password2 } = req.body;
    
    let errors = [];

    //Check required fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg:"Please fill in all fields"});
    }

    //Check Passwords match
    if(password !== password2){
        errors.push({ msg: "Passwords do not match"});
    }

    //Check password length
    if(password.length < 6){
        errors.push({ msg: "Password should be at least 6 characters"});
    }

    if(errors.length > 0){
       res.render("register", {
           errors,
           name,
           email,
           password,
           password2,
           TeamList: []
       });
    } else{
        //Validation passed
        User.findOne({ email: email })
        .then(user =>{
            if(user){
               // User exist 
               errors.push({ msg: "Email is already registered" })
               res.render("register", {
                errors,
                name,
                email,
                password,
                password2,
                TeamList: []
               })
            } else {
                User.findOne({name: name})
               .then(user=>{
                if (user || name == "System" || name == "Admin" || name=="TeamCalendar" || name == "TeamCalendar-App" || name == "teamcalendar.app" || name== "Service" || name=="Server"){
                    //Name bereits vorhanden
                    errors.push({msg: "Dieser Benutzername existiert bereits. Wählen Sie einen anderen!"});
                    res.render("register", {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        TeamList: []
                    })
                } else {
                    if(name.includes("<") || name.includes(">") || name.includes("|") || name.includes(",") || name.includes("$") || name.includes("&") || name.includes("%") || name.includes("*") || name.includes("+") || name.includes("/") || name.includes("{") || name.includes("[") || name.includes("}") || name.includes("]") || name.includes("(") || name.includes(")") || name.includes('"') || name.includes("'")){
                        //Keine Sonderzeichen (Meldung ins Frontend geben)
                        errors.push({msg: 'Folgende Sonderzeichen sind nicht zulässig:  <>|$%&,*+/(){[]}" '});
                    res.render("register", {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        TeamList: []
                    })
                    }else{
                        //Neuen User erstellen
                        const newUser = new User({
                            name,
                            email,
                            password
                    })
                   
                // Hash Passwort   
                bcrypt.genSalt(10, (err, salt)  => 
                bcrypt.hash(newUser.password, salt, (err, hash) =>{
                    if(err) throw err;
                    //set password to hashed
                    newUser.password = hash;
                    //Save User in Database
                    newUser.save()
                    .then(user =>{
    
                        //Email mit VerifyLink herraussenden
                       const sendEmail = VerifyAccount(user.id, user.email);
                       //console.log(sendEmail)

                        req.flash("success_msg", "Your are now registered and can log in! We have sent a verify code to your email.")
                        res.redirect("/users/login/"+req.body.email+"&&"+req.body.password);
                    })
                    .catch(err => console.log(err));
                }))        
                }
            }
        });
    }
})
    }
});

//Login handle
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
    

});

//Logout Handle
router.get("/logout", ensureAuthenticated, (req, res)=> {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
})

router.get("/profile", ensureAuthenticated, (req, res)=>{
    if(req.user.Informations.validated == false){
        //User muss erst noch validated werden
        res.redirect("/VerifyAccount");
      }else{
          //User ist validated
          Team.find({Members: req.user.name}, (err, teams)=>{
            res.render("profile", {
                user: req.user,
                TeamList: teams,
                name: req.user.name
            })
        })
      }
})

//Persönlicher Settings-Change
router.post("/settings", ensureAuthenticated, (req, res)=>{
    const AutomaticDeleteEntrys = req.body.AutomaticDeleteEntrys;
    const DefaultColor = req.body.DefaultColor;

    User.findByIdAndUpdate(req.user.id, {Settings: {AutomaticDeleteEntrys: AutomaticDeleteEntrys, DefaultColor: DefaultColor, SpeicherortPersönlicheDaten: req.user.Settings.SpeicherortPersönlicheDaten}}, (err, doc)=>{
        res.send("Settings updated")
    })
})



function VerifyAccount(id, email){
    let validated = false;
    let introduced = false;
    let TeamRequests = [];
    let code; 
    const random1 = Math.floor(Math.random()*9.99);
    const random2 = Math.floor(Math.random()*9.99);
    const random3 = Math.floor(Math.random()*9.99);
    const random4 = Math.floor(Math.random()*9.99);
   // console.log(random1)
    code = random1+""+random2+""+random3+""+random4+"";
    //console.log(code)

    User.findByIdAndUpdate(id, {Informations: {validated: validated, ValidationCode: code, introduced: introduced, TeamRequests: TeamRequests}}, (err, doc)=>{
        if (err) throw err;
    })

    const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "TeamCalendar@outlook.de",
            pass: "Corona2020!"
        }
    })

    const options = {
        from: "TeamCalendar@outlook.de",
        to: email,
        subject: "Your Verify Code",
        text: "This is your verify Code: " + code
    }

    transporter.sendMail(options, function(err, info){
        if (err){
            //console.log(err);
            console.log("Error because of spam")
            return false;
        }
        //console.log(info.response);
    })
}


module.exports = router;              
