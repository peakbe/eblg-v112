// ======================================================
// RADAR.JS — Cockpit IFR EBLG PRO+++
// Trajectoires ADS-B + polylines + décorateurs
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";

let radarLayer = null;

// ------------------------------------------------------
// Fonction principale appelée par app.js
// ------------------------------------------------------
async function loadRadar() {
    try {
        ensureMapReady();

        const data = await fetchJSON(ENDPOINTS.radar);

        // Format attendu (souple) :
        // [ { icao, callsign, points: [ { lat, lon, alt, ts }, ... ] }, ... ]
        if (!Array.isArray(data)) {
            console.warn("[RADAR] Format inattendu:", data);
            clearRadarLayer();
            updateStatusPanel("ADSB", { error: true });
            return;
        }

        renderRadar(data);
        updateStatusPanel("ADSB", { ok: true });

    } catch (err) {
        console.error("[RADAR] Erreur loadRadar()", err);
        updateStatusPanel("ADSB", { error: true });
    }
}

// ------------------------------------------------------
// Vérifie que la carte existe
// ------------------------------------------------------
function ensureMapReady() {
    if (!window.map) {
        console.warn("[RADAR] map inexistante, initMap() devrait déjà avoir été appelé par app.js");
        return;
    }
    if (!radarLayer) {
        radarLayer = L.layerGroup().addTo(window.map);
    }
}

// ------------------------------------------------------
// Nettoyage couche radar
// ------------------------------------------------------
function clearRadarLayer() {
    if (radarLayer) {
        radarLayer.clearLayers();
    }
}

// ------------------------------------------------------
// Rendu radar
// ------------------------------------------------------
function renderRadar(tracks) {
    if (!window.map) return;

    ensureMapReady();
    clearRadarLayer();

    tracks.forEach(track => {
        if (!Array.isArray(track.points) || track.points.length < 2) return;

        const latlngs = track.points
            .filter(p => typeof p.lat === "number" && typeof p.lon === "number")
            .map(p => [p.lat, p.lon]);

        if (latlngs.length < 2) return;

        // Polyline principale
        const poly = L.polyline(latlngs, {
            color: "yellow",
            weight: 2,
            opacity: 0.8
        }).addTo(radarLayer);

        // Dernier point = position actuelle
        const last = latlngs[latlngs.length - 1];
        const marker = L.circleMarker(last, {
            radius: 4,
            color: "#ff8800",
            weight: 1,
            fillColor: "#ffcc00",
            fillOpacity: 0.9
        }).addTo(radarLayer);

        if (track.callsign || track.icao) {
            marker.bindTooltip(
                `${track.callsign || ""} ${track.icao || ""}`.trim(),
                { permanent: false, direction: "top", offset: [0, -4] }
            );
        }

        // Décorateur de direction (si plugin chargé)
        if (L.polylineDecorator) {
            L.polylineDecorator(poly, {
                patterns: [
                    {
                        offset: "10%",
                        repeat: "20%",
                        symbol: L.Symbol.arrowHead({
                            pixelSize: 6,
                            polygon: false,
                            pathOptions: { stroke: true, color: "yellow", weight: 1 }
                        })
                    }
                ]
            }).addTo(radarLayer);
        }
    });
}

// ------------------------------------------------------
// EXPORT GLOBAL (clé pour app.js)
// ------------------------------------------------------
window.loadRadar = loadRadar;
window.initRadar = () => {};
