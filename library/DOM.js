/**
 * DOM Helper Utility
 * Implements a flexible fluent DOM generation helper.
 */
export class DOM {
    static tag(params = {}) {
        const element = document.createElement(params.name || 'div');

        // Handle classes (string or array)
        if (typeof params.class === 'string' && params.class.trim() !== '') {
            params.class.split(' ').filter(Boolean).forEach(cls => element.classList.add(cls));
        } else if (Array.isArray(params.class)) {
            params.class.filter(Boolean).forEach(cls => element.classList.add(cls));
        }

        // Handle HTML attributes
        if (params.attributes && typeof params.attributes === 'object') {
            for (const [attrName, attrValue] of Object.entries(params.attributes)) {
                if (attrValue !== undefined && attrValue !== null) {
                    element.setAttribute(attrName, attrValue);
                }
            }
        }

        // Handle Inline Styles
        if (params.style) {
            if (typeof params.style === 'string') {
                element.style.cssText = params.style;
            } else if (typeof params.style === 'object') {
                Object.assign(element.style, params.style);
            }
        }

        // Handle Event Listeners
        if (params.events && typeof params.events === 'object') {
            for (const [eventName, handler] of Object.entries(params.events)) {
                if (typeof handler === 'function') {
                    element.addEventListener(eventName, handler);
                }
            }
        }

        // Handle Content (string, HTMLElement, Node, or array)
        if (params.content !== undefined && params.content !== null) {
            if (typeof params.content === 'string' || typeof params.content === 'number') {
                element.innerHTML = String(params.content);
            } else if (Array.isArray(params.content)) {
                params.content.forEach((item) => {
                    if (item instanceof Node) {
                        element.appendChild(item);
                    } else if (typeof item === 'string' || typeof item === 'number') {
                        element.insertAdjacentHTML('beforeend', String(item));
                    }
                });
            } else if (params.content instanceof Node) {
                element.appendChild(params.content);
            }
        }

        return element;
    }
}
