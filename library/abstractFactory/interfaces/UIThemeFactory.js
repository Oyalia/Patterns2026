/**
 * Abstract Factory Pattern: UIThemeFactory Interface
 * 
 * Defines the contract for producing families of related visual components
 * (Buttons, Badges, Cards) with unified styling and behavior.
 */
export class UIThemeFactory {
    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedButton}
     */
    createButton(params) {
        throw new Error("createButton() must be implemented by concrete theme factory.");
    }

    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedBadge}
     */
    createBadge(params) {
        throw new Error("createBadge() must be implemented by concrete theme factory.");
    }

    /**
     * @param {Object} params
     * @returns {import("../components/ThemedComponents.js").ThemedCard}
     */
    createCard(params) {
        throw new Error("createCard() must be implemented by concrete theme factory.");
    }
}
