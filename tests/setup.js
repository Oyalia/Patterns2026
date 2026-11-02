/**
 * Test Environment Setup
 * Provides a minimal mock implementation of DOM APIs for Node.js test environment.
 */

class MockClassList {
    constructor() {
        this.classes = new Set();
    }
    add(...args) {
        args.forEach(cls => this.classes.add(cls));
    }
    remove(...args) {
        args.forEach(cls => this.classes.delete(cls));
    }
    contains(cls) {
        return this.classes.has(cls);
    }
    forEach(fn) {
        this.classes.forEach(fn);
    }
}

class MockElement {
    constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.classList = new MockClassList();
        this.attributes = {};
        this.style = {};
        this.children = [];
        this.parentElement = null;
        this.innerHTML = '';
        this.listeners = {};
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    addEventListener(event, fn) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(fn);
    }

    dispatchEvent(event) {
        const type = typeof event === 'string' ? event : event.type;
        const handlers = this.listeners[type] || [];
        handlers.forEach(h => h(event));
    }

    appendChild(child) {
        if (child instanceof MockElement) {
            child.parentElement = this;
            this.children.push(child);
        }
        return child;
    }

    insertAdjacentHTML(position, text) {
        this.innerHTML += text;
    }
}

globalThis.MockElement = MockElement;
globalThis.Node = MockElement;
globalThis.HTMLElement = MockElement;

globalThis.document = {
    createElement(tagName) {
        return new MockElement(tagName);
    },
    body: new MockElement('body')
};

globalThis.window = {
    addEventListener: () => {}
};
