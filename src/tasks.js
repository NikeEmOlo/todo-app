import {saveToLocal} from "./storage.js";
import { displayTask } from "./display.js";

// // VARIABLES
let allTasks = []


function addTask(taskData) {
    const task = new Task(taskData);
    allTasks.push(task);
    saveToLocal("tasks", allTasks);
    displayTask(task)
}

class Task {
    constructor({task, description, dueDate, project}) {
        this.title = task;
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