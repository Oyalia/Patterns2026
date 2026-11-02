import { TravelItineraryWidget } from "./TravelItineraryWidget.js";
import { TripEventBus } from "../singleton/TripEventBus.js";

/**
 * Builder Pattern: ItineraryBuilder
 * Provides a chainable fluent interface to assemble complex TravelItineraryWidget packages.
 */
export class ItineraryBuilder {
    constructor() {
        this.reset();
    }

    reset() {
        this.config = {
            destination: "Новий Маршрут",
            region: "",
            dates: "",
            flight: null,
            hotel: null,
            excursions: [],
            travelers: 2,
            actions: [],
            footerText: "",
            theme: "dark"
        };
        return this;
    }

    setDestination(destination, region = "") {
        this.config.destination = destination;
        this.config.region = region;
        return this;
    }

    setDates(dates) {
        this.config.dates = dates;
        return this;
    }

    setFlight(airline, route, flightNo, price) {
        this.config.flight = { airline, route, flightNo, price };
        return this;
    }

    setHotel(name, roomType, nights, pricePerNight) {
        this.config.hotel = {
            name,
            roomType,
            nights,
            pricePerNight,
            totalCost: nights * pricePerNight
        };
        return this;
    }

    addExcursion(title, price) {
        this.config.excursions.push({ title, price });
        return this;
    }

    setTravelers(count) {
        this.config.travelers = count;
        return this;
    }

    addAction(label, onClick = null, variant = "primary") {
        this.config.actions.push({ label, onClick, variant });
        return this;
    }

    setFooter(text) {
        this.config.footerText = text;
        return this;
    }

    setTheme(theme) {
        this.config.theme = theme;
        return this;
    }

    build() {
        const widget = new TravelItineraryWidget(this.config);
        TripEventBus.getInstance().emit("itineraryBuilt", {
            destination: this.config.destination,
            totalEstimated: widget.calculateTotal()
        });
        return widget;
    }
}
