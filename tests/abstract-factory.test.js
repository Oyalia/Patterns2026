import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { BusinessDarkThemeFactory } from '../library/abstractFactory/factories/BusinessDarkThemeFactory.js';
import { ResortLightThemeFactory } from '../library/abstractFactory/factories/ResortLightThemeFactory.js';
import { ThemeFactoryProvider } from '../library/abstractFactory/ThemeFactoryProvider.js';
import { ThemedButton, ThemedBadge, ThemedCard } from '../library/abstractFactory/components/ThemedComponents.js';
import { TripSession } from '../library/singleton/TripSession.js';

describe('Abstract Factory Pattern (TripCraft)', () => {
    it('BusinessDarkThemeFactory creates family of dark HUD products', () => {
        const factory = new BusinessDarkThemeFactory();

        const btn = factory.createButton({ text: 'Book Jet' });
        const badge = factory.createBadge({ label: 'VIP Priority' });
        const card = factory.createCard({ title: 'Executive Lounge', content: 'VIP services' });

        assert.ok(btn instanceof ThemedButton);
        assert.equal(btn.themeName, 'dark');

        assert.ok(badge instanceof ThemedBadge);
        assert.equal(badge.themeName, 'dark');

        assert.ok(card instanceof ThemedCard);
        assert.equal(card.themeName, 'dark');
    });

    it('ResortLightThemeFactory creates family of daylight resort products', () => {
        const factory = new ResortLightThemeFactory();

        const btn = factory.createButton({ text: 'Book Spa' });
        const badge = factory.createBadge({ label: 'All Inclusive' });
        const card = factory.createCard({ title: 'Resort Beach', content: 'Beachside amenities' });

        assert.ok(btn instanceof ThemedButton);
        assert.equal(btn.themeName, 'light');

        assert.ok(badge instanceof ThemedBadge);
        assert.equal(badge.themeName, 'light');

        assert.ok(card instanceof ThemedCard);
        assert.equal(card.themeName, 'light');
    });

    it('ThemeFactoryProvider resolves factory according to TripSession state', () => {
        const session = TripSession.getInstance();

        session.setTheme('dark');
        const darkFactory = ThemeFactoryProvider.getFactory();
        assert.ok(darkFactory instanceof BusinessDarkThemeFactory);

        session.setTheme('light');
        const lightFactory = ThemeFactoryProvider.getFactory();
        assert.ok(lightFactory instanceof ResortLightThemeFactory);

        // Explicit override
        const overridden = ThemeFactoryProvider.getFactory('dark');
        assert.ok(overridden instanceof BusinessDarkThemeFactory);
    });
});
