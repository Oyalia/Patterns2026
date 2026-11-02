import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { TripPackageCard } from '../library/prototype/TripPackageCard.js';
import { TripTemplateRegistry } from '../library/prototype/TripTemplateRegistry.js';

describe('Prototype Pattern (TripCraft)', () => {
    it('TripPackageCard clones instance with mutated properties while preserving deep isolation', () => {
        const original = new TripPackageCard({
            templateId: 'weekend-carpathians',
            title: 'Карпатський Вікенд',
            tags: ['SPA', 'Ski'],
            details: { nights: 2, hotel: 'Bukovel Chalet' },
            price: 240
        });

        const clone = original.clone({
            title: 'Карпатський VIP Тур',
            details: { nights: 4 },
            price: 420
        });

        assert.ok(clone instanceof TripPackageCard);
        assert.notEqual(clone, original);
        assert.equal(clone.title, 'Карпатський VIP Тур');
        assert.equal(clone.templateId, 'weekend-carpathians');
        assert.equal(clone.cloneCount, 1);
        assert.equal(clone.details.nights, 4);
        assert.equal(original.details.nights, 2); // Original is untouched
        assert.equal(clone.price, 420);
        assert.equal(original.price, 240);

        // Mutating tags array in clone does not affect original
        clone.tags.push('Helicopter');
        assert.ok(!original.tags.includes('Helicopter'));
    });

    it('TripTemplateRegistry initializes baseline travel templates and clones by key', () => {
        const registry = new TripTemplateRegistry();
        const keys = registry.getAllKeys();

        assert.ok(keys.includes('weekend-carpathians'));
        assert.ok(keys.includes('family-mediterranean'));
        assert.ok(keys.includes('euro-city-break'));

        const clone = registry.clone('family-mediterranean', {
            title: 'Custom Family Package'
        });

        assert.ok(clone instanceof TripPackageCard);
        assert.equal(clone.title, 'Custom Family Package');
        assert.equal(clone.templateId, 'family-mediterranean');
    });

    it('TripTemplateRegistry throws error when cloning non-existent key', () => {
        const registry = new TripTemplateRegistry();
        assert.throws(() => registry.clone('unknown-trip-key'), /not found/);
    });
});
