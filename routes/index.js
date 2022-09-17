const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const Team = require("../models/Teams");
const { json } = require("express/lib/response");
const nodemailer = require("nodemailer");

//Welcome Page
router.get('/', (req,res)=>{
    res.render("welcome", {
        TeamList: []
    })
});

//IP Address
router.get("/ip", (req, res)=>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.toString().replace('::ffff:', '');
    console.log(ip)
    res.send(ip)
})

//Dashboard 
router.get("/dashboard", ensureAuthenticated, (req, res)=>{
    if(req.user.Informations.validated == false){
        //User muss erst noch validated werden
        //req.flash("success_msg", "Wir haben dir einen 4-stelligen Code an deine Email gesendet. Wenn du keine erhalten hast, überprüfe den Spam-Ordner oder fordere eine neue an")
        //res.redirect("/VerifyAccount");

        //Vorrübergehend deaktiviert
      }else{
          //render Dashboard
      }
          Team.find({Members: req.user.name}, (err, teams)=>{
            let EntrysToday = [];
            const AllEntrys = req.user.PersönlicheEinträge;
            
            //Current Date
            let currentDate = new Date();
            let cDay = currentDate.getDate()
            let cMonth = currentDate.getMonth() + 1
            let cYear = currentDate.getFullYear();
            if (parseInt(cMonth)<10){
                cMonth = "0"+cMonth;
            }
            if (parseInt(cDay)<10){
                cDay = "0"+cDay;
            }
            const today = cYear+"-"+cMonth+"-"+cDay;
            AllEntrys.forEach(entry =>{
                //Überprüfen ob der Termin heute ist und wenn ja zum Array EntrysToday hinzufügen
                let Entry = entry;
                const entryStartDate = Entry.start.slice(0, 10);
                const entryEndDate = Entry.end.slice(0,10);
                if(entryStartDate == today){
                    //Termin fängt heute an
                    EntrysToday.push(Entry)
                }else if(entryEndDate == today){
                    //Termin endet heute
                    //Termin so bearbeiten, dass die Start Time 00:00 ist
                    Entry.start = today+"T00:00";
                    EntrysToday.push(Entry)
                }
                //+Termine die heute enden hinzufügen und über eine längere Zeitspanne sind und diese über heute sind nicht hinzufügen
                //+Termine sortieren 
                
            })
    
            const sortedTodayArray = EntrysToday.sort(({ start: a }, {start: b }) => a > b ? 1 : a < b ? -1 : 0);
            let UserFriendlyTimeAverage;

            const finishedTODOS = req.user.Informations.finishedToDos;
            if (finishedTODOS.length > 0){
                let finish = 0;
            finishedTODOS.forEach(todo =>{
                finish += parseInt(todo.timeDifference)
            })
            const finishTimeaverage = (finish*-1) / finishedTODOS.length;
            let seconds = Math.floor(finishTimeaverage / 1000)
            let minutes = Math.floor(seconds / 60);
            if (minutes > 0){
                seconds -= minutes*60;
            }
            let hours = Math.floor(minutes / 60);
            if (hours > 0){
                minutes -= hours*60
            };
            let days = Math.floor(hours / 24);
            if (days > 0){
                hours -= days*24
            }
            UserFriendlyTimeAverage = days+" Tage  "+hours+" Stunden  "+minutes+" Minuten  "+seconds+" Sekunden";

            }else{
                UserFriendlyTimeAverage = "Noch keine ToDos abgeschlossen"
            }
            //rendern des Dashboards
            res.render("dashboard", {
                name: req.user.name,
                TeamList: teams,
                user: req.user,
                EntrysToday: sortedTodayArray,
                averageTimeCompleted: UserFriendlyTimeAverage
            });
        });
      }
    
);

router.get("/myCalendar", ensureAuthenticated, (req, res)=>{
    if(req.user.Informations.validated == false){
      //User muss erst noch validated werden
      //req.flash("success_msg", "Wir haben dir einen 4-stelligen Code an deine Email gesendet. Wenn du keine erhalten hast, überprüfe den Spam-Ordner oder fordere eine neue an")
      //res.redirect("/VerifyAccount");
      //Vorübergehen deaktiviert
    }else{
        //User ist bereits validated
    }
        const SettingsDelete7Days = req.user.Settings.AutomaticDeleteEntrys;

        let meineEinträge = [];
        const Einträge = req.user.PersönlicheEinträge
        Einträge.forEach(Eintrag => {
            if (SettingsDelete7Days == true || SettingsDelete7Days == "true"){
                //Alle Einträge die älter als 7 Tage sind löschen
                //Endzeit-Variabeln definieren
                let end;
                //Überprüfen ob überhaupt eine Endzeit vorhanden ist und wenn nicht die Startzeit nehmen
                if (Eintrag.end == ""){
                    //Es gibt kein definiertes Ende
                    end = Eintrag.start
                }else{
                    //Es gibt eine Endzeit
                    end = Eintrag.end;
                }
                const endYear = end.slice(0,4);
                const endMonth = end.slice(5,7);
                const endDay = (parseInt(end.slice(8,10)))-1;

                const Zeit=  getTimeDifference(new Date(endYear,(endMonth-1),endDay).getTime())
                if (Zeit < -604800000){
                    //Eintrag löschen und returnen
                    User.findByIdAndUpdate(req.user.id, {$pull: {PersönlicheEinträge: Eintrag}}, (err, doc)=>{
                        if (err) throw err;
                    })
                }
            }

            if (Eintrag.author == req.user.name){
                //Einen userfreundlicheren Date-String kreiiren und den Eintrag dann dem Array meine Einträge hinzufügen 
                const start = Eintrag.start;
                const startYear = start.slice(0,4);
                const startMonth = start.slice(5,7);
                const startDay = start.slice(8,10);
                const startTime = start.slice(11,16)
                Eintrag.startConverted = startDay+"."+startMonth+"."+startYear+" "+startTime;
                meineEinträge.unshift(Eintrag);
            }        
        })
            
            
            Team.find({Members: req.user.name}, (err, teams)=>{
                res.render("mycalendar", {
                   name: req.user.name,
                   TeamList: teams,
                   Einträge: JSON.stringify(Einträge),
                   meineEinträge: meineEinträge,
                   DefaultColor: req.user.Settings.DefaultColor
                });
            })
        

    });
    
    router.post("/myCalendar", ensureAuthenticated, (req, res)=>{
        //Neuer Termin
        const newTermin = {
            title: req.body.title,
            start: req.body.start,
            end: req.body.end,
            backgroundColor: req.body.backgroundColor,
            author: req.user.name
        }
        User.findByIdAndUpdate(req.user.id, {$addToSet: {PersönlicheEinträge: newTermin}}, (err, doc)=>{
            if (err) throw err;
            res.send("Posted");
        });
    })
    
    router.post("/myCalendar/deleteEntry", ensureAuthenticated, (req, res)=>{
        console.log(req.body)
        //Überprüfen ob die Anfrage vom Autor kommt
        if (req.body.author == req.user.name){
            //Authorisierung erfolgreich, die Löschanfrage kann durchgeführt werden
            User.findByIdAndUpdate(req.user.id, {$pull: {PersönlicheEinträge: req.body}}, (err, doc)=>{
                if (err) throw err;
                res.send("Deleting Completed")
            })
        }else{
            //Unerwünschter Softwareangriff, der fremde Daten aus dem System löschen möchte
            req.flash("error_msg", "Für diese Aktion haben Sie nicht die erforderliche Berechtigung")
            res.redirect("/users/login");
        }
    });


    //Persönliche Todo-List
    router.get("/myToDoList", ensureAuthenticated, (req, res)=>{
        Team.find({Members: req.user.name}, (err, teams)=>{
             res.render("myTodoList", {
                 name: req.user.name,
                 Todos: req.user.PersönlicheTodos,
                 TeamList: teams,
                 finishedTODOSLENGTH: req.user.Informations.finishedToDos.length
             })
        })
    })

    router.post("/myToDoList", ensureAuthenticated, (req, res)=>{
        const now = Date.now();
        const todo = {
           created: now,
           content: req.body.todo
        };

        User.findByIdAndUpdate(req.user.id, {$addToSet: {PersönlicheTodos: todo}},(err, doc)=>{
            if (err) throw err;
            res.send(todo)
        })
    });

    router.post("/myToDoList/deleteEntry", ensureAuthenticated, (req, res)=>{
        let finishedToDos = req.user.Informations.finishedToDos;
        const now = Date.now();
        const timeDifference = getTimeDifference(req.body.created)
        const finishedTodo = {
            created: req.body.created,
            content: req.body.content,
            completed: now,
            timeDifference: timeDifference
        }
        console.log(finishedTodo)
        finishedToDos.push(finishedTodo);
        let TODOS = req.user.PersönlicheTodos
        for (i=0; i < TODOS.length; i++){
            if (TODOS[i].content == req.body.content && TODOS[i].created == req.body.created){
                TODOS.splice(i, 1)
            }
        }
        //console.log(TODOS)
        User.findByIdAndUpdate(req.user.id, {PersönlicheTodos: TODOS},(err, doc)=>{
            User.findByIdAndUpdate(req.user.id, {Informations: {validated: req.user.Informations.validated, ValidationCode: req.user.Informations.ValidationCode, introduced: req.user.Informations.introduced, TeamRequests: req.user.Informations.TeamRequests, finishedToDos: finishedToDos, LAST_LOGIN: req.user.Informations.LAST_LOGIN}}, (err, doc)=>{
                if (err) throw err;
                res.send("Todo completed")
            })
        })
    })
    
    router.get("/myToDoList/finished", ensureAuthenticated, (req, res)=>{
        const finishedtodos = req.user.Informations.finishedToDos;
        let finishedTODOS = [];
        finishedtodos.forEach(todo => {
            //Completed datum userfreundlich machen und anschließend in den finishedTODOS Array vorne hinzufügen
            const completed = parseInt(todo.completed);
            const d = new Date(completed)
            todo.completed = d.toLocaleString()
            finishedTODOS.push(todo)
        })
        Team.find({Members: req.user.name}, (err, teams)=>{
            res.render("finishedTodos", {
                finishedToDos: finishedTODOS,
                TeamList: teams,
                name: req.user.name
            })
        })
    })

    router.get("/createTeam", ensureAuthenticated, (req, res)=>{
        if(req.user.Informations.validated == false){
            //User muss erst noch validated werden
            //res.redirect("/VerifyAccount");
          }else{
              //User ist validated
                //console.log(req.body)
          }
        let allUsers = [];
    
        User.find({}, (err, user)=>{
            //console.log(user);
            user.forEach(user =>{
                allUsers.push(user.name)
            })
            //console.log(allUsers)
           Team.find({Members: req.user.name}, (err, teams)=>{
            res.render("createTeam", {
                //Liste aller User, damit diese durchsucht werden können
                Users: allUsers,
                name: req.user.name,
                TeamList: teams
            })
            //console.log(teams);
           })
        })
    }
    );

router.post("/createTeam", (req, res)=>{
    const Teamname = req.body.Teamname;
    let Members = req.body.Teammembers;
    Members = Members.split(",");
    const Admin = [req.user.name];
    //console.log(Members);

    const newTeam = new Team({
        Teamname,
        Members,
        Admin
    })

    newTeam.save()
    .then(team =>{
        //console.log(team.id);
        res.send(team.id)
        //res.redirect("/teams/"+team.id+"/Calendar");
    })
    })



router.get("/notes", (req,res)=> {
    res.render("notes", {
        name: "",
        TeamList: []
    })
})

router.post("/VerifyAccount/newEmail", ensureAuthenticated, (req, res)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
        auth: {
            user: "TeamCalendar@outlook.de",
            pass: "Corona2020!"
        }
    })

    const options = {
        from: "TeamCalendar@outlook.de",
        to: req.user.email,
        subject: "Your Validation Code",
        text: "Your verify Code is: "+req.user.Informations.ValidationCode
    }
     
    //Vorübergehend deaktiviert 
    /*transporter.sendMail(options, function(err, info){
        if (err){
            console.log("Error while sending email");
            res.send(req.user.Informations.ValidationCode)
            return;
        }
        //console.log(info.response);
    })*/
})

router.get("/VerifyAccount", ensureAuthenticated, (req, res)=>{
    res.render("ServerMessages", {
        type: "error",
        message: "Diese Funktion ist vorrüberegehend deaktiviert",
        nextRoute: "/dashboard",
        TeamList: []
    })
})

router.post("/VerifyAccount", ensureAuthenticated, (req, res)=>{
    const code = parseInt(req.body.code);
    const CheckCode = parseInt(req.user.Informations.ValidationCode);
    console.log(code + "     "+ CheckCode)
    console.log(code == CheckCode)
    if (code == CheckCode){
        console.log("Correct")
        let introduced;
        let TeamRequests;
        User.findById(req.user.id, (err, user)=>{
            introduced = user.Informations.introduced;
            TeamRequests = user.Informations.TeamRequests;
            User.findByIdAndUpdate(user.id, {Informations: {validated: true, ValidationCode: code, introduced: introduced, TeamRequests: TeamRequests, finishedToDos: req.user.finishedToDos, LAST_LOGIN: req.user.Informations.LAST_LOGIN}}, (err, doc)=>{
                if (err) throw err;
                res.send("true")
            })
        })
    }else{
        res.send("false")
    }
})

function getTimeDifference(Time){
    const DateNOW = Date.now();
    const Difference = Time-DateNOW;
    return Difference;
    // Wenn Difference >0 ist das Event in der Zukunft. Wenn Difference < 0 war das Event in der Vergangenheit
    //1000ms*60s*60min*24h*7Tage = 604.800.000 -> wenn -604.800.000 ist das ergebnis älter als eine woche 
}

module.exports = router;