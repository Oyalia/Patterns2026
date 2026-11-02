import { TravelElementCreator } from "./TravelElementCreator.js";
import { ExcursionElement } from "../elements/ExcursionElement.js";

/**
 * Concrete Creator for Factory Method: ExcursionElementCreator
 * Instantiates ExcursionElement instances.
 */
export class ExcursionElementCreator extends TravelElementCreator {
    create(params = {}) {
        return new ExcursionElement(params);
    }
}
