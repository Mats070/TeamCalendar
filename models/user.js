const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    PersönlicheEinträge: {
        type: Array,
        default: []
    },
    PersönlicheTodos:{
        type: Array,
        default: []
    },
    Settings:{
        type: Object,
        default: {
            AutomaticDeleteEntrys: false, // ||true, wenn alle Einträge die älter als sieben Tage sind gelöscht werden sollen
            StandardView: "Month", // ||Week||Day||List
            StandardViewMobileDevice: "Week", // ||Day||List
            DefaultColor: "#000000", //  ||jede beliebige andere Farbe
            ZeitzonePersonalCalendar: "de", //Alternativen: beliebte Zeitzonen
            PersonalColorShortcuts: [] //Kann mit Persönlichen Farb Shortcuts aufgefüllt werden
        }
    },
    Informations: {
        type: Object,
        default: {
            validated: false, //nach Email-Validation true (Account dann freigeschaltet). Kann bei "Kontoverlust" wieder auf false gesetzt werden
            ValidationCode: undefined, //aktueller Validation Code wird hier gespeichert
            introduced: false, //wird "true", wenn man sich registriert hat und sich nun die Introuction angeschaut hat.
            TeamRequests: [], //Team Anfragen, werden in diesem Array gespeichert und können angenommen oder abgelehnt werden
            finishedToDos: [], //wird bei jedem erledigten ToDo um das neue abgeschlossene erhöt
            LAST_LOGIN: ""
        }
    },
    USERINFORMATIONS:{
        type: Object,
        default: {}
    },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;