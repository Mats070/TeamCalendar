// first: npm install bcrypt connect-flash express ejs express-ejs-layouts express-session mongoose passport passport-local
//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

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require('express-fileupload');


//Cookie Detection
const usercookie = require("./middleware/ReqUser");
const projectcookie = require("./middleware/ReqProject");
const { append } = require("express/lib/response");

const app = express();


// DB config
const db = require("./config/keys").MongoURI;

// Connect to Mongo
mongoose.connect(db, { UseNewUrlParser: true})
.then(()=> console.log("MongoDB connected..."))
.catch(err => console.log(err));


//EJS
app.set('views', __dirname + '/views');
app.use(expressLayouts);
app.set("view engine", "ejs");

//Json
app.use(express.json());


//Bodyparser
app.use(express.urlencoded({ extended: false}));
 
//Fileupload
app.use(fileUpload())


//middleware for cookies
app.use(cookieParser());

//middleware for req.user und req.project
app.use(usercookie);
app.use(projectcookie);

//Express Session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

//Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
})

//Routes
app.use('/', require('./routes/index'));
app.use("/users", require("./routes/users"));
app.use("/teams", require("./routes/teamsHandling"));
//CORS aktivieren
app.use(cors());
app.use("/lib", require("./routes/openLib"));

//Website Builder Platform
app.use("/platform", require("./routes/platform"));

//Mama Geburtstag
app.use("/mama/", require("./routes/mama"));



const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log("Server started on port " + PORT));