const API_BASE_URL = window.API_BASE_URL || "";
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const uploadForm = document.getElementById("uploadForm");
const adminPanel = document.getElementById("adminPanel");
const projectContainer = document.getElementById("projectContainer");
const userContainer = document.getElementById("userContainer");

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

function getSelectedRole(name) {
    return document.querySelector(`input[name="${name}"]:checked`).value;
}

function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    renderApp();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    renderApp();
}

async function registerUser(event) {
    event.preventDefault();

    try {
        const user = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: document.getElementById("registerName").value.trim(),
                email: document.getElementById("registerEmail").value.trim(),
                qualification: document.getElementById("registerQualification").value.trim(),
                password: document.getElementById("registerPassword").value,
                role: getSelectedRole("registerRole")
            })
        });

        alert("Account created successfully");
        setCurrentUser(user);
        event.target.reset();
    } catch (error) {
        alert(error.message);
    }
}

async function loginUser(event) {
    event.preventDefault();

    try {
        const user = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value.trim(),
                password: document.getElementById("loginPassword").value,
                role: getSelectedRole("loginRole")
            })
        });

        setCurrentUser(user);
        event.target.reset();
    } catch (error) {
        alert(error.message);
    }
}

async function uploadProject(event) {
    event.preventDefault();

    try {
        await apiRequest("/api/projects", {
            method: "POST",
            body: JSON.stringify({
                studentId: currentUser._id,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                studentQualification: currentUser.qualification,
                projectTitle: document.getElementById("projectTitle").value.trim(),
                technology: document.getElementById("technology").value.trim(),
                description: document.getElementById("description").value.trim()
            })
        });

        alert("Project submitted successfully");
        event.target.reset();
        loadProjects();
    } catch (error) {
        alert(error.message);
    }
}

async function reviewProject(projectId) {
    const grade = document.getElementById(`grade-${projectId}`).value;
    const feedback = document.getElementById(`feedback-${projectId}`).value.trim();

    if (!grade || !feedback) {
        alert("Please select grade and enter feedback");
        return;
    }

    try {
        await apiRequest(`/api/projects/${projectId}/review`, {
            method: "PUT",
            body: JSON.stringify({
                facultyId: currentUser._id,
                grade,
                feedback
            })
        });

        alert("Project reviewed successfully");
        loadProjects();
    } catch (error) {
        alert(error.message);
    }
}

function updateCounts(projects) {
    const reviewedCount = projects.filter(project => project.status === "Reviewed").length;
    const pendingCount = projects.length - reviewedCount;

    document.getElementById("totalProjects").textContent = projects.length;
    document.getElementById("reviewedProjectsCount").textContent = reviewedCount;
    document.getElementById("pendingProjectsCount").textContent = pendingCount;
}

function projectDetails(project) {
    return `
        <p><strong>Student:</strong> ${project.studentName}</p>
        <p><strong>Student Email:</strong> ${project.studentEmail}</p>
        <p><strong>Student Qualification:</strong> ${project.studentQualification}</p>
        <p><strong>Technology:</strong> ${project.technology}</p>
        <p><strong>Description:</strong> ${project.description || "No description added"}</p>
        <p><strong>Grade:</strong> ${project.grade || "Not Graded"}</p>
        <p><strong>Feedback:</strong> ${project.feedback || "Not reviewed yet"}</p>
        <p><strong>Mentor:</strong> ${project.mentorName || "Not assigned"}</p>
        <p><strong>Mentor Qualification:</strong> ${project.mentorQualification || "Not available"}</p>
    `;
}

function renderStudentProject(project) {
    return `
        <article class="project-card">
            <div class="card-header">
                <h3>${project.projectTitle}</h3>
                <span class="status ${project.status === "Reviewed" ? "reviewed" : ""}">
                    ${project.status}
                </span>
            </div>
            <div class="info">
                ${projectDetails(project)}
            </div>
        </article>
    `;
}

function renderFacultyProject(project) {
    const reviewControls = project.status === "Reviewed"
        ? `<p class="review-note">Reviewed by ${project.mentorName}</p>`
        : `
            <select id="grade-${project._id}">
                <option value="">Select Grade</option>
                <option>A+</option>
                <option>A</option>
                <option>B+</option>
                <option>B</option>
                <option>C</option>
            </select>
            <textarea id="feedback-${project._id}" placeholder="Enter feedback"></textarea>
            <button onclick="reviewProject('${project._id}')">Submit Review</button>
        `;

    return `
        <article class="project-card">
            <div class="card-header">
                <h3>${project.projectTitle}</h3>
                <span class="status ${project.status === "Reviewed" ? "reviewed" : ""}">
                    ${project.status}
                </span>
            </div>
            <div class="info">
                ${projectDetails(project)}
            </div>
            ${reviewControls}
        </article>
    `;
}

async function loadProjects() {
    const query = currentUser.role === "student"
        ? `?role=student&studentId=${currentUser._id}`
        : `?role=faculty`;

    try {
        const projects = await apiRequest(`/api/projects${query}`);

        updateCounts(projects);

        if (!projects.length) {
            projectContainer.innerHTML = `<p class="empty-state">No projects found.</p>`;
            return;
        }

        projectContainer.innerHTML = projects
            .map(project => currentUser.role === "student"
                ? renderStudentProject(project)
                : renderFacultyProject(project))
            .join("");
    } catch (error) {
        alert(error.message);
    }
}

async function loadUsers() {
    if (currentUser.role !== "faculty") {
        return;
    }

    try {
        const users = await apiRequest("/api/auth");

        userContainer.innerHTML = users.map(user => `
            <article class="user-card">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Qualification:</strong> ${user.qualification}</p>
            </article>
        `).join("");
    } catch (error) {
        alert(error.message);
    }
}

function renderApp() {
    const isLoggedIn = Boolean(currentUser);

    authSection.classList.toggle("hidden", isLoggedIn);
    appSection.classList.toggle("hidden", !isLoggedIn);
    logoutBtn.classList.toggle("hidden", !isLoggedIn);

    if (!isLoggedIn) {
        welcomeText.textContent = "Login to continue";
        return;
    }

    welcomeText.textContent = `${currentUser.name} | ${currentUser.role}`;
    uploadForm.classList.toggle("hidden", currentUser.role !== "student");
    adminPanel.classList.toggle("hidden", currentUser.role !== "faculty");
    document.getElementById("projectListTitle").textContent =
        currentUser.role === "student" ? "My Projects" : "Projects To Review";

    loadProjects();
    loadUsers();
}

document.getElementById("registerForm").addEventListener("submit", registerUser);
document.getElementById("loginForm").addEventListener("submit", loginUser);
uploadForm.addEventListener("submit", uploadProject);

renderApp();
