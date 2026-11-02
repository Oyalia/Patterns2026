import { TravelUIFactory } from "../interfaces/TravelUIFactory.js";
import { ThemedButton, ThemedBadge, ThemedCard } from "../components/ThemedComponents.js";

/**
 * Concrete Factory: BusinessDarkThemeFactory
 * Produces controls styled in executive dark palette with amber and gold accents.
 */
export class BusinessDarkThemeFactory extends TravelUIFactory {
    createButton(params = {}) {
        return new ThemedButton({
            ...params,
            variant: params.variant || "primary"
        }, "dark");
    }

    createBadge(params = {}) {
        return new ThemedBadge({
            ...params,
            type: params.type || "amber"
        }, "dark");
    }

    createCard(params = {}) {
        return new ThemedCard(params, "dark");
    }
}
