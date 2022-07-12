const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const Team = require("../models/Teams");

router.get("/:id/Calendar", ensureAuthenticated, (req, res)=>{
    Team.findById(req.params.id, (err, team)=>{
        if (err){
            req.flash("error", "Ein Fehler ist aufgetreten. Bitte melden Sie sich neu an")
            res.redirect("/users/login")
        }

        const SettingsDelete7Days = team.Settings.AutomaticDeleteEntrys;
        //console.log(SettingsDelete7Days)

        let meineEinträge = [];
        const Einträge = team.Einträge
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
                    Team.findByIdAndUpdate(req.params.id, {$pull: {Einträge: Eintrag}}, (err, doc)=>{
                        if (err) throw err;
                        //console.log("Deleted");
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
            res.render("teamCalendar", {
                name: req.user.name,
                TeamList: teams,
                Team: team,
                Einträge: JSON.stringify(Einträge),
                meineEinträge: meineEinträge,
                DefaultColor: req.user.Settings.DefaultColor
            })
            
        })
    })
})

router.post("/:id/Calendar", (req, res)=>{
    //Neuer Termin
    const newTermin = {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        backgroundColor: req.body.backgroundColor,
        author: req.user.name
    }
    Team.findByIdAndUpdate(req.params.id, {$addToSet: {Einträge: newTermin}}, (err, doc)=>{
        if (err) throw err;
        res.send("Posted");
    });
});

router.post("/:id/Calendar/deleteEntry", (req, res)=>{
    //Überprüfen ob die Anfrage vom Autor kommt
    if (req.body.author == req.user.name){
        //Authorisierung erfolgreich, die Löschanfrage kann durchgeführt werden
        Team.findByIdAndUpdate(req.params.id, {$pull: {Einträge: req.body}}, (err, doc)=>{
            if (err) throw err;
            res.send("Deleting Completed")
        })
    }else{
        //Unerwünschter Softwareangriff, der fremde Daten aus dem System löschen möchte
        req.flash("error_msg", "Für diese Aktion haben Sie nicht die erforderliche Berechtigung")
        res.redirect("/users/login");
    }
    
    
})

router.get("/:id/settings", ensureAuthenticated, (req, res)=>{
    Team.findById(req.params.id, (err, team)=>{
        if (team.Admin.includes(req.user.name)){
            //Seite wird gerendert, da es sich bei dem User (der die Request gemacht hat), um den Admin des Teames handelt
            Team.find({Members: req.user.name}, (err, teams)=>{
                res.render("teamSettings", {
                    name: req.user.name,
                    team: team,
                    TeamList: teams
                })
            })
        }else{
            req.flash("error_msg", "Sie haben hierzu keine Berechtigung. Loggen sie sich erneut ein")
            res.redirect("/users/login")

        }
        
    })
})

router.get("/:id", ensureAuthenticated,(req, res)=>{
    Team.findById(req.params.id, (err, team)=>{
        // console.log(team.Settings.NewEntrys)
        Team.find({Members: req.user.name}, (err, teams)=>{
            res.render("team", {
                name: req.user.name,
                team: team,
                TeamList: teams
            })
        })
    })
});

router.get("/:id/leave", ensureAuthenticated, (req, res)=>{
    //Team verlassen
    Team.findById(req.params.id, (err, team)=>{
        if (team){
            const Members = team.Members;
        if(Members.includes(req.user.name)){
        const Admins = team.Admin;
        if (Members.length == 1){
            //User is the only member --> The team will be deleted
            Team.findByIdAndDelete(req.params.id, (err, doc)=>{
                res.render("ServerMessages", {
                    type: "Completed",
                    message: "Team erfolgreich verlassen und gelöscht",
                    nextRoute: "/dashboard",
                    TeamList: []
                })
            })
        }else{
            //There are more Members than the User --> The team will not be deleted
            if (Admins.includes(req.user.name)){
                //The User is an Admin
                if(Admins.length > 1){
                    //There are more Amins --> The User can leave the team
                    Team.findByIdAndUpdate(req.params.id, {$pull: {Members: req.user.name}}, (err, doc)=>{
                        if (err) throw err;
                       Team.findByIdAndUpdate(req.params.id, {$pull: {Admin: req.user.name}},(err, doc)=>{
                        res.render("ServerMessages", {
                            type: "Completed",
                            message: "Team erfolgreich verlassen",
                            nextRoute: "/dashboard",
                            TeamList:[]
                        })
                       })
                    })
                }else{
                    //The User is the only admin --> The User can leave the team and the oldest (longest time in team) will be promoted to an admin automatically 
                    let NewAdmin;
                    if(Members[0] == req.user.name){
                        NewAdmin = Members[1];
                    }else{
                        NewAdmin = Members[0];
                    }
                    Team.findByIdAndUpdate(req.params.id, {$pull: {Members: req.user.name}}, (err, doc)=>{
                        if (err) throw err;
                       Team.findByIdAndUpdate(req.params.id, {Admin: [NewAdmin]},(err, doc)=>{
                        res.render("ServerMessages", {
                            type: "Completed",
                            message: "Team erfolgreich verlassen und neuen Admin bestimmt",
                            nextRoute: "/dashboard",
                            TeamList:[]
                        })
                       })
                    })
                    
                }
            }else{
                //The User is not an admin --> The User can leave the Team
                Team.findByIdAndUpdate(req.params.id, {$pull: {Members: req.user.name}}, (err, doc)=>{
                    res.render("ServerMessages", {
                        type: "Completed",
                        message: "Team erfolgreich verlassen",
                        nextRoute: "/dashboard",
                        TeamList: []
                    })
                })
            }
        }
        }else{
            req.flash("error_msg", "Ein unerwarteter Fehler ist aufgetreten");
            res.redirect("/users/login")
        }
        
        }else{
            //Reload nachdem Team bereits gelöscht wurde
            res.redirect("/dashboard")
        }
        
    });
});

router.post("/:id/settings", ensureAuthenticated, (req, res)=>{
    let AutomaticDeleteEntrys;
    const AutomaticDelete = req.body.AutomaticDeleteEntrys;
    if (AutomaticDelete == "true" ){
        AutomaticDeleteEntrys = true;
    }else{
        AutomaticDeleteEntrys = false;
    }


    Team.findByIdAndUpdate(req.params.id, {Settings: {AutomaticDeleteEntrys: AutomaticDeleteEntrys}}, (err,doc)=>{
        if (err) throw err
        res.send("Änderungen gespeichert");
    })
    
})



function getTimeDifference(Time){
    const DateNOW = Date.now();
    const Difference = Time-DateNOW;
    return Difference;
    // Wenn Difference >0 ist das Event in der Zukunft. Wenn Difference < 0 war das Event in der Vergangenheit
    //1000ms*60s*60min*24h*7Tage = 604.800.000 -> wenn -604.800.000 ist das ergebnis älter als eine woche 
}

//important Middleware
module.exports = router; 