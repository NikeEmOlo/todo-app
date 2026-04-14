import {saveToLocal, loadFromLocal} from "./storage.js";
import { displayTask } from "./display.js";

// // VARIABLES
let allTasks = loadFromLocal("tasks");

class Task {
    constructor({task, description, dueDate, project}) {
        this.title = task;
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
    }
}

function addTask(taskData) {
    const task = new Task(taskData);
    allTasks.push(task);
    saveToLocal("tasks", allTasks)
    displayTask(task)
}

function deleteTaskData(taskID) {
    allTasks = allTasks.filter(task => task.id !== taskID);
}

export {
    addTask,
    allTasks,
    deleteTaskData,
}