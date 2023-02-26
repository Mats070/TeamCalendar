const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const path = require("path");

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

router.get("/js/:name", (req, res)=>{
    const filepath = path.join(process.cwd(), "routes", "lib", "js", req.params.name);
    res.sendFile(filepath);
})

router.get("/code/:name", (req, res)=>{
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

router.get("/builder", (req, res)=>{
    res.send("Fine")
});

router.post("/builder", (req, res)=>{
    console.log(req.body);
    res.sendStatus(200);
})

//Router exporten
module.exports = router;