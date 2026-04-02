import {saveToLocal} from "./storage.js";
import { displayTask } from "./display.js";

// // VARIABLES
let allTasks = []


function addTask(name, description, dueDate, project) {
    const task = new Task(name, description, dueDate, project);
    allTasks.push(task);
    saveToLocal("tasks", allTasks);
    displayTask(task)
}

class Task {
    constructor(name, description, dueDate, project) {
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.project = project;
        this.id = crypto.randomUUID();
    }

    deleteTask() {
        //logic to delete a task
    }

    expandTask() {
        //logic to expand task and show more detailed view
    }

    editDueDate() {
        //logic to edit the due date
    }

    editProject() {
        //logic to edit the project it belongs to
    }

    editDescription() {
        //logic to allow user to update the description
    }
}

export {
    addTask,
}