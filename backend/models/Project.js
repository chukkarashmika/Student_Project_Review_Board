const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        studentName: {
            type: String,
            required: true
        },
        studentEmail: {
            type: String,
            required: true,
            lowercase: true
        },
        studentQualification: {
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
        description: {
            type: String,
            default: ""
        },
        screenshots: [
            {
                name: {
                    type: String,
                    default: "Project screenshot"
                },
                dataUrl: {
                    type: String,
                    required: true
                }
            }
        ],
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
            enum: ["Pending", "Reviewed"],
            default: "Pending"
        },
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        mentorName: {
            type: String,
            default: ""
        },
        mentorQualification: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);
