const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
router.post("/", async (req, res) => {
    try {

        console.log(req.body);

        const project = await Project.create(req.body);

        res.status(201).json(project);

    } catch (error) {

        console.log("ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }
});
router.get("/", async (req, res) => {

    const projects = await Project.find();

    res.json(projects);

});
router.put("/:id", async (req, res) => {

    try {
req.body.status = "Reviewed";
        const updatedProject =
            await Project.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

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
            message: "Project Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
module.exports = router;
