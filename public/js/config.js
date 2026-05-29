// ======================================================
// CONFIG.JS — Cockpit IFR EBLG PRO+++
// ======================================================

// URL backend Render (sans slash final)
export const BASE_URL = "https://eblg-dashboard-v84.onrender.com";

// Endpoints backend
export const ENDPOINTS = {
    metar: `${BASE_URL}/metar`,
    taf: `${BASE_URL}/taf`,
    fids: `${BASE_URL}/fids`,
    sono: `${BASE_URL}/sonos`,
    adsb: `${BASE_URL}/api/adsb`,
    logs: `${BASE_URL}/logs`
};
