import "./tasks.css"

let activeTab = "tasks";

// -------CREATING ELEMENTS CLASSES------------//
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
        super(['task-card'], {'data-id': task.UUID})

        this.checkbox = new Input(['checkbox'], {type: 'checkbox'})
        this.checkbox.el.id = `checkbox-${task.UUID}`
        this.append(this.checkbox)

        this.label = new Label(task.name, ['task-label'], {for: `checkbox-${task.UUID}`})
        this.append(this.label)

        this.taskInfoWrapper = new Div(['task-info-wrap'])
        this.append(this.taskInfoWrapper)

        //appendTo taskInfoWrap
        this.projectTag = new Div(['tag'])
        this.projectTag.el.textContent = task.project;
        this.projectTag.appendTo(this.taskInfoWrapper)
        this.timestamp = new Button(new Text('h6', 'Due: 00:00 / Today', ['muted']), ['tag', 'minimal'])
        this.timestamp.appendTo(this.taskInfoWrapper)
    }
}

//------DISPLAY ELEMENTS ON THE PAGE-----//
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
            // btnFn: () => //Do something,
        },
        Projects: {
            active: "projects",
            tab: "#projects-tab",
            btnLabel: "Add Project",

        },
        Completed: {
            active: "completed",
            tab: "#completed-tab",
            btnLabel: "Add Task",
        },
    }

    tabs.tasks.style.display = 'flex';
    tabs.projects.style.display = 'none';
    tabs.completed.style.display = 'none'

    tabButtons.forEach(element => {
        element.addEventListener("click", (e) => {
            tabController(e, tabs, sidebarBtn, tabConfig)})
    });

}

function tabController(e, tabs, sidebarBtn, tabConfig) { 
    const config = tabConfig[e.currentTarget.textContent]
    activeTab = config.active
    Object.values(tabs).forEach(tab => tab.style.display = 'none');
    document.querySelector(config.tab).style.display = 'flex';

    sidebarBtn.textContent = config.btnLabel;
    // sbButton.onClick = config.btnFn
}

function displayTask(task) {
    new TaskCard(task).appendTo(document.querySelector('.tasks-s1'));
}



export {
    displayTask,
    initTabs,
}