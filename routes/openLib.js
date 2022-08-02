const express = require("express");
const res = require("express/lib/response");
const router = express.Router();

router.get("/", (req, res)=>{
    res.render("CalendarLibraryOverview",{
        TeamList: false
    }
    )
})

router.get("/code/Calendar.js", (req, res)=>{
    const options = {
        root: __dirname + "/lib/js/"
    };
    var fileName = 'OrganizeeCalendar.js';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            res.sendStatus("500")
        }
    });
})

router.get("/code/Calendar.css", (req, res)=>{
    const options = {
        root: __dirname + "/lib/css/"
    };
     console.log(options);
    var fileName = 'OrganizeeCalendar.css';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            res.sendStatus("500")
        }
    });
})

//Router exporten
module.exports = router;