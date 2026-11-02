import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ItineraryBuilder } from '../library/builder/ItineraryBuilder.js';
import { ItineraryDirector } from '../library/builder/ItineraryDirector.js';
import { TravelItineraryWidget } from '../library/builder/TravelItineraryWidget.js';

describe('Builder Pattern (TripCraft)', () => {
    it('ItineraryBuilder fluently constructs custom composite travel package', () => {
        const builder = new ItineraryBuilder();

        const widget = builder
            .reset()
            .setDestination('Норвезькі Фіорди', 'Осло - Берген')
            .setDates('10.07.2026 - 17.07.2026')
            .setTravelers(2)
            .setFlight('SAS', 'VIE -> OSL', 'SK-120', 210)
            .setHotel('Fjord View Hotel', 'Superior Balcony', 7, 220)
            .addExcursion('Круїз по Нерей-фіорду', 95)
            .setFooter('Включає трансфер на потязі Flamsbana')
            .build();

        assert.ok(widget instanceof TravelItineraryWidget);
        assert.equal(widget.destination, 'Норвезькі Фіорди');
        assert.equal(widget.region, 'Осло - Берген');
        assert.equal(widget.travelers, 2);
        assert.equal(widget.flight.airline, 'SAS');
        assert.equal(widget.hotel.name, 'Fjord View Hotel');
        assert.equal(widget.excursions.length, 1);
        assert.ok(widget.calculateTotal() > 0);
    });

    it('ItineraryDirector builds AlpineSkiTrip recipe correctly', () => {
        const builder = new ItineraryBuilder();
        const director = new ItineraryDirector(builder);

        const trip = director.buildAlpineSkiTrip('dark');
        assert.ok(trip instanceof TravelItineraryWidget);
        assert.equal(trip.destination, 'Альпійський Гірськолижний Вікенд');
        assert.equal(trip.region, 'Швейцарія / Церматт');
        assert.ok(trip.flight !== null);
        assert.ok(trip.hotel !== null);
        assert.equal(trip.excursions.length, 2);
    });

    it('ItineraryDirector builds MediterraneanCruise recipe correctly', () => {
        const builder = new ItineraryBuilder();
        const director = new ItineraryDirector(builder);

        const trip = director.buildMediterraneanCruise('light');
        assert.ok(trip instanceof TravelItineraryWidget);
        assert.equal(trip.destination, 'Середземноморський Круїз');
        assert.equal(trip.hotel.nights, 7);
    });

    it('ItineraryDirector builds TokyoExplorer recipe correctly', () => {
        const builder = new ItineraryBuilder();
        const director = new ItineraryDirector(builder);

        const trip = director.buildTokyoExplorer('dark');
        assert.ok(trip instanceof TravelItineraryWidget);
        assert.equal(trip.destination, 'Експедиція: Токіо та Кіото');
        assert.equal(trip.flight.airline, 'ANA All Nippon');
    });
});
