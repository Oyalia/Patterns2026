import { DOM } from "../DOM.js";
import { PageElement } from "./PageElement.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Concrete Product for Factory Method: ExcursionElement
 * Renders a guided tour / adventure experience card.
 */
export class ExcursionElement extends PageElement {
    constructor(params = {}) {
        super({
            title: params.title || "Сходження на Горнерграт та Альпійська панорама",
            guide: params.guide || "Ганс Мюллер (Сертифікований гід UIAGM)",
            duration: params.duration || "6 годин",
            difficulty: params.difficulty || "Помірний",
            meetingPoint: params.meetingPoint || "Станція Zermatt GGB",
            pricePerPerson: params.pricePerPerson || 95,
            ...params
        });
    }

    build() {
        const session = TripSession.getInstance();
        const total = this.params.pricePerPerson * session.travelersCount;

        this.domElement = DOM.tag({
            name: "div",
            class: "tc-card excursion-card",
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: "EXCURSION / TOUR" }),
                                DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.title }),
                                DOM.tag({ name: "div", class: "tc-card-meta", content: `Гід: ${this.params.guide}` })
                            ]
                        }),
                        DOM.tag({ name: "span", class: "badge badge-emerald", content: this.params.difficulty })
                    ]
                }),
                DOM.tag({
                    name: "div",
                    class: "tc-card-body",
                    content: [
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Тривалість" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.duration })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Місце зустрічі" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.meetingPoint })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Вартість за особу" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.params.pricePerPerson} ${session.getCurrency()}` })
                            ]
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
                                DOM.tag({ name: "div", class: "hud-label", content: `ДЛЯ ${session.travelersCount} ОСІБ` }),
                                DOM.tag({ name: "div", style: "font-family: var(--font-mono); font-size: 16px; font-weight: 700;", content: `${total} ${session.getCurrency()}` })
                            ]
                        }),
                        DOM.tag({
                            name: "button",
                            class: "btn btn-primary",
                            content: "Записатися",
                            events: {
                                click: () => {
                                    session.addBudget(total);
                                    TripEventBus.getInstance().emit("excursionBooked", {
                                        tour: this.params.title,
                                        amount: total,
                                        currency: session.getCurrency()
                                    });
                                    alert(`Екскурсію "${this.params.title}" заброньовано для ${session.travelersCount} осіб. Вартість: ${total} ${session.getCurrency()}`);
                                }
                            }
                        })
                    ]
                })
            ]
        });
    }
}
