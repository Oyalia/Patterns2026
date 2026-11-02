import { TravelElementCreator } from "./TravelElementCreator.js";
import { HotelElement } from "../elements/HotelElement.js";

/**
 * Concrete Creator for Factory Method: HotelElementCreator
 * Instantiates HotelElement instances.
 */
export class HotelElementCreator extends TravelElementCreator {
    create(params = {}) {
        return new HotelElement(params);
    }
}
