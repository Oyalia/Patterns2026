import { DOM } from "../DOM.js";
import { PageElement } from "./PageElement.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Concrete Product for Factory Method: FlightElement
 * Renders an airline boarding pass / ticket with flight codes, route and cabin class.
 */
export class FlightElement extends PageElement {
    constructor(params = {}) {
        super({
            flightNumber: params.flightNumber || "LX-1420",
            airline: params.airline || "Swiss International Air Lines",
            origin: params.origin || "VIE (Відень)",
            destination: params.destination || "ZRH (Цюрих)",
            departureTime: params.departureTime || "08:45",
            arrivalTime: params.arrivalTime || "10:10",
            seatClass: params.seatClass || "Business Class",
            gate: params.gate || "G14",
            price: params.price || 280,
            ...params
        });
    }

    build() {
        const session = TripSession.getInstance();

        this.domElement = DOM.tag({
            name: "div",
            class: "tc-card flight-card",
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: `FLIGHT / ${this.params.flightNumber}` }),
                                DOM.tag({ name: "h3", class: "tc-card-title", content: `${this.params.origin} -> ${this.params.destination}` }),
                                DOM.tag({ name: "div", class: "tc-card-meta", content: this.params.airline })
                            ]
                        }),
                        DOM.tag({ name: "span", class: "badge badge-cyan", content: this.params.seatClass })
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
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Виліт / Прибуття" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.params.departureTime} -> ${this.params.arrivalTime}` })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Вихід на посадку (Gate)" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.gate })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Норма багажу" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: "2 x 32 кг" })
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
                                DOM.tag({ name: "div", class: "hud-label", content: "ТАРИФ КВИТКА" }),
                                DOM.tag({ name: "div", style: "font-family: var(--font-mono); font-size: 16px; font-weight: 700;", content: `${this.params.price} ${session.getCurrency()}` })
                            ]
                        }),
                        DOM.tag({
                            name: "button",
                            class: "btn btn-primary",
                            content: "Додати переліт",
                            events: {
                                click: () => {
                                    session.addBudget(this.params.price);
                                    TripEventBus.getInstance().emit("flightBooked", {
                                        flight: this.params.flightNumber,
                                        price: this.params.price,
                                        currency: session.getCurrency()
                                    });
                                    alert(`Авіаквиток ${this.params.flightNumber} (${this.params.origin} -> ${this.params.destination}) додано до подорожі.`);
                                }
                            }
                        })
                    ]
                })
            ]
        });
    }
}
