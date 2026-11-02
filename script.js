/**
 * TripCraft Studio - Bundled Application Script
 * All 5 Creational GoF Design Patterns in a single file (no ES module imports).
 * Works when index.html is opened directly from the filesystem (file:// protocol).
 *
 * Pattern order:
 * 1. DOM Helper Utility
 * 2. Singleton: TripEventBus, TripSession
 * 3. Factory Method: PageElement, HotelElement, FlightElement, ExcursionElement, BookingFormElement
 *                    TravelElementCreator, HotelElementCreator, FlightElementCreator,
 *                    ExcursionElementCreator, BookingFormElementCreator
 * 4. Abstract Factory: TravelUIFactory, ThemedButton, ThemedBadge, ThemedCard,
 *                      BusinessDarkThemeFactory, ResortLightThemeFactory, ThemeFactoryProvider
 * 5. Builder: TravelItineraryWidget, ItineraryBuilder, ItineraryDirector
 * 6. Prototype: Prototype, TripPackageCard, TripTemplateRegistry
 * 7. Main Application Controller
 */

/* ============================================================
   1. DOM HELPER UTILITY
   ============================================================ */
class DOM {
    static tag(params = {}) {
        const element = document.createElement(params.name || 'div');

        if (typeof params.class === 'string' && params.class.trim() !== '') {
            params.class.split(' ').filter(Boolean).forEach(cls => element.classList.add(cls));
        } else if (Array.isArray(params.class)) {
            params.class.filter(Boolean).forEach(cls => element.classList.add(cls));
        }

        if (params.attributes && typeof params.attributes === 'object') {
            for (const [attrName, attrValue] of Object.entries(params.attributes)) {
                if (attrValue !== undefined && attrValue !== null) {
                    element.setAttribute(attrName, attrValue);
                }
            }
        }

        if (params.style) {
            if (typeof params.style === 'string') {
                element.style.cssText = params.style;
            } else if (typeof params.style === 'object') {
                Object.assign(element.style, params.style);
            }
        }

        if (params.events && typeof params.events === 'object') {
            for (const [eventName, handler] of Object.entries(params.events)) {
                if (typeof handler === 'function') {
                    element.addEventListener(eventName, handler);
                }
            }
        }

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

/* ============================================================
   2. SINGLETON PATTERN
   ============================================================ */

/**
 * Singleton: TripEventBus
 * Centralized audit trail and telemetry dispatcher for all travel creational actions.
 */
class TripEventBus {
    static #instance = null;

    constructor() {
        if (TripEventBus.#instance) {
            return TripEventBus.#instance;
        }
        this.events = new Map();
        this.history = [];
        TripEventBus.#instance = this;
    }

    static getInstance() {
        if (!TripEventBus.#instance) {
            TripEventBus.#instance = new TripEventBus();
        }
        return TripEventBus.#instance;
    }

    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        if (this.events.has(event)) {
            this.events.get(event).delete(handler);
        }
    }

    emit(event, data = {}) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { event, data, timestamp };
        this.history.unshift(entry);
        if (this.history.length > 50) this.history.pop();

        if (this.events.has(event)) {
            this.events.get(event).forEach(handler => {
                try {
                    handler(data, timestamp);
                } catch (err) {
                    console.error(`TripEventBus error [${event}]:`, err);
                }
            });
        }
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
        this.emit("historyCleared", {});
    }
}

/**
 * Singleton: TripSession
 * Manages global travel booking state: currency, theme, travelers, budget.
 * Internal notify() bridges to TripEventBus so all event subscriptions work uniformly.
 */
class TripSession {
    static #instance = null;

    constructor() {
        if (TripSession.#instance) {
            return TripSession.#instance;
        }
        this.appName = "TripCraft Studio";
        this.version = "1.0.0";
        this.theme = "dark";
        this.currency = "EUR";
        this.travelersCount = 2;
        this.totalBudget = 0;
        this.createdCount = 0;
        this.bookedItems = [];
        this.exchangeRates = {
            EUR: 1.0,
            USD: 1.08,
            UAH: 45.0
        };
        this.listeners = new Set();
        this.createdAt = new Date().toISOString();
        TripSession.#instance = this;
    }

    static getInstance() {
        if (!TripSession.#instance) {
            TripSession.#instance = new TripSession();
        }
        return TripSession.#instance;
    }

    setTheme(newTheme) {
        if (newTheme !== this.theme) {
            this.theme = newTheme;
            this.notify("themeChanged", { theme: this.theme });
        }
    }

    getTheme() { return this.theme; }

    setCurrency(currency) {
        this.currency = currency;
        this.notify("currencyChanged", {
            currency: this.currency,
            rate: this.getExchangeRate(this.currency)
        });
    }

    getCurrency() { return this.currency; }

    getExchangeRate(currency = this.currency) {
        return this.exchangeRates[currency] || 1.0;
    }

    convertPrice(eurAmount, currency = this.currency) {
        const rate = this.getExchangeRate(currency);
        return Math.round(eurAmount * rate);
    }

    formatPrice(eurAmount, currency = this.currency) {
        const converted = this.convertPrice(eurAmount, currency);
        return `${converted.toLocaleString("uk-UA")} ${currency}`;
    }

    setTravelersCount(count) {
        this.travelersCount = Math.max(1, count);
        this.notify("travelersChanged", { count: this.travelersCount });
    }

    addBudget(amount) {
        this.totalBudget += amount;
        this.notify("budgetUpdated", { totalBudget: this.totalBudget });
    }

    addBookedItem(item) {
        const booked = {
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: item.type || "Послуга",
            title: item.title || "Елемент туру",
            subtitle: item.subtitle || "",
            basePriceEur: Number(item.basePriceEur) || 0,
            addedAt: new Date().toLocaleTimeString()
        };
        this.bookedItems.push(booked);
        this.addBudget(booked.basePriceEur);
        this.notify("cartUpdated", { items: this.bookedItems, lastAdded: booked });
        return booked;
    }

    removeBookedItem(id) {
        const idx = this.bookedItems.findIndex(i => i.id === id);
        if (idx !== -1) {
            const removed = this.bookedItems.splice(idx, 1)[0];
            this.totalBudget = Math.max(0, this.totalBudget - removed.basePriceEur);
            this.notify("cartUpdated", { items: this.bookedItems, lastRemoved: removed });
            this.notify("budgetUpdated", { totalBudget: this.totalBudget });
            return removed;
        }
        return null;
    }

    clearCart() {
        this.bookedItems = [];
        this.totalBudget = 0;
        this.notify("cartUpdated", { items: this.bookedItems });
        this.notify("budgetUpdated", { totalBudget: 0 });
    }

    getBookedItems() {
        return [...this.bookedItems];
    }

    incrementCreatedCount() {
        this.createdCount++;
        this.notify("counterUpdated", { count: this.createdCount });
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event, payload) {
        // Notify session.subscribe() listeners
        this.listeners.forEach(callback => {
            try { callback(event, payload); } catch (err) {
                console.error("TripSession subscriber error:", err);
            }
        });
        // Bridge to TripEventBus so eventBus.on() listeners also receive state changes
        try {
            TripEventBus.getInstance().emit(event, payload);
        } catch (err) {
            console.error("TripSession -> TripEventBus bridge error:", err);
        }
    }

    reset() {
        this.totalBudget = 0;
        this.createdCount = 0;
        this.bookedItems = [];
        this.notify("reset", {});
        this.notify("cartUpdated", { items: [] });
    }
}

/* ============================================================
   3. FACTORY METHOD PATTERN
   ============================================================ */

/**
 * Base abstract class for all visual components.
 */
class PageElement {
    constructor(params = {}) {
        this.params = params;
        this.domElement = null;
    }

    build() {
        throw new Error("Method 'build()' must be implemented by subclass.");
    }

    getDOMElement() {
        if (!this.domElement) this.build();
        return this.domElement;
    }

    render(parent) {
        const dom = this.getDOMElement();
        if (parent && parent instanceof HTMLElement) {
            parent.appendChild(dom);
        }
        return dom;
    }
}

/** Concrete Product: HotelElement */
class HotelElement extends PageElement {
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
        const amenityBadges = this.params.amenities.map(a => DOM.tag({ name: "span", class: "badge", content: a }));

        this.domElement = DOM.tag({
            name: "div", class: "tc-card hotel-card", attributes: { "data-category": "hotel" },
            content: [
                DOM.tag({
                    name: "div", class: "tc-card-header",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "HOTEL ACCOMMODATION" }),
                            DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.name }),
                            DOM.tag({ name: "div", class: "tc-card-meta", content: this.params.location })
                        ]}),
                        DOM.tag({ name: "span", class: "badge badge-amber", content: this.params.stars })
                    ]
                }),
                DOM.tag({
                    name: "div", class: "tc-card-body",
                    content: [
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Категорія номеру" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.roomType })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Тривалість" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.params.nights} ночей` })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Тариф за ніч" }),
                            DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": this.params.pricePerNight, "data-price-suffix": " / ніч" }, content: `${session.formatPrice(this.params.pricePerNight)} / ніч` })
                        ]}),
                        DOM.tag({ name: "div", style: "display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;", content: amenityBadges })
                    ]
                }),
                DOM.tag({
                    name: "div", style: "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-line);padding-top:12px;",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "РАЗОМ" }),
                            DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": total }, style: "font-family:var(--font-mono);font-size:16px;font-weight:700;", content: session.formatPrice(total) })
                        ]}),
                        DOM.tag({
                            name: "button", class: "btn btn-primary", content: "Забронювати",
                            events: { click: () => {
                                session.addBookedItem({
                                    id: `hotel-${Date.now()}`,
                                    type: "Готель",
                                    title: this.params.name,
                                    subtitle: `${this.params.nights} ночей • ${this.params.roomType}`,
                                    basePriceEur: total
                                });
                                TripEventBus.getInstance().emit("hotelBooked", { hotel: this.params.name, amount: session.convertPrice(total), currency: session.getCurrency() });
                                showToast(`Готель "${this.params.name}" додано до подорожі (+${session.formatPrice(total)})`, "success");
                            }}
                        })
                    ]
                })
            ]
        });
    }
}

/** Concrete Product: FlightElement */
class FlightElement extends PageElement {
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
            name: "div", class: "tc-card flight-card", attributes: { "data-category": "flight" },
            content: [
                DOM.tag({
                    name: "div", class: "tc-card-header",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: `FLIGHT / ${this.params.flightNumber}` }),
                            DOM.tag({ name: "h3", class: "tc-card-title", content: `${this.params.origin} -> ${this.params.destination}` }),
                            DOM.tag({ name: "div", class: "tc-card-meta", content: this.params.airline })
                        ]}),
                        DOM.tag({ name: "span", class: "badge badge-cyan", content: this.params.seatClass })
                    ]
                }),
                DOM.tag({
                    name: "div", class: "tc-card-body",
                    content: [
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Виліт / Прибуття" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: `${this.params.departureTime} -> ${this.params.arrivalTime}` })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Вихід на посадку (Gate)" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.gate })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Норма багажу" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: "2 x 32 кг" })
                        ]})
                    ]
                }),
                DOM.tag({
                    name: "div", style: "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-line);padding-top:12px;",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "ТАРИФ КВИТКА" }),
                            DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": this.params.price }, style: "font-family:var(--font-mono);font-size:16px;font-weight:700;", content: session.formatPrice(this.params.price) })
                        ]}),
                        DOM.tag({
                            name: "button", class: "btn btn-primary", content: "Додати переліт",
                            events: { click: () => {
                                session.addBookedItem({
                                    id: `flight-${Date.now()}`,
                                    type: "Авіаквиток",
                                    title: `Рейс ${this.params.flightNumber} (${this.params.airline})`,
                                    subtitle: `${this.params.origin} -> ${this.params.destination} • ${this.params.seatClass}`,
                                    basePriceEur: this.params.price
                                });
                                TripEventBus.getInstance().emit("flightBooked", { flight: this.params.flightNumber, price: session.convertPrice(this.params.price), currency: session.getCurrency() });
                                showToast(`Авіаквиток ${this.params.flightNumber} (${this.params.origin} -> ${this.params.destination}) додано (+${session.formatPrice(this.params.price)})`, "info");
                            }}
                        })
                    ]
                })
            ]
        });
    }
}

/** Concrete Product: ExcursionElement */
class ExcursionElement extends PageElement {
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
            name: "div", class: "tc-card excursion-card", attributes: { "data-category": "excursion" },
            content: [
                DOM.tag({
                    name: "div", class: "tc-card-header",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "EXCURSION / TOUR" }),
                            DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.title }),
                            DOM.tag({ name: "div", class: "tc-card-meta", content: `Гід: ${this.params.guide}` })
                        ]}),
                        DOM.tag({ name: "span", class: "badge badge-emerald", content: this.params.difficulty })
                    ]
                }),
                DOM.tag({
                    name: "div", class: "tc-card-body",
                    content: [
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Тривалість" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.duration })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Місце зустрічі" }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: this.params.meetingPoint })
                        ]}),
                        DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: "Вартість за особу" }),
                            DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": this.params.pricePerPerson }, content: session.formatPrice(this.params.pricePerPerson) })
                        ]})
                    ]
                }),
                DOM.tag({
                    name: "div", style: "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-line);padding-top:12px;",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: `ДЛЯ ${session.travelersCount} ОСІБ` }),
                            DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": total }, style: "font-family:var(--font-mono);font-size:16px;font-weight:700;", content: session.formatPrice(total) })
                        ]}),
                        DOM.tag({
                            name: "button", class: "btn btn-primary", content: "Записатися",
                            events: { click: () => {
                                session.addBookedItem({
                                    id: `tour-${Date.now()}`,
                                    type: "Екскурсія",
                                    title: this.params.title,
                                    subtitle: `Гід: ${this.params.guide} • ${session.travelersCount} осіб`,
                                    basePriceEur: total
                                });
                                TripEventBus.getInstance().emit("excursionBooked", { tour: this.params.title, amount: session.convertPrice(total), currency: session.getCurrency() });
                                showToast(`Екскурсію "${this.params.title}" додано (+${session.formatPrice(total)})`, "success");
                            }}
                        })
                    ]
                })
            ]
        });
    }
}

/** Concrete Product: BookingFormElement */
class BookingFormElement extends PageElement {
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
        const formFields = this.params.fields.map(field => DOM.tag({
            name: "div", class: "tc-form-group",
            content: [
                DOM.tag({ name: "label", class: "hud-label", content: field.label }),
                DOM.tag({ name: "input", class: "tc-input", attributes: { type: field.type || "text", name: field.name, placeholder: field.placeholder || "", required: "true" } })
            ]
        }));

        const feedbackMsg = DOM.tag({ name: "div", style: "display:none;padding:10px;margin-top:10px;border:1px solid var(--accent-emerald);color:var(--accent-emerald);font-family:var(--font-mono);font-size:11px;" });

        this.domElement = DOM.tag({
            name: "form", class: "tc-card booking-form-card", attributes: { "data-category": "form" },
            content: [
                DOM.tag({
                    name: "div", class: "tc-card-header",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "RESERVATION FORM" }),
                            DOM.tag({ name: "h3", class: "tc-card-title", content: this.params.title }),
                            DOM.tag({ name: "div", class: "tc-card-meta", content: `Цільовий тур: ${this.params.destination}` })
                        ]}),
                        DOM.tag({ name: "span", class: "badge badge-cyan", content: "DIRECT BOOKING" })
                    ]
                }),
                DOM.tag({ name: "div", class: "tc-card-body", content: formFields }),
                feedbackMsg,
                DOM.tag({ name: "div", style: "margin-top:14px;", content: DOM.tag({ name: "button", class: "btn btn-primary btn-block", attributes: { type: "submit" }, content: "Підтвердити бронь та сформувати ваучер" }) })
            ],
            events: {
                submit: (e) => {
                    e.preventDefault();
                    const formData = new FormData(this.domElement);
                    const values = Object.fromEntries(formData.entries());
                    feedbackMsg.style.display = "block";
                    feedbackMsg.textContent = `Ваучер успішно згенеровано на ім'я ${values.leadTraveler || "Клієнт"}. Підтвердження надіслано на ${values.email || "email"}.`;
                    TripEventBus.getInstance().emit("bookingConfirmed", { traveler: values.leadTraveler, email: values.email, destination: this.params.destination, currency: session.getCurrency() });
                    showToast(`Бронювання для ${values.leadTraveler || "туриста"} підтверджено!`, "success");
                    if (typeof openVoucherModal === "function") {
                        openVoucherModal(values.leadTraveler);
                    }
                    if (typeof this.params.onSubmit === "function") this.params.onSubmit(values);
                }
            }
        });
    }
}

/* Factory Method - Base Creator */
class TravelElementCreator {
    create(params) {
        throw new Error("Factory method 'create(params)' must be implemented by concrete subclass.");
    }

    createAndAppendTo(domElement, params = {}) {
        const element = this.create(params);
        element.build();
        if (domElement && domElement instanceof HTMLElement) {
            domElement.appendChild(element.getDOMElement());
        }
        TripSession.getInstance().incrementCreatedCount();
        TripEventBus.getInstance().emit("travelElementCreated", {
            creator: this.constructor.name,
            elementType: element.constructor.name,
            title: params.name || params.title || params.flightNumber || "Item"
        });
        return element;
    }
}

class HotelElementCreator extends TravelElementCreator {
    create(params = {}) { return new HotelElement(params); }
}

class FlightElementCreator extends TravelElementCreator {
    create(params = {}) { return new FlightElement(params); }
}

class ExcursionElementCreator extends TravelElementCreator {
    create(params = {}) { return new ExcursionElement(params); }
}

class BookingFormElementCreator extends TravelElementCreator {
    create(params = {}) { return new BookingFormElement(params); }
}

/* ============================================================
   4. ABSTRACT FACTORY PATTERN
   ============================================================ */

class TravelUIFactory {
    createButton(params) { throw new Error("createButton() must be implemented."); }
    createBadge(params) { throw new Error("createBadge() must be implemented."); }
    createCard(params) { throw new Error("createCard() must be implemented."); }
}

class ThemedButton extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({ text: params.text || "SELECT OPTION", variant: params.variant || "primary", onClick: params.onClick || null, ...params });
        this.themeName = themeName;
    }
    build() {
        this.domElement = DOM.tag({
            name: "button", class: `btn btn-${this.params.variant} themed-btn theme-${this.themeName}`,
            content: this.params.text,
            events: { click: (e) => {
                TripEventBus.getInstance().emit("themedButtonClicked", { theme: this.themeName, text: this.params.text });
                if (typeof this.params.onClick === "function") this.params.onClick(e);
            }}
        });
    }
}

class ThemedBadge extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({ label: params.label || "STANDARD", type: params.type || "amber", ...params });
        this.themeName = themeName;
    }
    build() {
        this.domElement = DOM.tag({ name: "span", class: `badge badge-${this.params.type} theme-${this.themeName}`, content: this.params.label });
    }
}

class ThemedCard extends PageElement {
    constructor(params = {}, themeName = "business") {
        super({ title: params.title || "Travel Service Panel", content: params.content || "", ...params });
        this.themeName = themeName;
    }
    build() {
        this.domElement = DOM.tag({
            name: "div", class: `tc-card themed-card theme-${this.themeName}`,
            content: [
                DOM.tag({ name: "div", class: "tc-card-header", content: [
                    DOM.tag({ name: "h4", class: "tc-card-title", content: this.params.title }),
                    DOM.tag({ name: "span", class: "hud-label", content: this.themeName.toUpperCase() })
                ]}),
                DOM.tag({ name: "div", class: "tc-card-body", content: this.params.content })
            ]
        });
    }
}

class BusinessDarkThemeFactory extends TravelUIFactory {
    createButton(params = {}) { return new ThemedButton({ ...params, variant: params.variant || "primary" }, "dark"); }
    createBadge(params = {}) { return new ThemedBadge({ ...params, type: params.type || "amber" }, "dark"); }
    createCard(params = {}) { return new ThemedCard(params, "dark"); }
}

class ResortLightThemeFactory extends TravelUIFactory {
    createButton(params = {}) { return new ThemedButton({ ...params, variant: params.variant || "secondary" }, "light"); }
    createBadge(params = {}) { return new ThemedBadge({ ...params, type: params.type || "cyan" }, "light"); }
    createCard(params = {}) { return new ThemedCard(params, "light"); }
}

class ThemeFactoryProvider {
    static getFactory(themeOverride = null) {
        const theme = themeOverride || TripSession.getInstance().getTheme();
        return theme === "light" ? new ResortLightThemeFactory() : new BusinessDarkThemeFactory();
    }
}

/* ============================================================
   5. BUILDER PATTERN
   ============================================================ */

class TravelItineraryWidget extends PageElement {
    constructor(config = {}) {
        super(config);
        this.destination = config.destination || "Destination";
        this.region = config.region || "";
        this.dates = config.dates || "Dates TBD";
        this.flight = config.flight || null;
        this.hotel = config.hotel || null;
        this.excursions = config.excursions || [];
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

        const headerNode = DOM.tag({ name: "div", class: "tc-card-header", content: [
            DOM.tag({ name: "div", content: [
                DOM.tag({ name: "div", class: "hud-label", content: "FULL TRAVEL PACKAGE" }),
                DOM.tag({ name: "h3", class: "tc-card-title", content: this.destination }),
                DOM.tag({ name: "div", class: "tc-card-meta", content: `${this.region} / ${this.dates}` })
            ]}),
            DOM.tag({ name: "span", class: "badge badge-amber", content: `${this.travelers} TRAVELERS` })
        ]});

        let flightNode = null;
        if (this.flight) {
            const flightTotal = this.flight.price * this.travelers;
            flightNode = DOM.tag({ name: "div", class: "tc-kv-row", content: [
                DOM.tag({ name: "span", class: "tc-kv-key", content: `Переліт: ${this.flight.airline}` }),
                DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": flightTotal, "data-price-prefix": `${this.flight.route} (`, "data-price-suffix": ")" }, content: `${this.flight.route} (${session.formatPrice(flightTotal)})` })
            ]});
        }

        let hotelNode = null;
        if (this.hotel) {
            hotelNode = DOM.tag({ name: "div", class: "tc-kv-row", content: [
                DOM.tag({ name: "span", class: "tc-kv-key", content: `Готель: ${this.hotel.name}` }),
                DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": this.hotel.totalCost, "data-price-prefix": `${this.hotel.roomType} (`, "data-price-suffix": ")" }, content: `${this.hotel.roomType} (${session.formatPrice(this.hotel.totalCost)})` })
            ]});
        }

        let excursionsNode = null;
        if (this.excursions.length > 0) {
            excursionsNode = DOM.tag({ name: "div", style: "display:flex;flex-direction:column;gap:4px;margin-top:6px;",
                content: this.excursions.map(ex => {
                    const exTotal = ex.price * this.travelers;
                    return DOM.tag({ name: "div", class: "tc-kv-row", content: [
                        DOM.tag({ name: "span", class: "tc-kv-key", content: `Тур: ${ex.title}` }),
                        DOM.tag({ name: "span", class: "tc-kv-val tc-price-val", attributes: { "data-base-eur": exTotal }, content: session.formatPrice(exTotal) })
                    ]});
                })
            });
        }

        const footerNode = DOM.tag({
            name: "div", style: "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-line);padding-top:12px;margin-top:8px;",
            content: [
                DOM.tag({ name: "div", content: [
                    DOM.tag({ name: "div", class: "hud-label", content: "ЗАГАЛЬНА ВАРТІСТЬ ПАКЕТА" }),
                    DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": total }, style: "font-family:var(--font-mono);font-size:16px;font-weight:700;", content: session.formatPrice(total) })
                ]}),
                DOM.tag({ name: "button", class: "btn btn-primary", content: "Оформити весь тур",
                    events: { click: () => {
                        session.addBookedItem({
                            id: `builder-${Date.now()}`,
                            type: "Комплексний тур (Builder)",
                            title: this.destination,
                            subtitle: `${this.flight ? this.flight.airline : "Без перельоту"} • ${this.hotel ? this.hotel.name : "Без готелю"} • ${this.travelers} осіб`,
                            basePriceEur: total
                        });
                        TripEventBus.getInstance().emit("itineraryConfirmed", { destination: this.destination, total: session.convertPrice(total), currency: session.getCurrency() });
                        showToast(`Комплексний тур "${this.destination}" додано до маршруту (+${session.formatPrice(total)})`, "success");
                    }}
                })
            ]
        });

        this.domElement = DOM.tag({
            name: "div", class: "tc-card travel-itinerary-card", attributes: { "data-category": "builder" },
            content: [
                headerNode,
                DOM.tag({ name: "div", class: "tc-card-body", content: [flightNode, hotelNode, excursionsNode].filter(Boolean) }),
                this.footerText ? DOM.tag({ name: "div", class: "hud-label", style: "color:var(--text-faint);margin-top:4px;", content: this.footerText }) : null,
                footerNode
            ].filter(Boolean)
        });
    }
}

class ItineraryBuilder {
    constructor() { this.reset(); }

    reset() {
        this.config = { destination: "Новий Маршрут", region: "", dates: "", flight: null, hotel: null, excursions: [], travelers: 2, actions: [], footerText: "", theme: "dark" };
        return this;
    }

    setDestination(destination, region = "") { this.config.destination = destination; this.config.region = region; return this; }
    setDates(dates) { this.config.dates = dates; return this; }
    setFlight(airline, route, flightNo, price) { this.config.flight = { airline, route, flightNo, price }; return this; }
    setHotel(name, roomType, nights, pricePerNight) { this.config.hotel = { name, roomType, nights, pricePerNight, totalCost: nights * pricePerNight }; return this; }
    addExcursion(title, price) { this.config.excursions.push({ title, price }); return this; }
    setTravelers(count) { this.config.travelers = count; return this; }
    addAction(label, onClick = null, variant = "primary") { this.config.actions.push({ label, onClick, variant }); return this; }
    setFooter(text) { this.config.footerText = text; return this; }
    setTheme(theme) { this.config.theme = theme; return this; }

    build() {
        const widget = new TravelItineraryWidget(this.config);
        TripEventBus.getInstance().emit("itineraryBuilt", { destination: this.config.destination, totalEstimated: widget.calculateTotal() });
        return widget;
    }
}

class ItineraryDirector {
    constructor(builder) { this.builder = builder; }
    setBuilder(builder) { this.builder = builder; }

    buildAlpineSkiTrip(theme = "dark") {
        return this.builder.reset().setTheme(theme)
            .setDestination("Альпійський Гірськолижний Вікенд", "Швейцарія / Церматт")
            .setDates("12.02.2026 - 16.02.2026").setTravelers(2)
            .setFlight("Swiss Air", "VIE -> ZRH", "LX-1420", 280)
            .setHotel("Grand Alpine Resort", "Deluxe Suite Matterhorn", 4, 340)
            .addExcursion("Сходження на Горнерграт та скі-пас", 140)
            .addExcursion("Альпійське термальне спа", 80)
            .setFooter("Пакет включає трансфер на потязі Zermatt Shuttle та страховку.").build();
    }

    buildMediterraneanCruise(theme = "dark") {
        return this.builder.reset().setTheme(theme)
            .setDestination("Середземноморський Круїз", "Франція - Італія - Іспанія")
            .setDates("15.06.2026 - 22.06.2026").setTravelers(2)
            .setFlight("Air France", "WAW -> NCE", "AF-1180", 220)
            .setHotel("Riviera Royal Yacht Club", "Ocean Balcony Cabin", 7, 290)
            .addExcursion("Тур старим містом Ніцци та дегустація", 90)
            .addExcursion("Екскурсія в Монако та Монте-Карло", 130)
            .setFooter("У вартість входить All-Inclusive харчування на борту.").build();
    }

    buildTokyoExplorer(theme = "dark") {
        return this.builder.reset().setTheme(theme)
            .setDestination("Експедиція: Токіо та Кіото", "Японія")
            .setDates("01.10.2026 - 10.10.2026").setTravelers(2)
            .setFlight("ANA All Nippon", "FRA -> HND", "NH-204", 750)
            .setHotel("Park Hyatt Tokyo", "Park View Room", 9, 310)
            .addExcursion("Швидкісний потяг Shinkansen до Кіото", 150)
            .addExcursion("Традиційна чайна церемонія в Гіоні", 85)
            .setFooter("Включає проїзний JR Pass та персонального англомовного гіда.").build();
    }
}

/* ============================================================
   6. PROTOTYPE PATTERN
   ============================================================ */

class Prototype {
    clone() { throw new Error("Method 'clone()' must be implemented by concrete prototype."); }
}

class TripPackageCard extends PageElement {
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

    clone(overrides = {}) {
        const nextCloneCount = this.cloneCount + 1;
        const clonedInstance = new TripPackageCard({
            templateId: this.templateId,
            cloneCount: nextCloneCount,
            title: overrides.title || `${this.title} (Клон #${nextCloneCount})`,
            category: overrides.category || this.category,
            badge: overrides.badge || `CLONE #${nextCloneCount}`,
            tags: overrides.tags ? [...overrides.tags] : [...this.tags],
            details: { ...this.details, ...(overrides.details || {}) },
            price: overrides.price !== undefined ? overrides.price : this.price
        });
        TripEventBus.getInstance().emit("tripPackageCloned", { sourceTemplate: this.templateId, newTitle: clonedInstance.title, cloneVersion: nextCloneCount });
        return clonedInstance;
    }

    build() {
        const session = TripSession.getInstance();
        this.domElement = DOM.tag({
            name: "div", class: "tc-card trip-package-card", attributes: { "data-category": "prototype" },
            content: [
                DOM.tag({ name: "div", class: "tc-card-header", content: [
                    DOM.tag({ name: "div", content: [
                        DOM.tag({ name: "div", class: "hud-label", content: `TEMPLATE / ${this.templateId}` }),
                        DOM.tag({ name: "h4", class: "tc-card-title", content: this.title }),
                        DOM.tag({ name: "div", class: "tc-card-meta", content: `Категорія: ${this.category}` })
                    ]}),
                    DOM.tag({ name: "span", class: "badge badge-amber", content: this.badge })
                ]}),
                DOM.tag({ name: "div", class: "tc-card-body", content: [
                    DOM.tag({ name: "div", style: "display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;", content: this.tags.map(t => DOM.tag({ name: "span", class: "badge", content: t })) }),
                    DOM.tag({ name: "div", style: "display:flex;flex-direction:column;gap:4px;",
                        content: Object.entries(this.details).map(([k, v]) => DOM.tag({ name: "div", class: "tc-kv-row", content: [
                            DOM.tag({ name: "span", class: "tc-kv-key", content: k }),
                            DOM.tag({ name: "span", class: "tc-kv-val", content: String(v) })
                        ]}))
                    })
                ]}),
                DOM.tag({
                    name: "div", style: "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-line);padding-top:12px;gap:8px;",
                    content: [
                        DOM.tag({ name: "div", content: [
                            DOM.tag({ name: "div", class: "hud-label", content: "БАЗОВИЙ ТАРИФ" }),
                            DOM.tag({ name: "div", class: "tc-price-val", attributes: { "data-base-eur": this.price }, style: "font-family:var(--font-mono);font-size:15px;font-weight:700;", content: session.formatPrice(this.price) })
                        ]}),
                        DOM.tag({
                            name: "div", style: "display:flex;gap:6px;",
                            content: [
                                DOM.tag({
                                    name: "button", class: "btn btn-primary btn-sm", content: "Забронювати",
                                    events: { click: (e) => {
                                        e.stopPropagation();
                                        session.addBookedItem({
                                            id: `package-${Date.now()}`,
                                            type: "Турпакет (Prototype)",
                                            title: this.title,
                                            subtitle: `${this.category} • ${this.badge}`,
                                            basePriceEur: this.price
                                        });
                                        showToast(`Пакет "${this.title}" додано до маршруту (+${session.formatPrice(this.price)})`, "success");
                                    }}
                                }),
                                DOM.tag({
                                    name: "button", class: "btn btn-outline btn-sm", content: "Клонувати",
                                    events: { click: (e) => {
                                        e.stopPropagation();
                                        const nextClone = this.clone();
                                        nextClone.render(this.domElement.parentElement);
                                        showToast(`Створено незалежний клон пакета "${nextClone.title}" (Версія #${nextClone.cloneCount})`, "info");
                                    }}
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

class TripTemplateRegistry {
    constructor() {
        this.prototypes = new Map();
        this.initializeDefaultPrototypes();
    }

    initializeDefaultPrototypes() {
        this.register("weekend-carpathians", new TripPackageCard({
            templateId: "weekend-carpathians",
            title: "Карпатський Релакс: Буковель та Спа",
            category: "Гори / Активний відпочинок",
            badge: "TEMPLATE / CARPATHIANS",
            tags: ["Hotel 4*", "Ski-Pass", "SPA", "Transfer"],
            details: { "Тривалість": "3 дні / 2 ночі", "Харчування": "Сніданки (Шведський стіл)", "Трансфер": "Івано-Франківськ - Буковель", "Гірськолижна страховка": "Включено" },
            price: 240
        }));

        this.register("family-mediterranean", new TripPackageCard({
            templateId: "family-mediterranean",
            title: "Середземноморський Сімейний Курорт",
            category: "Пляж / All-Inclusive",
            badge: "TEMPLATE / FAMILY",
            tags: ["5* Resort", "Sea View", "Ultra All-Inclusive", "Kids Club"],
            details: { "Тривалість": "7 ночей", "Харчування": "Ultra All-Inclusive", "Аквапарк": "Безлімітний доступ", "Пляжна лінія": "1-ша лінія, пісок" },
            price: 890
        }));

        this.register("euro-city-break", new TripPackageCard({
            templateId: "euro-city-break",
            title: "Європейський Сіті-Брейк: Прага та Відень",
            category: "Культура / Архітектура",
            badge: "TEMPLATE / CITY BREAK",
            tags: ["Boutique Hotel", "Sightseeing", "Train Transfer"],
            details: { "Тривалість": "4 дні / 3 ночі", "Харчування": "Сніданки", "Транспорт": "Швидкісний потяг RegioJet", "Оглядова екскурсія": "З україномовним гідом" },
            price: 360
        }));
    }

    register(key, prototype) { this.prototypes.set(key, prototype); }
    get(key) { return this.prototypes.get(key); }
    clone(key, overrides = {}) {
        const proto = this.prototypes.get(key);
        if (!proto) throw new Error(`Trip prototype with key '${key}' not found in registry.`);
        return proto.clone(overrides);
    }
    getAllKeys() { return Array.from(this.prototypes.keys()); }
}

/* ============================================================
   7. MAIN APPLICATION CONTROLLER
   ============================================================ */

// Singletons & Registry Initialization
const session = TripSession.getInstance();
const eventBus = TripEventBus.getInstance();
const templateRegistry = new TripTemplateRegistry();

// Factory Method Creators
const hotelCreator = new HotelElementCreator();
const flightCreator = new FlightElementCreator();
const excursionCreator = new ExcursionElementCreator();
const bookingFormCreator = new BookingFormElementCreator();

// Builder & Director
const itineraryBuilder = new ItineraryBuilder();
const itineraryDirector = new ItineraryDirector(itineraryBuilder);

// State tracking
let clonesCount = 0;
let currentTab = "all";

// DOM References
let canvasGrid, consoleLog, currencyToggleBtn, currencyDisplay, themeToggleBtn, themeDisplay;
let runAllBtn, clearCanvasBtn, clearLogsBtn, tabButtons, eyebrowPrefix, scenarioTitle;
let scenarioDesc, actionControls, metricBudget, metricTravelers, metricCreated, metricClones;

function logEvent(event, data, timestamp = new Date().toLocaleTimeString()) {
    const row = document.createElement("div");
    row.className = "log-row";
    let details = "";

    if (event === "travelElementCreated") {
        details = `[${data.creator}] -> ${data.elementType} ("${data.title}")`;
    } else if (event === "hotelBooked") {
        details = `Заброньовано готель: ${data.hotel} (+${data.amount} ${data.currency})`;
    } else if (event === "flightBooked") {
        details = `Додано переліт: ${data.flight} (+${data.price} ${data.currency})`;
    } else if (event === "excursionBooked") {
        details = `Заброньовано тур: ${data.tour} (+${data.amount} ${data.currency})`;
    } else if (event === "itineraryBuilt") {
        details = `Builder скомпонував тур: "${data.destination}" (Оцінка: ${data.totalEstimated} ${session.getCurrency()})`;
    } else if (event === "tripPackageCloned") {
        details = `Prototype клонував пакет "${data.sourceTemplate}" (Версія #${data.cloneVersion})`;
        clonesCount++;
        if (metricClones) metricClones.textContent = clonesCount;
    } else if (event === "bookingConfirmed") {
        details = `Підтверджено бронювання для ${data.traveler} (${data.destination})`;
    } else if (event === "currencyChanged") {
        details = `Валюту змінено на ${data.currency}`;
    } else if (event === "themeChanged") {
        details = `Тему інтерфейсу змінено на ${data.theme ? data.theme.toUpperCase() : ""}`;
    } else {
        details = JSON.stringify(data);
    }

    row.innerHTML = `<span class="log-time">${timestamp}</span> <span class="log-tag">[${event}]</span> <span>${details}</span>`;
    if (consoleLog) consoleLog.prepend(row);
}

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.remove("theme-dark");
        document.body.classList.add("theme-light");
        if (themeDisplay) themeDisplay.textContent = "ТЕМА: LIGHT";
    } else {
        document.body.classList.remove("theme-light");
        document.body.classList.add("theme-dark");
        if (themeDisplay) themeDisplay.textContent = "ТЕМА: DARK";
    }
}

function updateCardsCurrency() {
    if (!canvasGrid) return;
    canvasGrid.querySelectorAll(".tc-price-val").forEach(el => {
        const eur = parseFloat(el.getAttribute("data-base-eur"));
        if (!isNaN(eur)) {
            const prefix = el.getAttribute("data-price-prefix") || "";
            const suffix = el.getAttribute("data-price-suffix") || "";
            el.textContent = `${prefix}${session.formatPrice(eur)}${suffix}`;
        }
    });
}

function updateCurrencyDisplay() {
    if (currencyDisplay) currencyDisplay.textContent = `ВАЛЮТА: ${session.getCurrency()}`;
    if (metricBudget) metricBudget.textContent = session.formatPrice(session.totalBudget);
    renderCart();
}

function showToast(msg, type = "success") {
    const container = document.getElementById("hud-toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `hud-toast hud-toast-${type}`;
    toast.innerHTML = `
        <span class="toast-msg">${msg}</span>
        <button class="toast-close" title="Закрити">✕</button>
    `;
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.onclick = () => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 250);
    };
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => toast.remove(), 250);
        }
    }, 3500);
}

function renderCart() {
    const list = document.getElementById("cart-items-list");
    const totalEl = document.getElementById("cart-total-amount");
    const cartDisplay = document.getElementById("cart-display");

    const items = session.getBookedItems();
    if (cartDisplay) {
        cartDisplay.textContent = `КОШИК: ${items.length} (${session.formatPrice(session.totalBudget)})`;
    }

    if (!list || !totalEl) return;

    if (items.length === 0) {
        list.innerHTML = `<div class="cart-empty-state">Ваш маршрут порожній.<br>Оберіть послуги на робочому полі та натисніть «Забронювати».</div>`;
        totalEl.textContent = session.formatPrice(0);
        return;
    }

    list.innerHTML = "";
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "cart-item-card";
        const converted = session.formatPrice(item.basePriceEur);
        card.innerHTML = `
            <div class="cart-item-top">
                <div>
                    <span class="badge badge-amber" style="font-size:9px;">${item.type}</span>
                    <div class="cart-item-title">${item.title}</div>
                    ${item.subtitle ? `<div class="cart-item-sub">${item.subtitle}</div>` : ""}
                </div>
                <button class="cart-remove-btn" data-id="${item.id}" title="Видалити з туру">✕</button>
            </div>
            <div class="cart-item-bottom">
                <span class="hud-label">ВАРТІСТЬ</span>
                <span class="cart-item-price">${converted}</span>
            </div>
        `;
        const rmBtn = card.querySelector(".cart-remove-btn");
        rmBtn.onclick = () => {
            session.removeBookedItem(item.id);
            showToast(`Видалено з маршруту: "${item.title}"`, "amber");
        };
        list.appendChild(card);
    });

    totalEl.textContent = session.formatPrice(session.totalBudget);
}

function toggleCart(forceState) {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (!drawer || !backdrop) return;
    const isOpen = drawer.classList.contains("open");
    const newState = (typeof forceState === "boolean") ? forceState : !isOpen;
    drawer.classList.toggle("open", newState);
    backdrop.classList.toggle("open", newState);
    if (newState) renderCart();
}

function openVoucherModal(travelerName) {
    const modal = document.getElementById("voucher-modal");
    if (!modal) return;
    const travelerEl = document.getElementById("voucher-traveler-name");
    const countEl = document.getElementById("voucher-travelers-count");
    const dateEl = document.getElementById("voucher-date");
    const listEl = document.getElementById("voucher-items-list");
    const totalEl = document.getElementById("voucher-total");
    const codeEl = document.getElementById("voucher-id");

    const items = session.getBookedItems();
    if (items.length === 0) {
        showToast("Додайте хоча б одну послугу або тур до маршруту перед формуванням ваучера!", "amber");
        return;
    }

    if (codeEl) codeEl.textContent = `TC-2026-${Math.floor(Math.random() * 89999 + 10000)}`;
    if (travelerEl) travelerEl.textContent = travelerName || "Олександр Коваленко (Lead Traveler)";
    if (countEl) countEl.textContent = `${session.travelersCount} особи`;
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString("uk-UA");

    if (listEl) {
        listEl.innerHTML = "";
        items.forEach(it => {
            const row = document.createElement("div");
            row.className = "voucher-item-row";
            row.innerHTML = `
                <div>
                    <strong>[${it.type}]</strong> ${it.title}
                    ${it.subtitle ? `<div style="color:var(--text-muted);font-size:11px;">${it.subtitle}</div>` : ""}
                </div>
                <div style="font-family:var(--font-mono);font-weight:700;">${session.formatPrice(it.basePriceEur)}</div>
            `;
            listEl.appendChild(row);
        });
    }

    if (totalEl) totalEl.textContent = session.formatPrice(session.totalBudget);

    modal.classList.add("open");
    toggleCart(false);
    showToast("Електронний ваучер мандрівника успішно згенеровано", "success");
}

function closeVoucherModal() {
    const modal = document.getElementById("voucher-modal");
    if (modal) modal.classList.remove("open");
}

function applyFiltersAndSearch() {
    const query = (document.getElementById("canvas-search-input")?.value || "").toLowerCase().trim();
    const activeChip = document.querySelector(".filter-chip.active");
    const filterCategory = activeChip ? activeChip.dataset.filter : "all";

    if (!canvasGrid) return;
    const cards = canvasGrid.querySelectorAll(".tc-card");
    cards.forEach(card => {
        const category = card.dataset.category || "other";
        const text = card.textContent.toLowerCase();

        const matchesCategory = (filterCategory === "all") || (category === filterCategory);
        const matchesSearch = !query || text.includes(query);

        card.style.display = (matchesCategory && matchesSearch) ? "" : "none";
    });
}

/* =================== PATTERN DEMONSTRATIONS =================== */

function runIntegratedScenario() {
    canvasGrid.innerHTML = "";
    eventBus.emit("scenarioStarted", { name: "Full Itinerary Showcase" });

    const factory = ThemeFactoryProvider.getFactory();
    const themedCard = factory.createCard({
        title: "[ABSTRACT FACTORY] ТУРИСТИЧНИЙ ХАБ TRIPCRAFT",
        content: `<p style="font-size:13px;line-height:1.6;">Ласкаво просимо до TripCraft Studio. Всі компоненти стилізовані згідно з поточною фабрикою <strong>(${session.getTheme().toUpperCase()})</strong>.</p>`
    });
    themedCard.render(canvasGrid);

    flightCreator.createAndAppendTo(canvasGrid, { flightNumber: "LX-1420", airline: "Swiss International Air Lines", origin: "VIE (Відень)", destination: "ZRH (Цюрих)", departureTime: "08:45", arrivalTime: "10:10", seatClass: "Business Class", price: 280 });
    hotelCreator.createAndAppendTo(canvasGrid, { name: "Grand Alpine Resort & Spa", location: "Церматт, Швейцарія", stars: "5 STARS LUXURY", roomType: "Matterhorn Panoramic Suite", pricePerNight: 340, nights: 4 });
    excursionCreator.createAndAppendTo(canvasGrid, { title: "Сходження на Горнерграт та панорамний трекінг", guide: "Ганс Мюллер (UIAGM Mountain Guide)", duration: "5 годин", pricePerPerson: 110 });

    const skiItinerary = itineraryDirector.buildAlpineSkiTrip(session.getTheme());
    skiItinerary.render(canvasGrid);

    const clonedTrip = templateRegistry.clone("weekend-carpathians", {
        title: "Карпатський Експрес (Індивідуальний VIP-Клон)",
        details: { "Тривалість": "4 дні / 3 ночі", "Номер": "Panoramic Chalet", "Скі-пас": "VIP Fast-Line на всі підйомники" },
        price: 320
    });
    clonedTrip.render(canvasGrid);

    bookingFormCreator.createAndAppendTo(canvasGrid, { title: "Фінальне підтвердження подорожі", destination: "Швейцарія / Альпи (Повний маршрут)" });
}

function renderSingletonView() {
    canvasGrid.innerHTML = "";
    const inst1 = TripSession.getInstance();
    const inst2 = new TripSession();
    const isSame = (inst1 === inst2);

    const card = document.createElement("div");
    card.className = "tc-card";
    card.style.gridColumn = "1 / -1";
    card.innerHTML = `
        <div class="tc-card-header">
            <div>
                <div class="hud-label">PATTERN VERIFICATION / SINGLETON</div>
                <h3 class="tc-card-title">Патерн "Одинак" (TripSession)</h3>
                <div class="tc-card-meta">Керування станом бронювання, валютою та підписниками</div>
            </div>
            <span class="badge badge-amber">SINGLETON: ACTIVE</span>
        </div>
        <div class="tc-card-body" style="font-family:var(--font-mono);font-size:12px;">
            <div class="tc-kv-row"><span class="tc-kv-key">inst1 = TripSession.getInstance()</span><span class="tc-kv-val">Memory Reference #1</span></div>
            <div class="tc-kv-row"><span class="tc-kv-key">inst2 = new TripSession()</span><span class="tc-kv-val">Memory Reference #2</span></div>
            <div class="tc-kv-row" style="margin-top:8px;"><span class="tc-kv-key">inst1 === inst2 (Тотожність)</span><span class="tc-kv-val" style="color:var(--accent-emerald);font-weight:700;">${isSame} (Єдиний екземпляр у системі)</span></div>
            <div class="tc-kv-row"><span class="tc-kv-key">Поточна валюта сесії</span><span class="tc-kv-val" id="si-currency">${inst1.getCurrency()}</span></div>
            <div class="tc-kv-row"><span class="tc-kv-key">Кількість туристів</span><span class="tc-kv-val" id="si-travelers">${inst1.travelersCount} осіб</span></div>
            <div class="tc-kv-row"><span class="tc-kv-key">Загальний накопичений бюджет</span><span class="tc-kv-val" id="si-budget">${inst1.totalBudget} ${inst1.getCurrency()}</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;">
            <button id="session-add-traveler" class="btn btn-primary btn-sm">+ Додати туриста</button>
            <button id="session-toggle-currency" class="btn btn-secondary btn-sm">Змінити валюту (EUR / USD / UAH)</button>
            <button id="session-reset-budget" class="btn btn-outline btn-sm">Скинути бюджет</button>
        </div>
    `;
    canvasGrid.appendChild(card);

    const refreshSingletonCard = () => {
        const el = document.getElementById("si-currency");
        const el2 = document.getElementById("si-travelers");
        const el3 = document.getElementById("si-budget");
        if (el) el.textContent = session.getCurrency();
        if (el2) el2.textContent = `${session.travelersCount} осіб`;
        if (el3) el3.textContent = `${session.totalBudget} ${session.getCurrency()}`;
    };

    document.getElementById("session-add-traveler").onclick = () => { session.setTravelersCount(session.travelersCount + 1); refreshSingletonCard(); };
    document.getElementById("session-toggle-currency").onclick = () => {
        const next = session.currency === "EUR" ? "USD" : session.currency === "USD" ? "UAH" : "EUR";
        session.setCurrency(next);
        refreshSingletonCard();
    };
    document.getElementById("session-reset-budget").onclick = () => { session.reset(); refreshSingletonCard(); };
}

function renderFactoryMethodView() {
    canvasGrid.innerHTML = "";
    hotelCreator.createAndAppendTo(canvasGrid, { name: "Boutique Hotel Grand Place", location: "Брюссель, Бельгія", stars: "4 STARS SUPERIOR", roomType: "Executive Room", pricePerNight: 190, nights: 3 });
    flightCreator.createAndAppendTo(canvasGrid, { flightNumber: "AF-1180", airline: "Air France", origin: "WAW (Варшава)", destination: "NCE (Ніцца)", departureTime: "11:20", arrivalTime: "13:45", seatClass: "Economy Premium", price: 210 });
    excursionCreator.createAndAppendTo(canvasGrid, { title: "Морський каякінг та скелі Лазурового берега", guide: "Марк Дюбуа", duration: "3 години", pricePerPerson: 75 });
    bookingFormCreator.createAndAppendTo(canvasGrid, { title: "Реєстрація на індивідуальний тур", destination: "Французька Рив'єра" });
}

function renderAbstractFactoryView() {
    canvasGrid.innerHTML = "";

    const darkFactory = ThemeFactoryProvider.getFactory("dark");
    const lightFactory = ThemeFactoryProvider.getFactory("light");

    const darkBox = document.createElement("div");
    darkBox.className = "tc-card";
    darkBox.innerHTML = `
        <div class="tc-card-header"><div><div class="hud-label">BUSINESS DARK FAMILY</div><h4 class="tc-card-title">BusinessDarkThemeFactory</h4></div><span class="badge badge-amber">DARK HUD</span></div>
        <div id="dark-items" class="tc-card-body" style="gap:12px;margin-top:10px;"></div>
    `;
    canvasGrid.appendChild(darkBox);
    const darkItems = darkBox.querySelector("#dark-items");
    darkFactory.createBadge({ label: "First Class Priority", type: "amber" }).render(darkItems);
    darkFactory.createButton({ text: "Book Private Jet Transfer", variant: "primary" }).render(darkItems);
    darkFactory.createCard({ title: "VIP Lounge Access Voucher", content: "Доступ до VIP-залів очікування у терміналах Відня, Цюриха та Парижа." }).render(darkItems);

    const lightBox = document.createElement("div");
    lightBox.className = "tc-card";
    lightBox.innerHTML = `
        <div class="tc-card-header"><div><div class="hud-label">RESORT LIGHT FAMILY</div><h4 class="tc-card-title">ResortLightThemeFactory</h4></div><span class="badge badge-cyan">LIGHT HUD</span></div>
        <div id="light-items" class="tc-card-body" style="gap:12px;margin-top:10px;"></div>
    `;
    canvasGrid.appendChild(lightBox);
    const lightItems = lightBox.querySelector("#light-items");
    lightFactory.createBadge({ label: "All-Inclusive Resort Pass", type: "cyan" }).render(lightItems);
    lightFactory.createButton({ text: "Reserve Beachside Cabana", variant: "secondary" }).render(lightItems);
    lightFactory.createCard({ title: "Resort Wellness Program", content: "Ранкова йога на узбережжі, спа-процедури та відкриті басейни з морською водою." }).render(lightItems);
}

function renderBuilderView() {
    canvasGrid.innerHTML = "";
    itineraryDirector.buildAlpineSkiTrip(session.getTheme()).render(canvasGrid);
    itineraryDirector.buildMediterraneanCruise(session.getTheme()).render(canvasGrid);
    itineraryDirector.buildTokyoExplorer(session.getTheme()).render(canvasGrid);
}

function renderPrototypeView() {
    canvasGrid.innerHTML = "";
    const header = document.createElement("div");
    header.className = "tc-card";
    header.style.gridColumn = "1 / -1";
    header.innerHTML = `
        <div class="tc-card-header">
            <div><div class="hud-label">PROTOTYPE REGISTRY / TRIP PACKAGES</div><h3 class="tc-card-title">Патерн "Прототип" (TripTemplateRegistry)</h3><div class="tc-card-meta">Швидке клонування перевірених пакетів відпочинку з можливістю точкових мутацій</div></div>
            <span class="badge badge-amber">REGISTRY READY</span>
        </div>
        <div class="tc-card-body"><p style="font-size:13px;">Нижче наведено базові шаблони, зареєстровані в системі. Натисніть кнопку <strong>"Клонувати пакет"</strong> на будь-якій картці.</p></div>
    `;
    canvasGrid.appendChild(header);

    templateRegistry.getAllKeys().forEach(key => {
        const proto = templateRegistry.get(key);
        if (proto) proto.render(canvasGrid);
    });
}

function updateToolbar(tab) {
    actionControls.innerHTML = "";

    if (tab === "all") {
        eyebrowPrefix.textContent = "00 /";
        scenarioTitle.textContent = "Спільний інтегрований сценарій організації туру";
        scenarioDesc.textContent = "Усі 5 патернів у дії: Singleton зберігає параметри туру, Abstract Factory формує стилі, Factory Method створює складові, Builder збирає повний тур, а Prototype клонує пакети.";
        const btn = document.createElement("button");
        btn.className = "btn btn-primary btn-sm";
        btn.textContent = "Перезапустити сценарій";
        btn.onclick = runIntegratedScenario;
        actionControls.appendChild(btn);
    } else if (tab === "singleton") {
        eyebrowPrefix.textContent = "01 /";
        scenarioTitle.textContent = "Патерн Одинак (Singleton / TripSession)";
        scenarioDesc.textContent = "Забезпечує єдиний екземпляр сесії, контролює бюджет подорожі, кількість осіб, валюту та журнал аудиту подій.";
        const btn = document.createElement("button");
        btn.className = "btn btn-primary btn-sm";
        btn.textContent = "Перевірити синглтон";
        btn.onclick = renderSingletonView;
        actionControls.appendChild(btn);
    } else if (tab === "factory-method") {
        eyebrowPrefix.textContent = "02 /";
        scenarioTitle.textContent = "Патерн Фабричний метод (Factory Method)";
        scenarioDesc.textContent = "Базовий творець TravelElementCreator делегує створення конкретних об'єктів підкласам Hotel, Flight, Excursion та BookingForm.";
        const btnHotel = document.createElement("button");
        btnHotel.className = "btn btn-secondary btn-sm"; btnHotel.textContent = "+ Створити Готель";
        btnHotel.onclick = () => hotelCreator.createAndAppendTo(canvasGrid, { name: `Курортний готель #${Math.floor(Math.random() * 1000)}`, location: "Альпи / Закопане", pricePerNight: 150, nights: 3 });
        const btnFlight = document.createElement("button");
        btnFlight.className = "btn btn-secondary btn-sm"; btnFlight.textContent = "+ Додати Авіарейс";
        btnFlight.onclick = () => flightCreator.createAndAppendTo(canvasGrid, { flightNumber: `PS-${Math.floor(Math.random() * 900 + 100)}`, origin: "KBP (Київ)", destination: "CDG (Париж)", price: 240 });
        actionControls.appendChild(btnHotel);
        actionControls.appendChild(btnFlight);
    } else if (tab === "abstract-factory") {
        eyebrowPrefix.textContent = "03 /";
        scenarioTitle.textContent = "Патерн Абстрактна фабрика (Abstract Factory)";
        scenarioDesc.textContent = "Створює узгоджені сімейства кнопок, бейджів та карток для темного бізнес-режиму (BusinessDark) та світлого курортного (ResortLight).";
        const btnSwitch = document.createElement("button");
        btnSwitch.className = "btn btn-primary btn-sm"; btnSwitch.textContent = "Змінити тему платформи";
        btnSwitch.onclick = () => { session.setTheme(session.getTheme() === "dark" ? "light" : "dark"); renderAbstractFactoryView(); };
        actionControls.appendChild(btnSwitch);
    } else if (tab === "builder") {
        eyebrowPrefix.textContent = "04 /";
        scenarioTitle.textContent = "Патерн Будівельник (Builder & Director)";
        scenarioDesc.textContent = "ItineraryBuilder покроково компонує комбіновані туристичні пакети за алгоритмами директора ItineraryDirector.";
        const btnAlpine = document.createElement("button");
        btnAlpine.className = "btn btn-secondary btn-sm"; btnAlpine.textContent = "+ Альпійський тур";
        btnAlpine.onclick = () => itineraryDirector.buildAlpineSkiTrip(session.getTheme()).render(canvasGrid);
        const btnCruise = document.createElement("button");
        btnCruise.className = "btn btn-secondary btn-sm"; btnCruise.textContent = "+ Круїз Ніцца-Монако";
        btnCruise.onclick = () => itineraryDirector.buildMediterraneanCruise(session.getTheme()).render(canvasGrid);
        actionControls.appendChild(btnAlpine);
        actionControls.appendChild(btnCruise);
    } else if (tab === "prototype") {
        eyebrowPrefix.textContent = "05 /";
        scenarioTitle.textContent = "Патерн Прототип (Prototype & Registry)";
        scenarioDesc.textContent = "Швидке клонування комплексних туристичних пакетів з реєстру TripTemplateRegistry з точковою заміною параметрів.";
        const btnClone = document.createElement("button");
        btnClone.className = "btn btn-primary btn-sm"; btnClone.textContent = "+ Клонувати сімейний тур з реєстру";
        btnClone.onclick = () => {
            const clone = templateRegistry.clone("family-mediterranean", { title: `Сімейний All-Inclusive (Клон #${Math.floor(Math.random() * 100)})`, price: 920 });
            clone.render(canvasGrid);
        };
        actionControls.appendChild(btnClone);
    }
}

function setActiveTab(tab) {
    currentTab = tab;
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    updateToolbar(tab);

    if (tab === "all") runIntegratedScenario();
    else if (tab === "singleton") renderSingletonView();
    else if (tab === "factory-method") renderFactoryMethodView();
    else if (tab === "abstract-factory") renderAbstractFactoryView();
    else if (tab === "builder") renderBuilderView();
    else if (tab === "prototype") renderPrototypeView();
}

function init() {
    // DOM References
    canvasGrid = document.getElementById("canvas-grid");
    consoleLog = document.getElementById("console-log");
    currencyToggleBtn = document.getElementById("currency-toggle-btn");
    currencyDisplay = document.getElementById("currency-display");
    themeToggleBtn = document.getElementById("theme-toggle-btn");
    themeDisplay = document.getElementById("theme-display");
    runAllBtn = document.getElementById("run-all-scenario-btn");
    clearCanvasBtn = document.getElementById("clear-canvas-btn");
    clearLogsBtn = document.getElementById("clear-logs-btn");
    tabButtons = document.querySelectorAll(".pattern-tab");
    eyebrowPrefix = document.getElementById("eyebrow-prefix");
    scenarioTitle = document.getElementById("scenario-title");
    scenarioDesc = document.getElementById("scenario-desc");
    actionControls = document.getElementById("action-controls");
    metricBudget = document.getElementById("metric-budget");
    metricTravelers = document.getElementById("metric-travelers");
    metricCreated = document.getElementById("metric-created");
    metricClones = document.getElementById("metric-clones");

    // EventBus subscriptions
    eventBus.on("themeChanged", (data, timestamp) => { applyTheme(data.theme); logEvent("themeChanged", data, timestamp); });
    eventBus.on("currencyChanged", (data, timestamp) => {
        updateCurrencyDisplay();
        updateCardsCurrency();
        logEvent("currencyChanged", data, timestamp);
        showToast(`Валюту інтерфейсу змінено на ${data.currency} (1 EUR = ${session.getExchangeRate(data.currency)} ${data.currency})`, "info");
    });
    eventBus.on("travelersChanged", (data, timestamp) => {
        const navVal = document.getElementById("nav-travelers-val");
        if (navVal) navVal.textContent = data.count;
        if (metricTravelers) metricTravelers.textContent = data.count;
        logEvent("travelersChanged", data, timestamp);
    });
    eventBus.on("budgetUpdated", (data, timestamp) => { updateCurrencyDisplay(); logEvent("budgetUpdated", data, timestamp); });
    eventBus.on("cartUpdated", () => { renderCart(); });
    eventBus.on("counterUpdated", (data) => { metricCreated.textContent = data.count; });
    eventBus.on("travelElementCreated", (data, timestamp) => { logEvent("travelElementCreated", data, timestamp); applyFiltersAndSearch(); });
    eventBus.on("hotelBooked", (data, timestamp) => { logEvent("hotelBooked", data, timestamp); });
    eventBus.on("flightBooked", (data, timestamp) => { logEvent("flightBooked", data, timestamp); });
    eventBus.on("excursionBooked", (data, timestamp) => { logEvent("excursionBooked", data, timestamp); });
    eventBus.on("itineraryBuilt", (data, timestamp) => { session.incrementCreatedCount(); logEvent("itineraryBuilt", data, timestamp); applyFiltersAndSearch(); });
    eventBus.on("tripPackageCloned", (data, timestamp) => { session.incrementCreatedCount(); logEvent("tripPackageCloned", data, timestamp); applyFiltersAndSearch(); });
    eventBus.on("bookingConfirmed", (data, timestamp) => { logEvent("bookingConfirmed", data, timestamp); });
    eventBus.on("scenarioStarted", (data, timestamp) => { logEvent("scenarioStarted", data, timestamp); });

    // Button Handlers
    themeToggleBtn.onclick = () => { session.setTheme(session.getTheme() === "dark" ? "light" : "dark"); };
    currencyToggleBtn.onclick = () => {
        const next = session.currency === "EUR" ? "USD" : session.currency === "USD" ? "UAH" : "EUR";
        session.setCurrency(next);
    };
    clearCanvasBtn.onclick = () => { canvasGrid.innerHTML = ""; };
    clearLogsBtn.onclick = () => { consoleLog.innerHTML = ""; eventBus.clearHistory(); };
    runAllBtn.onclick = () => { setActiveTab("all"); };
    tabButtons.forEach(btn => { btn.onclick = () => { setActiveTab(btn.dataset.tab); }; });

    // Travelers Stepper
    const decBtn = document.getElementById("nav-travelers-dec");
    const incBtn = document.getElementById("nav-travelers-inc");
    if (decBtn) decBtn.onclick = () => { session.setTravelersCount(Math.max(1, session.travelersCount - 1)); };
    if (incBtn) incBtn.onclick = () => { session.setTravelersCount(session.travelersCount + 1); };

    // Cart Drawer Controls
    const cartToggleBtn = document.getElementById("cart-toggle-btn");
    const cartCloseBtn = document.getElementById("cart-close-btn");
    const cartBackdrop = document.getElementById("cart-backdrop");
    const cartCheckoutBtn = document.getElementById("cart-checkout-btn");
    const cartClearBtn = document.getElementById("cart-clear-btn");

    if (cartToggleBtn) cartToggleBtn.onclick = () => toggleCart();
    if (cartCloseBtn) cartCloseBtn.onclick = () => toggleCart(false);
    if (cartBackdrop) cartBackdrop.onclick = () => toggleCart(false);
    if (cartCheckoutBtn) cartCheckoutBtn.onclick = () => openVoucherModal();
    if (cartClearBtn) cartClearBtn.onclick = () => { session.clearCart(); showToast("Кошик подорожі очищено", "amber"); };

    // Voucher Modal Controls
    const voucherCloseBtn = document.getElementById("voucher-close-btn");
    const voucherPrintBtn = document.getElementById("voucher-print-btn");
    if (voucherCloseBtn) voucherCloseBtn.onclick = closeVoucherModal;
    if (voucherPrintBtn) voucherPrintBtn.onclick = () => window.print();

    // Canvas Filter Chips & Search
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.onclick = () => {
            document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            applyFiltersAndSearch();
        };
    });
    const searchInput = document.getElementById("canvas-search-input");
    if (searchInput) {
        searchInput.oninput = applyFiltersAndSearch;
    }

    // Initial setup
    applyTheme(session.getTheme());
    updateCurrencyDisplay();
    const navVal = document.getElementById("nav-travelers-val");
    if (navVal) navVal.textContent = session.travelersCount;
    if (metricTravelers) metricTravelers.textContent = session.travelersCount;
    setActiveTab("all");
}

document.addEventListener("DOMContentLoaded", init);
