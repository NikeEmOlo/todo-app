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

function addProject(projectName) {
    allProjects.push(projectName)
    saveToLocal("projects", allProjects)
}

function deleteTaskData(taskID) {
    allTasks = allTasks.filter(task => task.id !== taskID);
    saveToLocal("tasks", allTasks)
}

function deleteProject(e) {
    let projects = getProjects()
    let projectID = e.target.closest(".project-card").dataset.id

    let removeAllTasks = () => {
        allTasks = allTasks.filter(task => task.project !== projectID)
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
        projectCount[task.project] = (projectCount[task.project] || 0) + 1;
        return projectCount;
    }, {});

    const sortAlphabetical = Object.fromEntries(
        Object.entries(tasksPerProject).sort(([a], [b]) => a.localeCompare(b))
    );

    let emptyProjects = [];
    projects.forEach(project => {
        if (!(project in sortAlphabetical)) {
            emptyProjects.push(project)
        }
    })
    emptyProjects.sort((a, b) => a.localeCompare(b))
    emptyProjects.forEach((project) => {
        sortAlphabetical[project] = 0
    })

    return sortAlphabetical
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
    getProjects,
    buildAllTasks,
}