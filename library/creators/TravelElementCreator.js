import { TripSession } from "../singleton/TripSession.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Factory Method Pattern: Base Creator
 * Defines the factory method contract create(params) and lifecycle method createAndAppendTo().
 */
export class TravelElementCreator {
    /**
     * Factory Method: Implemented by concrete creators to return a PageElement instance.
     * @param {Object} params
     * @returns {import("../elements/PageElement.js").PageElement}
     */
    create(params) {
        throw new Error("Factory method 'create(params)' must be implemented by concrete subclass.");
    }

    /**
     * Lifecycle method: creates, builds, tracks telemetry, and mounts into DOM parent.
     * @param {HTMLElement} domElement
     * @param {Object} params
     * @returns {import("../elements/PageElement.js").PageElement}
     */
    createAndAppendTo(domElement, params = {}) {
        const element = this.create(params);
        element.build();

        if (domElement && domElement instanceof HTMLElement) {
            domElement.appendChild(element.getDOMElement());
        }

        // Singleton telemetry integration
        TripSession.getInstance().incrementCreatedCount();
        TripEventBus.getInstance().emit("travelElementCreated", {
            creator: this.constructor.name,
            elementType: element.constructor.name,
            title: params.name || params.title || params.route || "Item"
        });

        return element;
    }
}
