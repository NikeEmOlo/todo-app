import "./tasks.css"

const activeTab = tasks;

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
function renderTabs() {
    
}

function updateSidebarButton() {
    switch (activeTabs) {
        case tasks:
            //do this and that
            break;
        case projects:
            //do this and that
            break;
        case completed:
            //do this and that
            break;
    }
}



function displayTask(task) {
    new TaskCard(task).appendTo(document.querySelector('.tasks-s1'));
}



export {
    displayTask,
}