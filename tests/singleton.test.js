import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TripSession } from '../library/singleton/TripSession.js';
import { TripEventBus } from '../library/singleton/TripEventBus.js';

describe('Singleton Pattern (TripCraft)', () => {
    it('TripSession returns identical instance across multiple calls and new operator', () => {
        const inst1 = TripSession.getInstance();
        const inst2 = TripSession.getInstance();
        const inst3 = new TripSession();

        assert.equal(inst1, inst2);
        assert.equal(inst1, inst3);
    });

    it('TripSession manages currency and notifies subscribers', () => {
        const session = TripSession.getInstance();
        let notifiedCurrency = null;

        const unsubscribe = session.subscribe((event, payload) => {
            if (event === 'currencyChanged') {
                notifiedCurrency = payload.currency;
            }
        });

        session.setCurrency('USD');
        assert.equal(session.getCurrency(), 'USD');
        assert.equal(notifiedCurrency, 'USD');

        session.setCurrency('EUR');
        assert.equal(session.getCurrency(), 'EUR');
        assert.equal(notifiedCurrency, 'EUR');

        unsubscribe();
    });

    it('TripSession manages traveler count and accumulates budget', () => {
        const session = TripSession.getInstance();
        session.setTravelersCount(4);
        assert.equal(session.travelersCount, 4);

        const initialBudget = session.totalBudget;
        session.addBudget(500);
        assert.equal(session.totalBudget, initialBudget + 500);
    });

    it('TripSession handles currency conversion and formatted prices', () => {
        const session = TripSession.getInstance();
        session.setCurrency('EUR');
        assert.equal(session.convertPrice(100), 100);
        assert.equal(session.formatPrice(100), '100 EUR');

        session.setCurrency('USD');
        assert.equal(session.convertPrice(100), 108);

        session.setCurrency('UAH');
        assert.equal(session.convertPrice(100), 4500);

        session.setCurrency('EUR');
    });

    it('TripSession manages booked items cart and budget synchronization', () => {
        const session = TripSession.getInstance();
        session.clearCart();
        assert.equal(session.totalBudget, 0);
        assert.equal(session.getBookedItems().length, 0);

        const item = session.addBookedItem({
            id: 'test-hotel-1',
            type: 'Готель',
            title: 'Alpine Spa',
            basePriceEur: 300
        });

        assert.equal(session.getBookedItems().length, 1);
        assert.equal(session.totalBudget, 300);

        session.removeBookedItem('test-hotel-1');
        assert.equal(session.getBookedItems().length, 0);
        assert.equal(session.totalBudget, 0);
    });

    it('TripEventBus provides singleton instance and records events', () => {
        const bus1 = TripEventBus.getInstance();
        const bus2 = new TripEventBus();
        assert.equal(bus1, bus2);

        let receivedData = null;
        const off = bus1.on('hotelBookingTest', (data) => {
            receivedData = data;
        });

        bus1.emit('hotelBookingTest', { hotelId: 'H-101', price: 250 });
        assert.deepEqual(receivedData, { hotelId: 'H-101', price: 250 });

        off();
        receivedData = null;
        bus1.emit('hotelBookingTest', { hotelId: 'H-102' });
        assert.equal(receivedData, null);
    });

    it('TripEventBus maintains history trail', () => {
        const bus = TripEventBus.getInstance();
        bus.emit('auditLog', { step: 'itinerarySaved' });
        const history = bus.getHistory();
        assert.ok(history.length > 0);
        assert.equal(history[0].event, 'auditLog');
    });
});

