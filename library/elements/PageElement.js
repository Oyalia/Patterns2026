/**
 * Base abstract class for all visual components.
 */
export class PageElement {
    domElement = null;
    params = {};

    constructor(params = {}) {
        this.params = params;
    }

    /**
     * Builds the internal DOM structure.
     * To be overridden by concrete element classes.
     */
    build() {
        throw new Error("Method 'build()' must be implemented by subclass.");
    }

    /**
     * Returns the built DOM element.
     * @returns {HTMLElement}
     */
    getDOMElement() {
        if (!this.domElement) {
            this.build();
        }
        return this.domElement;
    }

    /**
     * Mounts the element into a parent DOM container.
     * @param {HTMLElement} parent
     */
    render(parent) {
        const dom = this.getDOMElement();
        if (parent && parent instanceof HTMLElement) {
            parent.appendChild(dom);
        }
        return dom;
    }
}
