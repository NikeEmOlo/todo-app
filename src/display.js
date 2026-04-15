import "./tasks.css"
import { addTask, allTasks, deleteTaskData } from "./tasks.js";
import trashIcon from "./assets/images/icon_trash.svg";
import downCaret from "./assets/images/icon_caret_down.svg"
import upCaret from "./assets/images/icon_caret_up.svg";

let activeTab = "tasks";

// -------CREATING ELEMENTS------------//
class Element {
    constructor(tag, classNames = [], attributes = {}) {
        this.el = document.createElement(tag);
        classNames.forEach(className => this.el.classList.add(className));
        Object.entries(attributes).forEach(([key, value]) => this.el.setAttribute(key, value));
    }

    append(...children){
        children.forEach(child => this.el.append(child.el))
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

        //------title container (checkbox, title, expand button)------//
        this.titleContainer = new Div(['title-container'])
        this.checkbox = new Input(['checkbox'], {type: 'checkbox'})
        this.checkbox.el.id = `checkbox-${task.id}`
        this.label = new Label(task.title, ['task-label'], {for: `checkbox-${task.id}`})
        this.expandBtnWrapper = new Div(['expand-wrapper'])
        this.expandBtn = new Button("See more", ["expand-btn", "muted"], {})
        this.expandIcon = new Element("img", ["expand-icon"], {src: downCaret})
        this.expandBtnWrapper.append(this.expandBtn, this.expandIcon)
        this.titleContainer.append(this.checkbox, this.label, this.expandBtnWrapper)

        //------description container------//
        this.description = new Text("p", task.description, ["description"], {hidden: true})

        //------task info wrapper (project tag, timestamp, trash button)------//
        this.taskInfoWrapper = new Div(['task-info-wrap'])
        this.projectTag = new Div(['tag'])
        this.projectTag.el.textContent = task.project;
        this.timestamp = new Button(new Text('h6', `Due: ${task.displayDate}`, ['muted']), ['tag', 'minimal'])
        this.deleteIcon = new Element("img", ["delete-btn-img"], {src: trashIcon, alt: "delete"})
        this.deleteButton = new Button(this.deleteIcon, [], {id: "delete-task-btn"})
        this.deleteButton.append(this.deleteIcon)
        this.taskInfoWrapper.append(this.projectTag, this.timestamp, this.deleteButton)

        //------APPEND TO TASK CARD------//
        this.append(this.titleContainer, this.description, this.taskInfoWrapper)

        //------Event listeners------//
        this.el.addEventListener("click", (e) => taskCardHandler(e, this));
        this.checkbox.el.addEventListener("change", () => {
            task.toggleComplete() 
                ? this.appendTo(document.querySelector(".completed-s1")) 
                : this.appendTo(document.querySelector(".tasks-s1"))
        })
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

    
    allTasks.forEach(task => task.complete 
        ? displayElement(task, ".completed-s1")
        : displayElement(task, ".tasks-s1"))
    


    // SET UP MODALS
    document.querySelector("#task-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#project-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#close-task-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
    document.querySelector("#close-project-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
    document.querySelector('#due-date').min = new Date().toISOString().slice(0, 10);
}

//=======USER ACTION HANDLERS=====//
function tabController(e, tabs, sidebarBtn, tabConfig) { 
    const config = tabConfig[e.currentTarget.textContent]
    activeTab = config.active
    Object.values(tabs).forEach(tab => tab.style.display = 'none');
    document.querySelector(config.tab).style.display = 'flex';

    sidebarBtn.textContent = config.btnLabel;
    sidebarBtn.onclick = config.onClick;
}

function taskCardHandler(e, taskCard) {
    const el = e.target

    // delete
    if (el.classList.contains("delete-btn-img")) {
        const taskID = taskCard.dataset.id
        deleteTaskData(taskID)
        taskCard.remove()
        return
    }

    // expand
    const expandWrapper = el.closest(".expand-wrapper")
    if (expandWrapper) {
        const description = taskCard.description.el
        const isOpen = expandWrapper.classList.toggle("open")
        if (isOpen) {
            taskCard.expandBtn.el.textContent = "See less"
            taskCard.expandIcon.el.src = upCaret
        } else {
            taskCard.expandBtn.el.textContent = "See more"
            taskCard.expandIcon.el.src = downCaret
        }
        description.hidden = !isOpen
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

function displayElement(task, location) {
    calcRelativeDate(task)
    new TaskCard(task).appendTo(document.querySelector(location));
}

export {
    displayElement,
    initTabs,
}