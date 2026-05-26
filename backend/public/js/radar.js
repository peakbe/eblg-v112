// ======================================================
// RADAR.JS — Radar quasi temps réel EBLG PRO+++
// Source : OpenSky (states/all)
// Filtrage : rayon autour EBLG
// ======================================================

import fetch from "node-fetch";

// Centre EBLG
const EBLG = { lat: 50.637, lon: 5.443 };
const RADIUS_KM = 150;

// Cache simple pour éviter de surcharger l'API
let lastRadarData = null;
let lastRadarTs = 0;
const RADAR_CACHE_MS = 2000; // 2 secondes

// ------------------------------------------------------
// Distance Haversine (km)
// ------------------------------------------------------
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ------------------------------------------------------
// Filtrage et normalisation des données OpenSky
// ------------------------------------------------------
function normalizeAndFilterStates(states) {
    if (!Array.isArray(states)) return [];

    return states
        .map(s => ({
            icao24: s[0],
            callsign: (s[1] || "").trim(),
            originCountry: s[2],
            lon: s[5],
            lat: s[6],
            baroAltitude: s[7],
            onGround: s[8],
            velocity: s[9],      // m/s
            heading: s[10],      // deg
            verticalRate: s[11], // m/s
            squawk: s[14],
            spi: s[15],
            lastContact: s[4]
        }))
        .filter(f =>
            typeof f.lat === "number" &&
            typeof f.lon === "number" &&
            !Number.isNaN(f.lat) &&
            !Number.isNaN(f.lon)
        )
        .filter(f => {
            const d = haversineKm(f.lat, f.lon, EBLG.lat, EBLG.lon);
            return d <= RADIUS_KM;
        });
}

// ------------------------------------------------------
// Fetch OpenSky + cache
// ------------------------------------------------------
async function fetchRadarRaw() {
    const now = Date.now();
    if (lastRadarData && now - lastRadarTs < RADAR_CACHE_MS) {
        return lastRadarData;
    }

    const url = "https://opensky-network.org/api/states/all";

    const r = await fetch(url);
    if (!r.ok) {
        throw new Error(`OpenSky error ${r.status}`);
    }

    const json = await r.json();
    const flights = normalizeAndFilterStates(json.states || []);

    lastRadarData = flights;
    lastRadarTs = now;

    return flights;
}

// ------------------------------------------------------
// API publique pour server.mjs
// ------------------------------------------------------
export async function getRadarFlights() {
    try {
        const flights = await fetchRadarRaw();
        return { flights };
    } catch (err) {
        console.error("[RADAR] getRadarFlights error", err);
        return { flights: [], error: true };
    }
}
