import { DOM } from "../DOM.js";
import { PageElement } from "../elements/PageElement.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Complex Product for Builder Pattern: TravelItineraryWidget
 * A multi-part travel package containing flights, hotel stay, excursions, and booking actions.
 */
export class TravelItineraryWidget extends PageElement {
    constructor(config = {}) {
        super(config);
        this.destination = config.destination || "Destination";
        this.region = config.region || "";
        this.dates = config.dates || "Dates TBD";
        this.flight = config.flight || null; // { airline, route, flightNo, price }
        this.hotel = config.hotel || null; // { name, roomType, nights, totalCost }
        this.excursions = config.excursions || []; // [{ title, price }]
        this.travelers = config.travelers || 2;
        this.actions = config.actions || [];
        this.footerText = config.footerText || "";
        this.theme = config.theme || "dark";
    }

    calculateTotal() {
        let sum = 0;
        if (this.flight) sum += this.flight.price * this.travelers;
        if (this.hotel) sum += this.hotel.totalCost;
        this.excursions.forEach(e => sum += e.price * this.travelers);
        return sum;
    }

    build() {
        const session = TripSession.getInstance();
        const total = this.calculateTotal();

        // 1. Header
        const headerNode = DOM.tag({
            name: "div",
            class: "tc-card-header",
            content: [
                DOM.tag({
                    name: "div",
                    content: [
                        DOM.tag({ name: "div", class: "hud-label", content: "FULL TRAVEL PACKAGE" }),
                        DOM.tag({ name: "h3", class: "tc-card-title", content: this.destination }),
                        DOM.tag({ name: "div", class: "tc-card-meta", content: `${this.region} / ${this.dates}` })
                    ]
                }),
                DOM.tag({ name: "span", class: "badge badge-amber", content: `${this.travelers} TRAVELERS` })
            ]
        });

        // 2. Flight Item
        let flightNode = null;
        if (this.flight) {
            flightNode = DOM.tag({
                name: "div",
                class: "tc-kv-row",
                content: [
                    DOM.tag({ name: "span", class: "tc-kv-key", content: `Переліт: ${this.flight.airline}` }),
                    DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.flight.route} (${this.flight.price * this.travelers} ${session.getCurrency()})` })
                ]
            });
        }

        // 3. Hotel Item
        let hotelNode = null;
        if (this.hotel) {
            hotelNode = DOM.tag({
                name: "div",
                class: "tc-kv-row",
                content: [
                    DOM.tag({ name: "span", class: "tc-kv-key", content: `Готель: ${this.hotel.name}` }),
                    DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.hotel.roomType} (${this.hotel.totalCost} ${session.getCurrency()})` })
                ]
            });
        }

        // 4. Excursions
        let excursionsNode = null;
        if (this.excursions.length > 0) {
            excursionsNode = DOM.tag({
                name: "div",
                style: "display: flex; flex-direction: column; gap: 4px; margin-top: 6px;",
                content: this.excursions.map(ex => DOM.tag({
                    name: "div",
                    class: "tc-kv-row",
                    content: [
                        DOM.tag({ name: "span", class: "tc-kv-key", content: `Тур: ${ex.title}` }),
                        DOM.tag({ name: "span", class: "tc-kv-val", content: `${ex.price * this.travelers} ${session.getCurrency()}` })
                    ]
                }))
            });
        }

        // 5. Actions bar
        let actionsNode = null;
        if (this.actions.length > 0) {
            actionsNode = DOM.tag({
                name: "div",
                style: "display: flex; gap: 8px; margin-top: 8px;",
                content: this.actions.map(act => DOM.tag({
                    name: "button",
                    class: `btn btn-${act.variant || "primary"} btn-sm`,
                    content: act.label,
                    events: { click: act.onClick || (() => {}) }
                }))
            });
        }

        // 6. Summary Footer
        const footerNode = DOM.tag({
            name: "div",
            style: "display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-line); padding-top: 12px; margin-top: 8px;",
            content: [
                DOM.tag({
                    name: "div",
                    content: [
                        DOM.tag({ name: "div", class: "hud-label", content: "ЗАГАЛЬНА ВАРТІСТЬ ПАКЕТА" }),
                        DOM.tag({ name: "div", style: "font-family: var(--font-mono); font-size: 16px; font-weight: 700;", content: `${total} ${session.getCurrency()}` })
                    ]
                }),
                actionsNode || DOM.tag({
                    name: "button",
                    class: "btn btn-primary",
                    content: "Оформити весь тур",
                    events: {
                        click: () => {
                            session.addBudget(total);
                            TripEventBus.getInstance().emit("itineraryConfirmed", {
                                destination: this.destination,
                                total,
                                currency: session.getCurrency()
                            });
                            alert(`Комплексний тур "${this.destination}" додано. Загальна сума: ${total} ${session.getCurrency()}`);
                        }
                    }
                })
            ]
        });

        this.domElement = DOM.tag({
            name: "div",
            class: "tc-card travel-itinerary-card",
            content: [
                headerNode,
                DOM.tag({
                    name: "div",
                    class: "tc-card-body",
                    content: [flightNode, hotelNode, excursionsNode].filter(Boolean)
                }),
                this.footerText ? DOM.tag({ name: "div", class: "hud-label", style: "color: var(--text-faint); margin-top: 4px;", content: this.footerText }) : null,
                footerNode
            ].filter(Boolean)
        });
    }
}
