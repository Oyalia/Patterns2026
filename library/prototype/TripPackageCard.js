import { DOM } from "../DOM.js";
import { PageElement } from "../elements/PageElement.js";
import { Prototype } from "./Prototype.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Concrete Prototype: TripPackageCard
 * Implements Prototype to allow cloning pre-configured holiday packages with deep parameter isolation.
 */
export class TripPackageCard extends PageElement {
    constructor(config = {}) {
        super(config);
        this.templateId = config.templateId || "base-trip";
        this.cloneCount = config.cloneCount || 0;
        this.title = config.title || "Шаблонний Тур";
        this.category = config.category || "General";
        this.badge = config.badge || "ORIGINAL TEMPLATE";
        this.tags = Array.isArray(config.tags) ? [...config.tags] : ["Voucher"];
        this.details = { ...(config.details || { "Тривалість": "3 дні", "Харчування": "All-Inclusive" }) };
        this.price = config.price || 450;
    }

    /**
     * Deep clones this trip package with optional custom overrides.
     * @param {Object} overrides
     * @returns {TripPackageCard}
     */
    clone(overrides = {}) {
        const nextCloneCount = this.cloneCount + 1;
        const clonedConfig = {
            templateId: this.templateId,
            cloneCount: nextCloneCount,
            title: overrides.title || `${this.title} (Клон #${nextCloneCount})`,
            category: overrides.category || this.category,
            badge: overrides.badge || `CLONE #${nextCloneCount}`,
            tags: overrides.tags ? [...overrides.tags] : [...this.tags],
            details: { ...this.details, ...(overrides.details || {}) },
            price: overrides.price !== undefined ? overrides.price : this.price
        };

        const clonedInstance = new TripPackageCard(clonedConfig);

        TripEventBus.getInstance().emit("tripPackageCloned", {
            sourceTemplate: this.templateId,
            newTitle: clonedInstance.title,
            cloneVersion: nextCloneCount
        });

        return clonedInstance;
    }

    build() {
        const session = TripSession.getInstance();

        this.domElement = DOM.tag({
            name: "div",
            class: "tc-card trip-package-card",
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: `TEMPLATE / ${this.templateId}` }),
                                DOM.tag({ name: "h4", class: "tc-card-title", content: this.title }),
                                DOM.tag({ name: "div", class: "tc-card-meta", content: `Категорія: ${this.category}` })
                            ]
                        }),
                        DOM.tag({ name: "span", class: "badge badge-amber", content: this.badge })
                    ]
                }),
                DOM.tag({
                    name: "div",
                    class: "tc-card-body",
                    content: [
                        DOM.tag({
                            name: "div",
                            style: "display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;",
                            content: this.tags.map(t => DOM.tag({ name: "span", class: "badge", content: t }))
                        }),
                        DOM.tag({
                            name: "div",
                            style: "display: flex; flex-direction: column; gap: 4px;",
                            content: Object.entries(this.details).map(([k, v]) => DOM.tag({
                                name: "div",
                                class: "tc-kv-row",
                                content: [
                                    DOM.tag({ name: "span", class: "tc-kv-key", content: k }),
                                    DOM.tag({ name: "span", class: "tc-kv-val", content: String(v) })
                                ]
                            }))
                        })
                    ]
                }),
                DOM.tag({
                    name: "div",
                    style: "display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-line); padding-top: 12px;",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: "БАЗОВИЙ ТАРИФ" }),
                                DOM.tag({ name: "div", style: "font-family: var(--font-mono); font-size: 15px; font-weight: 700;", content: `${this.price} ${session.getCurrency()}` })
                            ]
                        }),
                        DOM.tag({
                            name: "button",
                            class: "btn btn-outline btn-sm",
                            content: "Клонувати пакет",
                            events: {
                                click: (e) => {
                                    e.stopPropagation();
                                    const nextClone = this.clone();
                                    nextClone.render(this.domElement.parentElement);
                                }
                            }
                        })
                    ]
                })
            ]
        });
    }
}
