import { BusinessDarkThemeFactory } from "./factories/BusinessDarkThemeFactory.js";
import { ResortLightThemeFactory } from "./factories/ResortLightThemeFactory.js";
import { TripSession } from "../singleton/TripSession.js";

/**
 * Provider / Resolver for Abstract Factory
 */
export class ThemeFactoryProvider {
    static getFactory(themeOverride = null) {
        const theme = themeOverride || TripSession.getInstance().getTheme();
        if (theme === "light") {
            return new ResortLightThemeFactory();
        }
        return new BusinessDarkThemeFactory();
    }
}
