import { DOM } from "../../DOM.js";
import { PageElement } from "../../elements/PageElement.js";
import { TripEventBus } from "../../singleton/TripEventBus.js";

/**
 * Concrete Products for Abstract Factory
 */

export class ThemedButton extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({
            text: params.text || "SELECT OPTION",
            variant: params.variant || "primary",
            onClick: params.onClick || null,
            ...params
        });
        this.themeName = themeName;
    }

    build() {
        this.domElement = DOM.tag({
            name: "button",
            class: `btn btn-${this.params.variant} themed-btn theme-${this.themeName}`,
            content: this.params.text,
            events: {
                click: (e) => {
                    TripEventBus.getInstance().emit("themedButtonClicked", {
                        theme: this.themeName,
                        text: this.params.text
                    });
                    if (typeof this.params.onClick === "function") {
                        this.params.onClick(e);
                    }
                }
            }
        });
    }
}

export class ThemedBadge extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({
            label: params.label || "STANDARD",
            type: params.type || "amber",
            ...params
        });
        this.themeName = themeName;
    }

    build() {
        this.domElement = DOM.tag({
            name: "span",
            class: `badge badge-${this.params.type} theme-${this.themeName}`,
            content: this.params.label
        });
    }
}

export class ThemedCard extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({
            title: params.title || "Travel Service Panel",
            content: params.content || "",
            ...params
        });
        this.themeName = themeName;
    }

    build() {
        this.domElement = DOM.tag({
            name: "div",
            class: `tc-card themed-card theme-${this.themeName}`,
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({ name: "h4", class: "tc-card-title", content: this.params.title }),
                        DOM.tag({ name: "span", class: "hud-label", content: this.themeName.toUpperCase() })
                    ]
                }),
                DOM.tag({
                    name: "div",
                    class: "tc-card-body",
                    content: this.params.content
                })
            ]
        });
    }
}
