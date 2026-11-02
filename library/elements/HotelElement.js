import { DOM } from "../DOM.js";
import { PageElement } from "./PageElement.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Concrete Product for Factory Method: HotelElement
 * Renders a hotel accommodation voucher with rating, room type, and pricing.
 */
export class HotelElement extends PageElement {
    constructor(params = {}) {
        super({
            name: params.name || "Grand Alpine Resort",
            location: params.location || "Церматт, Швейцарія",
            stars: params.stars || "5 STARS",
            roomType: params.roomType || "Deluxe Suite with Matterhorn View",
            pricePerNight: params.pricePerNight || 340,
            nights: params.nights || 3,
            amenities: params.amenities || ["Spa & Wellness", "Ski-in / Ski-out", "Breakfast Included"],
            ...params
        });
    }

    build() {
        const session = TripSession.getInstance();
        const total = this.params.pricePerNight * this.params.nights;

        const amenityBadges = this.params.amenities.map(a => DOM.tag({
            name: "span",
            class: "badge",
            content: a
        }));

        this.domElement = DOM.tag({
            name: "div",
            class: "tc-card hotel-card",
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: "HOTEL ACCOMMODATION" }),
                                DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.name }),
                                DOM.tag({ name: "div", class: "tc-card-meta", content: this.params.location })
                            ]
                        }),
                        DOM.tag({ name: "span", class: "badge badge-amber", content: this.params.stars })
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
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Категорія номеру" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.roomType })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Тривалість" }),
                                DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.params.nights} ночей` })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            class: "tc-kv-row",
                            content: [
                                DOM.tag({ name: "span", class: "tc-kv-key", content: "Тариф за ніч" }),
                                DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": this.params.pricePerNight, "data-price-suffix": " / ніч" }, content: `${session.formatPrice(this.params.pricePerNight)} / ніч` })
                            ]
                        }),
                        DOM.tag({
                            name: "div",
                            style: "display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px;",
                            content: amenityBadges
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
                                DOM.tag({ name: "div", class: "hud-label", content: "РАЗОМ" }),
                                DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": total }, style: "font-family: var(--font-mono); font-size: 16px; font-weight: 700;", content: session.formatPrice(total) })
                            ]
                        }),
                        DOM.tag({
                            name: "button",
                            class: "btn btn-primary",
                            content: "Забронювати",
                            events: {
                                click: () => {
                                    session.addBookedItem({
                                        id: `hotel-${Date.now()}`,
                                        type: "Готель",
                                        title: this.params.name,
                                        subtitle: `${this.params.nights} ночей • ${this.params.roomType}`,
                                        basePriceEur: total
                                    });
                                    TripEventBus.getInstance().emit("hotelBooked", {
                                        hotel: this.params.name,
                                        amount: session.convertPrice(total),
                                        currency: session.getCurrency()
                                    });
                                }
                            }
                        })
                    ]
                })
            ]
        });
    }
}
