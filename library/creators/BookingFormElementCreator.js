import { TravelElementCreator } from "./TravelElementCreator.js";
import { BookingFormElement } from "../elements/BookingFormElement.js";

/**
 * Concrete Creator for Factory Method: BookingFormElementCreator
 * Instantiates BookingFormElement instances.
 */
export class BookingFormElementCreator extends TravelElementCreator {
    create(params = {}) {
        return new BookingFormElement(params);
    }
}
