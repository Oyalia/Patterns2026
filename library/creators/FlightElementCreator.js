import { TravelElementCreator } from "./TravelElementCreator.js";
import { FlightElement } from "../elements/FlightElement.js";

/**
 * Concrete Creator for Factory Method: FlightElementCreator
 * Instantiates FlightElement instances.
 */
export class FlightElementCreator extends TravelElementCreator {
    create(params = {}) {
        return new FlightElement(params);
    }
}
