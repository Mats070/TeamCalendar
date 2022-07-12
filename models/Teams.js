const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    Teamname: {
        type: String,
        required: true
    },
    Members: {
        type: Array,
        required: true
    },
    Einträge: {
        type: Array,
        default: []
    },
    Admin: {
        type: Array,
        required: true
    },
    Informations: {
        type: Object,
        default: {
            Notes: "", //Notizen können hier gespeichert werden
            creationDate: Date.now(),
            requested: []
        }
    },
    Settings: {
        type: Object,
        default: {
            AutomaticDeleteEntrys: false, // ||true, wenn alle Einträge die älter als sieben Tage sind gelöscht werden sollen
            NewEntrys: "E", // ||A for Admin
            NotesWritePermission: "A", // ||E for everyone
            TeamColorShortcuts: [], //Shortcuts die für das Team gelten
            ColorMemberRules: [] //Regeln, dass bestimmten Mitgliedern eine feste Farbe zugewiesen wird
        }
    },
    Mitteilungen:{
        type: Object,
        default: {
            Messages: [],
            todos: []
        }
    }
})

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;