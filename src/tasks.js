import {saveToLocal, loadFromLocal} from "./storage.js";
import { displayElement } from "./display.js";

class Task {
    constructor({title, description, dueDate, project}) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.project = project;
        this.id = crypto.randomUUID();
        this.complete = false;
        this.displayDate = new Date(dueDate).toLocaleDateString(navigator.language, {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    toggleComplete() {
        this.complete = !this.complete;
        return this.complete
    }
}

function addTask(taskData) {
    const task = new Task(taskData);
    allTasks.push(task);
    
    if (!allProjects.includes(task.project)) {
        addProject(task.project)
    }
    saveToLocal("tasks", allTasks)
    displayElement(task, ".tasks-s1")
}

const _storedColors = loadFromLocal("projectColors")
let projectColors = Array.isArray(_storedColors) ? {} : (_storedColors || {})

function addProject(projectName) {
    allProjects.push(projectName)
    saveToLocal("projects", allProjects)
}

function setProjectColor(projectName, color) {
    projectColors[projectName] = color
    saveToLocal("projectColors", projectColors)
}

function getProjectColor(projectName) {
    if (projectName === "#general") return "#999999"
    return projectColors[projectName] || "#999999"
}

function hasProjectColor(projectName) {
    return projectName in projectColors
}

function renameProject(oldName, newName) {
    allProjects = allProjects.map(p => p === oldName ? newName : p)
    allTasks.forEach(task => { if (task.project === oldName) task.project = newName })
    projectColors[newName] = projectColors[oldName]
    delete projectColors[oldName]
    saveToLocal("projects", allProjects)
    saveToLocal("tasks", allTasks)
    saveToLocal("projectColors", projectColors)
}

function deleteTaskData(taskID) {
    const idx = allTasks.findIndex(task => task.id === taskID);
    if (idx !== -1) allTasks.splice(idx, 1);
    saveToLocal("tasks", allTasks)
}

function deleteProject(e) {
    let projects = getProjects()
    let projectID = e.target.closest(".project-card").dataset.id

    let removeAllTasks = () => {
        const toRemove = allTasks.filter(task => task.project === projectID).map(t => t.id)
        toRemove.forEach(id => { const i = allTasks.findIndex(t => t.id === id); if (i !== -1) allTasks.splice(i, 1) })
        saveToLocal("tasks", allTasks)
    }

    let removeProject = () => {
        allProjects = allProjects.filter(project => project !== projectID)
        saveToLocal("projects", allProjects)
    }
    
    if (projects[projectID] > 0) {
        if(confirm("This project still has tasks assigned to it. If you continue, all tasks in the project will be deleted. Are you sure you want to delete this project?")){
            removeAllTasks()
            removeProject()
        }
    } else {
        removeProject()
    }
}

function buildAllTasks() {
    return loadFromLocal("tasks").map(data => new Task(data)) || [];
}

function getProjects() {
    let projects = loadFromLocal("projects")
    let taskList = buildAllTasks()

    const tasksPerProject = taskList.reduce((projectCount, task) => {
        if (!task.complete) projectCount[task.project] = (projectCount[task.project] || 0) + 1;
        return projectCount;
    }, {});

    projects.forEach(project => {
        if (!(project in tasksPerProject)) tasksPerProject[project] = 0
    })

    return Object.fromEntries(
        Object.entries(tasksPerProject).sort(([a, countA], [b, countB]) =>
            countB - countA || a.localeCompare(b)
        )
    )
}   

//moved to bottom to allow use of Task class
let allTasks = buildAllTasks();
let allProjects = loadFromLocal("projects") || []

export {
    addTask,
    allTasks,
    addProject,
    deleteTaskData,
    deleteProject,
    renameProject,
    getProjects,
    getProjectColor,
    hasProjectColor,
    setProjectColor,
    buildAllTasks,
}