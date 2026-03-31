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
    Task,
}