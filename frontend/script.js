const container = document.getElementById("projectContainer");
const reviewedContainer = document.getElementById("reviewedProjects");
const API_BASE_URL = window.API_BASE_URL || "";

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const projects = await response.json();

        // Counts
        const reviewedCount = projects.filter(
            p => (p.status || "").toLowerCase() === "reviewed"
        ).length;

        const pendingCount = projects.length - reviewedCount;

        // Dashboard update
        document.getElementById("totalProjects").textContent =
            projects.length;

        document.getElementById("reviewedProjectsCount").textContent =
            reviewedCount;

        document.getElementById("pendingProjectsCount").textContent =
            pendingCount;

        // Clear UI
        container.innerHTML = "";
        reviewedContainer.innerHTML = "";

        // Render projects
        projects.forEach(project => {

            container.innerHTML += `
                <div class="project-card">

                    <div class="card-header">
                        <h3>${project.projectTitle}</h3>
                        <span class="status">
                            ${project.status || "Pending Review"}
                        </span>
                    </div>

                    <div class="info">
                        <p><strong>Student:</strong> ${project.studentName}</p>
                        <p><strong>Technology:</strong> ${project.technology}</p>
                        <p><strong>Grade:</strong> ${project.grade || "Not Graded"}</p>
                    </div>

                    <select id="grade-${project._id}">
                        <option value="">Select Grade</option>
                        <option>A+</option>
                        <option>A</option>
                        <option>B+</option>
                        <option>B</option>
                        <option>C</option>
                    </select>

                    <textarea id="feedback-${project._id}" placeholder="Enter Feedback"></textarea>

                    <button onclick="updateProject('${project._id}')">
                        Update Review
                    </button>

                </div>
            `;

            // Reviewed section
            if (project.status === "Reviewed") {
                reviewedContainer.innerHTML += `
                    <div class="project-card">

                        <h3>${project.projectTitle}</h3>

                        <p><strong>Student:</strong> ${project.studentName}</p>
                        <p><strong>Technology:</strong> ${project.technology}</p>
                        <p><strong>Grade:</strong> ${project.grade}</p>
                        <p><strong>Feedback:</strong> ${project.feedback}</p>

                    </div>
                `;
            }
        });

    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

async function updateProject(id) {

    const grade = document.getElementById(`grade-${id}`).value;
    const feedback = document.getElementById(`feedback-${id}`).value;

    // 🚨 VALIDATION CHECK
    if (!grade || !feedback.trim()) {
        alert("Please select grade and enter feedback before submitting.");
        return; // stop execution
    }

    await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            grade,
            feedback,
            status: "Reviewed"
        })
    });

    alert("Review Updated Successfully");
    loadProjects();
}
// initial load
loadProjects();
