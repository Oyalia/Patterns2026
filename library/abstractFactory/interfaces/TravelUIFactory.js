/**
 * Abstract Factory Pattern: TravelUIFactory Interface
 * 
 * Defines the contract for creating families of related travel UI controls
 * (ThemedButton, ThemedBadge, ThemedCard) without coupling client code to concrete styles.
 */
export class TravelUIFactory {
    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedButton}
     */
    createButton(params) {
        throw new Error("createButton() must be implemented by concrete factory.");
    }

    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedBadge}
     */
    createBadge(params) {
        throw new Error("createBadge() must be implemented by concrete factory.");
    }

    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedCard}
     */
    createCard(params) {
        throw new Error("createCard() must be implemented by concrete factory.");
    }
}
