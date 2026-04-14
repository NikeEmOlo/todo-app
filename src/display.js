import "./tasks.css"
import { addTask, allTasks, deleteTaskData } from "./tasks.js";
import trashIcon from "./assets/images/icon_trash.svg"

let activeTab = "tasks";

// -------CREATING ELEMENTS------------//
class Element {
    constructor(tag, classNames = [], attributes = {}) {
        this.el = document.createElement(tag);
        classNames.forEach(className => this.el.classList.add(className));
        Object.entries(attributes).forEach(([key, value]) => this.el.setAttribute(key, value));
    }

    append(child){
        this.el.append(child.el)
        return this
    }

    appendTo(parent) {
        const parentEl = parent.el ?? parent;
        parentEl.appendChild(this.el);
        return this;
    }
}

class Div extends Element {
  constructor(classNames = [], attributes = {}) {
    super('div', classNames, attributes);
  }
}

class Input extends Element {
    constructor(classNames = [], attributes = {}) {
        super('input', classNames, attributes);
    }

}

class Label extends Element {
    constructor(text, classNames = [], attributes = {}) {
        super('label', classNames, attributes)
        this.el.textContent = text
    }
}

class Button extends Element {
  constructor(content, classNames = [], attributes = {}, onClick = null) {
    super('button', classNames, attributes);
    
    if (typeof content === 'string') {
      this.el.textContent = content;
    } else {
      this.el.appendChild(content.el);
    }

    if (onClick) {
        this.el.addEventListener('click', onClick)
    }
  }
}

class Text extends Element {
  constructor(tag, text, classNames = [], attributes = {}) {
    super(tag, classNames, attributes);
    this.el.textContent = text;
  }
}

class TaskCard extends Div {
    constructor(task) {
        super(['task-card'], {'data-id': task.id})

        this.checkbox = new Input(['checkbox'], {type: 'checkbox'})
        this.checkbox.el.id = `checkbox-${task.id}`
        this.append(this.checkbox)

        this.label = new Label(task.title, ['task-label'], {for: `checkbox-${task.id}`})
        this.append(this.label)

        const deleteIcon = new Element("img", [], {src: trashIcon, alt: "delete", id: "delete-btn-img"})
        this.deleteButton = new Button(deleteIcon, [], {id: "delete-task-btn"})
        this.append(this.deleteButton)

        this.taskInfoWrapper = new Div(['task-info-wrap'])
        this.append(this.taskInfoWrapper)

        //append the following to taskInfoWrap
        this.projectTag = new Div(['tag'])
        this.projectTag.el.textContent = task.project;
        this.projectTag.appendTo(this.taskInfoWrapper)

        this.timestamp = new Button(new Text('h6', `Due: ${task.displayDate}`, ['muted']), ['tag', 'minimal'])
        this.timestamp.appendTo(this.taskInfoWrapper)

        this.el.addEventListener("click", (e) => taskCardHandler(e, task.id));
    }


}

//=======INITIATE FUNCTION======//
function initTabs() {
    const tabs = {
        tasks: document.querySelector("#tasks-tab"),
        projects: document.querySelector("#projects-tab"),
        completed: document.querySelector("#completed-tab"),
    }
    const tabButtons = document.querySelectorAll(".tab-button")
    const sidebarBtn = document.querySelector(".sb-button")
    const tabConfig = {
        Tasks: {
            active: "tasks",
            tab: "#tasks-tab",
            btnLabel: "Add Task",
            onClick: () => {
                document.querySelector("#add-task-modal").showModal()
            },
        },
        Projects: {
            active: "projects",
            tab: "#projects-tab",
            btnLabel: "Add Project",
            onClick: () => document.querySelector("#add-project-modal").showModal(),
        },
        Completed: {
            active: "completed",
            tab: "#completed-tab",
            btnLabel: "Add Task",
            onClick: () => document.querySelector("#add-task-modal").showModal(),
        },
    }

    Object.values(tabs).forEach(tab => tab.style.display = "none")
    tabs.tasks.style.display = "flex";
    sidebarBtn.onclick = tabConfig.Tasks.onClick;

    tabButtons.forEach(element => {
        element.addEventListener("click", (e) => {
            tabController(e, tabs, sidebarBtn, tabConfig)})
    });

    
    allTasks.forEach(task => displayTask(task)) //Load existing tasks

    // SET UP MODAL BUTTONS
    document.querySelector("#task-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#project-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#close-task-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
    document.querySelector("#close-project-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
}

function tabController(e, tabs, sidebarBtn, tabConfig) { 
    const config = tabConfig[e.currentTarget.textContent]
    activeTab = config.active
    Object.values(tabs).forEach(tab => tab.style.display = 'none');
    document.querySelector(config.tab).style.display = 'flex';

    sidebarBtn.textContent = config.btnLabel;
    sidebarBtn.onclick = config.onClick;
}

function taskCardHandler(e, taskID) {
    if (e.target.id === "delete-btn-img") {
        deleteTaskData(taskID)
        document.querySelector(`[data-id="${taskID}"]`).remove()
    }
}

//=====================PROJECT AND TASK FORMS========================//
function handleFormSubmit(e) {
    e.preventDefault();
    let form = e.currentTarget;
    let taskData = cleanFormData(form);
    form.reset();
    form.closest("dialog").close();
    addTask(taskData);
    console.log(taskData)
}

function cleanFormData(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
   
    if (data.project) {
        data.project = "#" + data.project.toLowerCase().split(" ").join("-");
    } else {
        data.project = "#general"
    }
    return data;
}

function calcRelativeDate(task) {
    const due = new Date(task.dueDate).toDateString();
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();

    if (due === today) {
        task.displayDate = "Today"
    } else if (due === tomorrow) {
        task.displayDate = "Tomorrow"
    }

    return;
}

function displayTask(task) {
    calcRelativeDate(task)
    new TaskCard(task).appendTo(document.querySelector('.tasks-s1'));
}


export {
    displayTask,
    initTabs,
}