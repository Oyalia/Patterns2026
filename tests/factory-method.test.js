import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { TravelElementCreator } from '../library/creators/TravelElementCreator.js';
import { HotelElementCreator } from '../library/creators/HotelElementCreator.js';
import { FlightElementCreator } from '../library/creators/FlightElementCreator.js';
import { ExcursionElementCreator } from '../library/creators/ExcursionElementCreator.js';
import { BookingFormElementCreator } from '../library/creators/BookingFormElementCreator.js';

import { HotelElement } from '../library/elements/HotelElement.js';
import { FlightElement } from '../library/elements/FlightElement.js';
import { ExcursionElement } from '../library/elements/ExcursionElement.js';
import { BookingFormElement } from '../library/elements/BookingFormElement.js';
import { TripSession } from '../library/singleton/TripSession.js';

describe('Factory Method Pattern (TripCraft)', () => {
    it('Base TravelElementCreator throws error on direct create() invocation', () => {
        const base = new TravelElementCreator();
        assert.throws(() => base.create({}), /must be implemented/);
    });

    it('HotelElementCreator creates HotelElement instance with expected fields', () => {
        const creator = new HotelElementCreator();
        const hotel = creator.create({
            name: 'Alpine Haven Resort',
            location: 'Zermatt',
            pricePerNight: 280,
            nights: 3
        });

        assert.ok(hotel instanceof HotelElement);
        assert.equal(hotel.params.name, 'Alpine Haven Resort');
        assert.equal(hotel.params.location, 'Zermatt');
        assert.equal(hotel.params.pricePerNight, 280);
    });

    it('FlightElementCreator creates FlightElement instance with flight details', () => {
        const creator = new FlightElementCreator();
        const flight = creator.create({
            flightNumber: 'LH-240',
            airline: 'Lufthansa',
            origin: 'FRA',
            destination: 'ZRH',
            price: 190
        });

        assert.ok(flight instanceof FlightElement);
        assert.equal(flight.params.flightNumber, 'LH-240');
        assert.equal(flight.params.origin, 'FRA');
        assert.equal(flight.params.price, 190);
    });

    it('ExcursionElementCreator creates ExcursionElement instance with guide and duration', () => {
        const creator = new ExcursionElementCreator();
        const excursion = creator.create({
            title: 'Fjord Kayaking Adventure',
            guide: 'Olaf',
            pricePerPerson: 85
        });

        assert.ok(excursion instanceof ExcursionElement);
        assert.equal(excursion.params.title, 'Fjord Kayaking Adventure');
        assert.equal(excursion.params.pricePerPerson, 85);
    });

    it('BookingFormElementCreator creates BookingFormElement with destination', () => {
        const creator = new BookingFormElementCreator();
        const form = creator.create({
            title: 'Checkout Form',
            destination: 'Swiss Alps'
        });

        assert.ok(form instanceof BookingFormElement);
        assert.equal(form.params.title, 'Checkout Form');
        assert.equal(form.params.destination, 'Swiss Alps');
    });

    it('createAndAppendTo mounts built element to DOM parent and increments telemetry', () => {
        const parent = document.createElement('div');
        const creator = new HotelElementCreator();
        const session = TripSession.getInstance();
        const prevCount = session.createdCount;

        const product = creator.createAndAppendTo(parent, {
            name: 'Grand Fjord Hotel'
        });

        assert.ok(product instanceof HotelElement);
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0], product.getDOMElement());
        assert.equal(session.createdCount, prevCount + 1);
    });
});
