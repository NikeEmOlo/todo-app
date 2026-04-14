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
    saveToLocal("tasks", allTasks)
    displayElement(task, ".tasks-s1")
}

function deleteTaskData(taskID) {
    allTasks = allTasks.filter(task => task.id !== taskID);
    saveToLocal("tasks", allTasks)
}

function buildAllTasks() {
    return loadFromLocal("tasks").map(data => new Task(data)) || [];
}


//moved to bottom to allow use of Task class
let allTasks = buildAllTasks();

export {
    addTask,
    allTasks,
    deleteTaskData,
}