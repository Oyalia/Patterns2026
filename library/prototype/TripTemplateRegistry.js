import { TripPackageCard } from "./TripPackageCard.js";

/**
 * Prototype Pattern: Prototype Manager / Registry
 * Stores standard holiday packages and clones them on demand with custom overrides.
 */
export class TripTemplateRegistry {
    constructor() {
        this.prototypes = new Map();
        this.initializeDefaultPrototypes();
    }

    /**
     * Seeds registry with baseline holiday packages.
     */
    initializeDefaultPrototypes() {
        // Preset 1: Weekend Getaway in Carpathians
        this.register("weekend-carpathians", new TripPackageCard({
            templateId: "weekend-carpathians",
            title: "Карпатський Релакс: Буковель та Спа",
            category: "Гори / Активний відпочинок",
            badge: "TEMPLATE / CARPATHIANS",
            tags: ["Hotel 4*", "Ski-Pass", "SPA", "Transfer"],
            details: {
                "Тривалість": "3 дні / 2 ночі",
                "Харчування": "Сніданки (Шведський стіл)",
                "Трансфер": "Івано-Франківськ - Буковель",
                "Гірськолижна страховка": "Включено"
            },
            price: 240
        }));

        // Preset 2: Mediterranean All-Inclusive Family Resort
        this.register("family-mediterranean", new TripPackageCard({
            templateId: "family-mediterranean",
            title: "Середземноморський Сімейний Курорт",
            category: "Пляж / All-Inclusive",
            badge: "TEMPLATE / FAMILY",
            tags: ["5* Resort", "Sea View", "Ultra All-Inclusive", "Kids Club"],
            details: {
                "Тривалість": "7 ночей",
                "Харчування": "Ultra All-Inclusive",
                "Аквапарк": "Безлімітний доступ",
                "Пляжна лінія": "1-ша лінія, пісок"
            },
            price: 890
        }));

        // Preset 3: Euro City Break
        this.register("euro-city-break", new TripPackageCard({
            templateId: "euro-city-break",
            title: "Європейський Сіті-Брейк: Прага та Відень",
            category: "Культура / Архітектура",
            badge: "TEMPLATE / CITY BREAK",
            tags: ["Boutique Hotel", "Sightseeing", "Train Transfer"],
            details: {
                "Тривалість": "4 дні / 3 ночі",
                "Харчування": "Сніданки",
                "Транспорт": "Швидкісний потяг RegioJet",
                "Оглядова екскурсія": "З україномовним гідом"
            },
            price: 360
        }));
    }

    register(key, prototype) {
        this.prototypes.set(key, prototype);
    }

    get(key) {
        return this.prototypes.get(key);
    }

    clone(key, overrides = {}) {
        const proto = this.prototypes.get(key);
        if (!proto) {
            throw new Error(`Trip prototype with key '${key}' not found in registry.`);
        }
        return proto.clone(overrides);
    }

    getAllKeys() {
        return Array.from(this.prototypes.keys());
    }
}
