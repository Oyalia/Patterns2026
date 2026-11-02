/**
 * Singleton Pattern: TripEventBus
 * 
 * Centralized audit trail and telemetry dispatcher for all travel creational actions.
 */
export class TripEventBus {
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
                    console.error(`Error in TripEventBus listener for ${event}:`, err);
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
