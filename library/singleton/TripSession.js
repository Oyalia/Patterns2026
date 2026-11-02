/**
 * Singleton Pattern: TripSession
 *
 * Manages global travel booking state, active currency, traveler count,
 * accumulated budget, and UI theme across the entire application.
 *
 * Internal notify() also forwards events to TripEventBus so that both
 * session.subscribe() and eventBus.on() listeners receive state changes.
 */
import { TripEventBus } from "./TripEventBus.js";

export class TripSession {
    static #instance = null;

    constructor() {
        if (TripSession.#instance) {
            return TripSession.#instance;
        }

        this.appName = "TripCraft Studio";
        this.version = "1.0.0";
        this.theme = "dark"; // 'dark' | 'light'
        this.currency = "EUR"; // 'EUR' | 'USD' | 'UAH'
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

    /**
     * Singleton accessor.
     * @returns {TripSession}
     */
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

    getTheme() {
        return this.theme;
    }

    setCurrency(currency) {
        this.currency = currency;
        this.notify("currencyChanged", {
            currency: this.currency,
            rate: this.getExchangeRate(this.currency)
        });
    }

    getCurrency() {
        return this.currency;
    }

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
            try {
                callback(event, payload);
            } catch (err) {
                console.error("Error in TripSession subscriber:", err);
            }
        });
        // Bridge to TripEventBus so eventBus.on() listeners also receive state changes
        try {
            TripEventBus.getInstance().emit(event, payload);
        } catch (err) {
            console.error("Error forwarding TripSession event to TripEventBus:", err);
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
