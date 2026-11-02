/**
 * Builder Pattern: ItineraryDirector
 * 
 * Defines standard construction recipes and package presets for ItineraryBuilder.
 */
export class ItineraryDirector {
    constructor(builder) {
        this.builder = builder;
    }

    setBuilder(builder) {
        this.builder = builder;
    }

    /**
     * Recipe 1: Alpine Ski & Mountain Spa Weekend
     */
    buildAlpineSkiTrip(theme = "dark") {
        return this.builder
            .reset()
            .setTheme(theme)
            .setDestination("Альпійський Гірськолижний Вікенд", "Швейцарія / Церматт")
            .setDates("12.02.2026 - 16.02.2026")
            .setTravelers(2)
            .setFlight("Swiss Air", "VIE -> ZRH", "LX-1420", 280)
            .setHotel("Grand Alpine Resort", "Deluxe Suite Matterhorn", 4, 340)
            .addExcursion("Сходження на Горнерграт та скі-пас", 140)
            .addExcursion("Альпійське термальне спа", 80)
            .setFooter("Пакет включає трансфер на потязі Zermatt Shuttle та страховку.")
            .build();
    }

    /**
     * Recipe 2: Mediterranean Riviera Cruise
     */
    buildMediterraneanCruise(theme = "dark") {
        return this.builder
            .reset()
            .setTheme(theme)
            .setDestination("Середземноморський Круїз", "Франція - Італія - Іспанія")
            .setDates("15.06.2026 - 22.06.2026")
            .setTravelers(2)
            .setFlight("Air France", "WAW -> NCE", "AF-1180", 220)
            .setHotel("Riviera Royal Yacht Club", "Ocean Balcony Cabin", 7, 290)
            .addExcursion("Тур старим містом Ніцци та дегустація", 90)
            .addExcursion("Екскурсія в Монако та Монте-Карло", 130)
            .setFooter("У вартість входить All-Inclusive харчування на борту.")
            .build();
    }

    /**
     * Recipe 3: Tokyo & Kyoto Cultural Expedition
     */
    buildTokyoExplorer(theme = "dark") {
        return this.builder
            .reset()
            .setTheme(theme)
            .setDestination("Експедиція: Токіо та Кіото", "Японія")
            .setDates("01.10.2026 - 10.10.2026")
            .setTravelers(2)
            .setFlight("ANA All Nippon", "FRA -> HND", "NH-204", 750)
            .setHotel("Park Hyatt Tokyo", "Park View Room", 9, 310)
            .addExcursion("Швидкісний потяг Shinkansen до Кіото", 150)
            .addExcursion("Традиційна чайна церемонія в Гіоні", 85)
            .setFooter("Включає проїзний JR Pass та персонального англомовного гіда.")
            .build();
    }
}
