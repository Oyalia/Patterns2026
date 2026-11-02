import { DOM } from "../DOM.js";
import { PageElement } from "./PageElement.js";
import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Concrete Product for Factory Method: BookingFormElement
 * Renders an interactive traveler checkout / reservation registration form.
 */
export class BookingFormElement extends PageElement {
    constructor(params = {}) {
        super({
            title: params.title || "Оформлення бронювання туру",
            destination: params.destination || "Альпійський Гірськолижний Вікенд",
            fields: params.fields || [
                { name: "leadTraveler", label: "Прізвище та Ім'я", type: "text", placeholder: "Олександр Коваленко" },
                { name: "email", label: "Електронна пошта", type: "email", placeholder: "traveler@tripcraft.io" },
                { name: "phone", label: "Номер телефону", type: "tel", placeholder: "+380 67 000 0000" }
            ],
            onSubmit: params.onSubmit || null,
            ...params
        });
    }

    build() {
        const session = TripSession.getInstance();

        const formFields = this.params.fields.map(field => {
            return DOM.tag({
                name: "div",
                class: "tc-form-group",
                content: [
                    DOM.tag({ name: "label", class: "hud-label", content: field.label }),
                    DOM.tag({
                        name: "input",
                        class: "tc-input",
                        attributes: {
                            type: field.type || "text",
                            name: field.name,
                            placeholder: field.placeholder || "",
                            required: "true"
                        }
                    })
                ]
            });
        });

        const feedbackMsg = DOM.tag({
            name: "div",
            style: "display: none; padding: 10px; margin-top: 10px; border: 1px solid var(--accent-emerald); color: var(--accent-emerald); font-family: var(--font-mono); font-size: 11px;"
        });

        this.domElement = DOM.tag({
            name: "form",
            class: "tc-card booking-form-card",
            content: [
                DOM.tag({
                    name: "div",
                    class: "tc-card-header",
                    content: [
                        DOM.tag({
                            name: "div",
                            content: [
                                DOM.tag({ name: "div", class: "hud-label", content: "RESERVATION FORM" }),
                                DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.title }),
                                DOM.tag({ name: "div", class: "tc-card-meta", content: `Цільовий тур: ${this.params.destination}` })
                            ]
                        }),
                        DOM.tag({ name: "span", class: "badge badge-cyan", content: "DIRECT BOOKING" })
                    ]
                }),
                DOM.tag({
                    name: "div",
                    class: "tc-card-body",
                    content: formFields
                }),
                feedbackMsg,
                DOM.tag({
                    name: "div",
                    style: "margin-top: 14px;",
                    content: DOM.tag({
                        name: "button",
                        class: "btn btn-primary btn-block",
                        attributes: { type: "submit" },
                        content: "Підтвердити бронь та сформувати ваучер"
                    })
                })
            ],
            events: {
                submit: (e) => {
                    e.preventDefault();
                    const formData = new FormData(this.domElement);
                    const values = Object.fromEntries(formData.entries());

                    feedbackMsg.style.display = "block";
                    feedbackMsg.textContent = `Ваучер сформовано на ім'я ${values.leadTraveler || "Клієнт"}. Підтвердження надіслано на ${values.email || "email"}.`;

                    TripEventBus.getInstance().emit("bookingConfirmed", {
                        traveler: values.leadTraveler,
                        email: values.email,
                        destination: this.params.destination,
                        currency: session.getCurrency()
                    });

                    if (typeof this.params.onSubmit === "function") {
                        this.params.onSubmit(values);
                    }
                }
            }
        });
    }
}
