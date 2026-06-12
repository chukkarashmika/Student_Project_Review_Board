const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },

    projectTitle: {
        type: String,
        required: true
    },

    technology: {
        type: String,
        required: true
    },

    grade: {
        type: String,
        default: "Not Graded"
    },

    feedback: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "Pending"
    }
});

module.exports = mongoose.model("Project", projectSchema);