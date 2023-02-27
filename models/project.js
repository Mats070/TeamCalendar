const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        default: [],
    }
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;