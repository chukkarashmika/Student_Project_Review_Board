const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const User = require("../models/User");

router.post("/", async (req, res) => {
    try {
        const {
            studentId,
            studentName,
            studentEmail,
            studentQualification,
            projectTitle,
            technology,
            description
        } = req.body;

        if (
            !studentId ||
            !studentName ||
            !studentEmail ||
            !studentQualification ||
            !projectTitle ||
            !technology
        ) {
            return res.status(400).json({
                message: "Student and project details are required"
            });
        }

        const project = await Project.create({
            studentId,
            studentName,
            studentEmail,
            studentQualification,
            projectTitle,
            technology,
            description
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const { role, studentId } = req.query;
        const filter = {};

        if (role === "student") {
            if (!studentId) {
                return res.status(400).json({
                    message: "studentId is required"
                });
            }

            filter.studentId = studentId;
        }

        const projects = await Project.find(filter).sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put("/:id/review", async (req, res) => {
    try {
        const { facultyId, grade, feedback } = req.body;

        if (!facultyId || !grade || !feedback) {
            return res.status(400).json({
                message: "Faculty, grade, and feedback are required"
            });
        }

        const mentor = await User.findById(facultyId);

        if (!mentor || mentor.role !== "faculty") {
            return res.status(403).json({
                message: "Only faculty or mentors can review projects"
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {
                grade,
                feedback,
                status: "Reviewed",
                mentorId: mentor._id,
                mentorName: mentor.name,
                mentorQualification: mentor.qualification
            },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);

        res.json({
            message: "Project deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
