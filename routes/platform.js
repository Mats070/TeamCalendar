const express = require("express");
const router = express.Router();
const personalAuth = require("../config/auth").personalAuth;
const platformAuth = require("../config/auth").platformAuth;
const CreateJWTWithUserInfos = require("../tools/analyseTools").CreateJWTWithUserInfos;

const Project = require("../models/project");
const bcrypt = require("bcrypt");

router.get("/projects/add", personalAuth, (req, res)=>{
    res.render("AddProject", {
        TeamList: []
    })
});

router.post("/projects/add", personalAuth, (req, res)=>{
    if (req.body.name && req.body.email){
        const newProject = new Project({
            name: req.body.name,
            email: req.body.email,
            password: req.body.email
        });

        bcrypt.genSalt(10, (err, salt)  => 
                bcrypt.hash(newProject.password, salt, (err, hash) =>{
                    if(err) throw err;
                    //set password to hashed
                    newProject.password = hash;
                    //Save User in Database
                    newProject.save()
                    .then(project =>{
                        req.flash("success_msg", "Registered!")
                        res.redirect("/platform/login");
                    })
                    .catch(err => console.log(err));
                }))
    }else{
        res.sendStatus(500);
    }
})

router.get("/login", (req, res)=>{
    res.render("PlatformLogin", {
        TeamList: [],
        errors: []
    })
})

router.post("/login", require("../tools/LoginTools").handlePlatformLogin);

router.get("/project/:id", platformAuth,(req, res)=>{
    res.render("Project", {
        TeamList: [],
        name: req.project.name,
        Msgs: req.project.messages.reverse(),
        id: req.project.id
    })
});

router.post("/project/:id/exists", (req, res)=>{
    Project.findById(req.params.id, (err, project)=>{
        if (project){
            res.sendStatus(200);
        }else{
            res.sendStatus(404);
        }
    })
})

router.post("/project/:id/formSubmit", (req, res)=>{
    const {Name, Email, Message} = req.body;
    if (Name.length > 2 && Email.includes("@") && Email.includes(".") && Message.length > 4){
        Project.findByIdAndUpdate(req.params.id, {$addToSet: {messages: req.body}}, (err, project)=>{
            res.sendStatus(200);
        })
    }else{
        res.sendStatus(400);
    }
});

router.post("/project/:id/analyseTools/newVisit", async (req, res)=>{
    const newCookie = await CreateJWTWithUserInfos(req.body.cookie, req);
    const JSON = {
        cname: "Analytics_Auth",
        cvalue: newCookie,
        expDate: 365,
    }
    res.status(200).json(JSON);
})


module.exports = router;