import { TravelUIFactory } from "../interfaces/TravelUIFactory.js";
import { ThemedButton, ThemedBadge, ThemedCard } from "../components/ThemedComponents.js";

/**
 * Concrete Factory: ResortLightThemeFactory
 * Produces controls styled in clean resort daylight palette with cyan and azure accents.
 */
export class ResortLightThemeFactory extends TravelUIFactory {
    createButton(params = {}) {
        return new ThemedButton({
            ...params,
            variant: params.variant || "secondary"
        }, "light");
    }

    createBadge(params = {}) {
        return new ThemedBadge({
            ...params,
            type: params.type || "cyan"
        }, "light");
    }

    createCard(params = {}) {
        return new ThemedCard(params, "light");
    }
}
