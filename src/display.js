import "./tasks.css"
import "./projects.css"
import { addTask, addProject, allTasks, deleteTaskData, getProjects, deleteProject, renameProject, getProjectColor, hasProjectColor, setProjectColor } from "./tasks.js";

const palette = [
    "#0055CC", "#007AFF", "#3395FF", "#66B0FF",
    "#006675", "#009AB0", "#007A99",
    "#6D2280", "#A758B1", "#BC7DC4",
    "#006875", "#00869E", "#00CCDD",
]

function randomColor() {
    return palette[Math.floor(Math.random() * palette.length)]
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
import trashIcon from "./assets/images/icon_trash.svg";
import downCaret from "./assets/images/icon_caret_down.svg"
import upCaret from "./assets/images/icon_caret_up.svg";
import pencilIcon from "./assets/images/icon_edit_pencil.svg";

let activeTab = "tasks";
let switchToTab = null;

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
        const projectColor = getProjectColor(task.project)
        this.projectTag.el.style.color = projectColor
        this.projectTag.el.style.backgroundColor = hexToRgba(projectColor, 0.15)
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
            refreshExpandedProject()
            updateTaskCounts()
            loadSidebar()
            loadProjectsTab()
        })
    }


}

class ProjectCard extends Div {
    constructor(project, count) {
        super(['project-card'], {'data-id': project})

        this.titleRow = new Div(["project-card-title-row"])
        this.title = new Text("h2", project, ["project-card-title", "lighter-txt"])
        this.taskCount = new Text("h2", count, ["project-card-count", "lighter-txt"])
        this.countTag = new Text("div", count, ["tag", "project-card-count-tag"])
        this.pencil = new Element("img", ["project-card-pencil"], {src: pencilIcon, alt: "edit"})
        this.pencil.el.style.display = "none"
        this.titleRow.append(this.title, this.taskCount, this.countTag, this.pencil)

        this.deleteIcon = new Element("img", ["delete-btn-img"], {src: trashIcon, alt: "delete"})
        this.deleteProjectBtn = new Button(this.deleteIcon, ["delete-project-btn"], {},)
        this.deleteProjectBtn.el.style.display = "none"

        this.deleteProjectBtn.append(this.deleteIcon)
        this.bottomRow = new Div(["project-card-bottom"])
        this.bottomRow.append(this.deleteProjectBtn)
        this.taskListContainer = new Div(["project-task-list"])
        this.addTaskBtn = new Button("+ Add Task", ["project-add-task-btn"])
        this.addTaskBtn.el.addEventListener("click", (e) => {
            e.stopPropagation()
            document.querySelector("#project").value = project.slice(1)
            document.querySelector("#add-task-modal").showModal()
        })
        this.append(this.titleRow, this.bottomRow, this.taskListContainer, this.addTaskBtn)

        this.el.addEventListener("click", projectCardHandler)
    }
}

//=======INITIATE FUNCTION======//
function initTabs() {
    //======variables======//
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
            onClick: () => {
                document.querySelector("#add-task-modal").showModal();
            },
        },
    }

    //===========load initial display=============//
    Object.values(tabs).forEach(tab => tab.style.display = "none")
    tabs.tasks.style.display = "flex";
    sidebarBtn.onclick = tabConfig.Tasks.onClick;

    tabButtons.forEach(element => {
        element.addEventListener("click", (e) => {
            tabController(e, tabs, sidebarBtn, tabConfig)})
    });

    switchToTab = (tabName) => {
        const config = tabConfig[tabName]
        activeTab = config.active
        Object.values(tabs).forEach(tab => tab.style.display = "none")
        document.querySelector(config.tab).style.display = "flex"
        sidebarBtn.textContent = config.btnLabel
        sidebarBtn.onclick = config.onClick
    }

    Object.keys(getProjects()).forEach(project => {
        if (!hasProjectColor(project)) setProjectColor(project, randomColor())
    })
    loadSidebar();
    loadProjectsTab();
    updateTaskCounts();

    sortByDueDate(allTasks).forEach(task => task.complete
        ? displayElement(task, ".completed-s1")
        : displayElement(task, ".tasks-s1"))
    


    // SET UP MODALS
    document.querySelector("#task-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#project-form").addEventListener("submit", handleFormSubmit);
    document.querySelector("#close-task-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
    document.querySelector("#close-project-btn").addEventListener("click", (e) => e.target.closest("dialog").close());
    document.querySelector('#due-date').min = new Date().toISOString().slice(0, 10);
    const descriptionField = document.querySelector('#task-description')
    descriptionField.addEventListener('input', () => {
        descriptionField.style.height = 'auto'
        descriptionField.style.height = descriptionField.scrollHeight + 'px'
    })
    document.querySelector(".edit-projects-btn").addEventListener("click", editProjects)
    setProjectOptions()
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
        const taskID = taskCard.el.dataset.id
        const taskList = taskCard.el.closest(".project-task-list")
        deleteTaskData(taskID)
        taskCard.el.remove()
        refreshExpandedProject()
        if (taskList) refreshTasksList()
        updateTaskCounts()
        loadSidebar()
        return
    }

    // expand description
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

    if (form === document.querySelector("#project-form")) {
        addProject(taskData.project)
        setProjectColor(taskData.project, randomColor())
    } else {
        const isNewProject = !Object.keys(getProjects()).includes(taskData.project)
        addTask(taskData)
        if (isNewProject) setProjectColor(taskData.project, randomColor())
        refreshTasksList()
    }
    
    loadSidebar()
    setProjectOptions()
    loadProjectsTab()
    updateTaskCounts()
}

function cleanFormData(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
   
    if (data.project) {
        data.project = "#" + data.project.replace(/^#+/, "").toLowerCase().split(" ").join("-");
    } else {
        data.project = "#general"
    }
    return data;
}

//=====================Task card display================================//
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

//====================Projects display=======================================//
function loadSidebar() {
    let projects = getProjects()
    const projectsInSidebar = document.querySelectorAll(".sb-txt-wrap")
    const sidebarContent = document.querySelector("#sb-content")
    const sidebarBtn = document.querySelector(".sb-button")

    //clear sidebar
    projectsInSidebar.forEach(wrapper => {
            wrapper.remove()
        })
    
    if (Object.keys(projects).length > 0) {
        Object.entries(projects).forEach(([project, count]) => {
            const wrapper = new Div(["sb-txt-wrap"])
            const projectName = new Text("h5", `${project}`, ["project-name"])
            projectName.el.style.color = getProjectColor(project)
            const projectCount = new Text("h5", `${count}`, ["project-count"])
            wrapper.el.append(projectName.el, projectCount.el)
            wrapper.el.addEventListener("click", () => {
                if (switchToTab) switchToTab("Projects")
                expandProject(project)
            })
            sidebarContent.insertBefore(wrapper.el, sidebarBtn)
        })
    } else {
        const wrapper = new Div(["sb-txt-wrap"])
        const startAProject = new Text("h5", "No projects", ["project-name"])
        wrapper.el.append(startAProject.el)
        sidebarContent.insertBefore(wrapper.el, sidebarBtn)
    }
}

function loadProjectsTab() {
    const projects = getProjects()
    const projectsContainer = document.querySelector("#projects-s1")
    const editProjectsBtn = document.querySelector(".edit-projects-btn")
    projectsContainer.replaceChildren()
    Object.entries(projects).forEach(([project, count]) => {
        let projectCard = new ProjectCard(project, count);
        projectCard.title.el.style.color = getProjectColor(project)
        projectsContainer.append(projectCard.el)
    })
    if (Object.keys(projects).length === 0) {
        editProjectsBtn.textContent = "No projects to edit"
    } else if (editProjectsBtn.textContent.toLowerCase() === "no projects to edit") {
        editProjectsBtn.textContent = "Edit Projects"
    }
}

function setProjectOptions() {
    let projects = getProjects()
    let projectFormField = document.querySelector("#project-field-list")
    projectFormField.replaceChildren()
    Object.keys(projects).forEach((project) => {
        let noHashtag = project.slice(1)
        const option = new Element("option", [], {value: `${noHashtag}`})
        projectFormField.append(option.el)
    })
}

function editProjects() {
    const deleteProjectBtns = document.querySelectorAll(".delete-project-btn")
    const editProjectsBtn = document.querySelector(".edit-projects-btn")

    if (editProjectsBtn.textContent.toLowerCase() === "edit projects") {
        deleteProjectBtns.forEach((button) => button.style.display = "flex")
        document.querySelectorAll(".project-card-pencil").forEach(p => p.style.display = "inline")
        editProjectsBtn.textContent = "Stop editing"
        editProjectsBtn.classList.add("stop-editing")
    } else {
        deleteProjectBtns.forEach((button) => button.style.display = "none")
        document.querySelectorAll(".project-card-pencil").forEach(p => p.style.display = "none")
        editProjectsBtn.textContent = "Edit Projects"
        editProjectsBtn.classList.remove("stop-editing")
    }
}

function sortByDueDate(tasks) {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

function refreshTasksList() {
    const container = document.querySelector(".tasks-s1")
    container.replaceChildren()
    sortByDueDate(allTasks.filter(t => !t.complete)).forEach(task => displayElement(task, ".tasks-s1"))
}

function updateTaskCounts() {
    const incomplete = allTasks.filter(t => !t.complete).length
    const complete = allTasks.filter(t => t.complete).length
    const taskTag = document.querySelector("#task-count-tag")
    const completedTag = document.querySelector("#completed-count-tag")
    if (taskTag) taskTag.textContent = `${incomplete} task${incomplete !== 1 ? 's' : ''}`
    if (completedTag) completedTag.textContent = `${complete} task${complete !== 1 ? 's' : ''}`
}

function refreshExpandedProject() {
    const expandedCard = document.querySelector(".project-card.expanded")
    if (!expandedCard) return
    const projectName = expandedCard.dataset.id
    const taskListEl = expandedCard.querySelector(".project-task-list")
    taskListEl.replaceChildren()
    const incompleteTasks = sortByDueDate(allTasks.filter(task => task.project === projectName && !task.complete))
    incompleteTasks.forEach(task => {
        calcRelativeDate(task)
        new TaskCard(task).appendTo(taskListEl)
    })
    expandedCard.querySelectorAll(".project-card-count, .project-card-count-tag")
        .forEach(el => el.textContent = incompleteTasks.length)
    if (taskListEl.children.length === 0) expandedCard.classList.remove("expanded")
}

function expandProject(projectName) {
    const card = document.querySelector(`.project-card[data-id="${projectName}"]`)
    if (!card) return

    const isExpanded = card.classList.contains("expanded")

    document.querySelectorAll(".project-card").forEach(c => {
        c.querySelector(".project-task-list").replaceChildren()
        c.classList.remove("expanded")
    })

    if (isExpanded) return

    const taskListEl = card.querySelector(".project-task-list")
    sortByDueDate(allTasks.filter(task => task.project === projectName && !task.complete)).forEach(task => {
        calcRelativeDate(task)
        new TaskCard(task).appendTo(taskListEl)
    })
    card.classList.add("expanded")
}

function restoreEditMode() {
    document.querySelectorAll(".delete-project-btn").forEach(btn => btn.style.display = "flex")
    document.querySelectorAll(".project-card-pencil").forEach(p => p.style.display = "inline")
}

function projectCardHandler(e) {
    const editProjectsBtn = document.querySelector(".edit-projects-btn")
    const isEditing = editProjectsBtn.textContent.toLowerCase() === "stop editing"

    if (e.target.closest(".delete-project-btn")) {
        deleteProject(e)
        loadSidebar()
        loadProjectsTab()
        if (isEditing) restoreEditMode()
        return
    }

    if (isEditing && (e.target.classList.contains("project-card-title") || e.target.classList.contains("project-card-pencil"))) {
        const card = e.target.closest(".project-card")
        const titleEl = card.querySelector(".project-card-title")
        const oldName = card.dataset.id

        const input = document.createElement("input")
        input.type = "text"
        input.value = oldName.slice(1)
        input.className = "project-title-input"
        titleEl.replaceWith(input)
        input.focus()
        input.select()

        let saved = false
        function confirm() {
            if (saved) return
            saved = true
            const newName = "#" + input.value.replace(/^#+/, "").toLowerCase().split(" ").join("-")
            if (newName && newName !== oldName) renameProject(oldName, newName)
            loadSidebar()
            loadProjectsTab()
            restoreEditMode()
        }

        input.addEventListener("blur", confirm, { once: true })
        input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") input.blur()
            if (ev.key === "Escape") {
                saved = true
                loadSidebar()
                loadProjectsTab()
                restoreEditMode()
            }
        })
        return
    }

    if (!isEditing && !e.target.closest(".project-task-list")) {
        expandProject(e.currentTarget.dataset.id)
    }
}

export {
    displayElement,
    initTabs,
}