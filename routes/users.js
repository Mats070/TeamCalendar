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
router.get('/login', (req,res) =>{
   res.render("login", {
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

router.post("/register/validName", (req, res)=>{
    User.findOne({name: req.body.name}, (err, user)=>{
        if (user){
            res.send("Exist");
        }else{
            res.send("Available");
        }
    })
})

//Register Handle
router.post("/register", (req, res) =>{
    //console.log(req.body)
    const { name, password, password2 } = req.body;
    
    let errors = [];

    //Check required fields
    if(!name || !password || !password2) {
        errors.push({ msg:"Please fill in all fields"});
    }

    //Check Passwords match
    if(password !== password2){
        errors.push({ msg: "Passwords do not match"});
    }

    //Check password length
    if(password.length < 6){
        errors.push({ msg: "Password should not be weak"});
    }

    if(errors.length > 0){
       res.render("register", {
           errors,
           name,
           password,
           password2,
           TeamList: []
       });
    } else{
        //Validation passed
        User.findOne({ name: name })
        .then(user =>{
            if(user || name == "System" || name == "Admin" || name=="Organizee" || name== "Service" || name=="Server"){
               // User exist 
               errors.push({ msg: "Username is already registered" })
               res.render("register", {
                errors,
                name,
                password,
                password2,
                TeamList: []
               })
            } else {
                    if(name.includes("<") || name.includes(">") || name.includes("|") || name.includes(",") || name.includes("$") || name.includes("&") || name.includes("%") || name.includes("*") || name.includes("+") || name.includes("/") || name.includes("{") || name.includes("[") || name.includes("}") || name.includes("]") || name.includes("(") || name.includes(")") || name.includes('"') || name.includes("'")){
                        //Keine Sonderzeichen (Meldung ins Frontend geben)
                        errors.push({msg: 'These special characters are not valid in the username:  <>|$%&,*+/(){[]}" '});
                    res.render("register", {
                        errors,
                        name,
                        password,
                        password2,
                        TeamList: []
                    })
                    }else{
                        //Neuen User erstellen
                        const newUser = new User({
                            name,
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
                       //const sendEmail = VerifyAccount(user.id, user.email);  (Vorrübergehend deaktiviert)
                       //console.log(sendEmail)

                        req.flash("success_msg", "Your are now registered and can log in!")
                        res.redirect("/users/login");
                    })
                    .catch(err => console.log(err));
                }))        
                }
            }
        });
    }
});

//Login handle
router.post("/login",  
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
        //successRedirect: "/dashboard"
    }),(req, res) =>{
        const now = new Date();
        const date = now.getDate() + "." + (now.getMonth()+1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() ;
        User.findByIdAndUpdate(req.user.id, {Informations: {validated: req.user.Informations.validated, ValidationCode: req.user.Informations.ValidationCode, introduced: req.user.Informations.introduced, TeamRequests: req.user.Informations.TeamRequests, finishedToDos: req.user.Informations.finishedToDos, LAST_LOGIN: date} }, (err, doc)=>{
            //Neuste loginzeit gespeichert
            res.redirect("/dashboard")
        })
    }
    
    
);

//Logout Handle
router.get("/logout", ensureAuthenticated, (req, res)=> {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
})

router.get("/profile", ensureAuthenticated, (req, res)=>{
    if(req.user.Informations.validated == false){
        //User muss erst noch validated werden
       // res.redirect("/VerifyAccount");

       //Vorrübergehend deaktiviert
      }else{
          //User ist validated
      }
          Team.find({Members: req.user.name}, (err, teams)=>{
            res.render("profile", {
                user: req.user,
                TeamList: teams,
                name: req.user.name
            })
        })
      }
)

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
