// ======================================================
// MAP.JS — Cockpit IFR EBLG PRO+++
// Carte Leaflet + couches IFR + signal "map-ready"
// ======================================================

export let map = null;

let adsbLayer = null;
let corridorLayer = null;
let runwayLayer = null;
let headingLayer = null;

// ------------------------------------------------------
// INIT MAP (appelé par app.js)
// ------------------------------------------------------
export function initMap() {
    if (!window.L) {
        console.error("[MAP] Leaflet non chargé !");
        return;
    }

    // Création réelle de la carte Leaflet
    map = L.map("map", {
        zoomControl: false,
        minZoom: 8,
        maxZoom: 18,
        preferCanvas: true
    }).setView([50.637, 5.443], 12);

    // Fond de carte
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    // Couches IFR
    adsbLayer = L.layerGroup().addTo(map);
    corridorLayer = L.layerGroup().addTo(map);
    runwayLayer = L.layerGroup().addTo(map);
    headingLayer = L.layerGroup().addTo(map);

    // Dessin des pistes
    drawRunways();

    // --------------------------------------------------
    // SIGNAL GLOBAL : CARTE PRÊTE
    // --------------------------------------------------
    window.map = map;          // 🔥 indispensable
    window._map = map;         // compatibilité ancienne version

    setTimeout(() => {
        map.invalidateSize();  // indispensable
        window.dispatchEvent(new Event("map-ready"));
    }, 0);
}

// ------------------------------------------------------
// RESET MAP
// ------------------------------------------------------
export function resetMapView() {
    if (!map) return;
    map.setView([50.637, 5.443], 12);
}

// ------------------------------------------------------
// DESSIN DES PISTES
// ------------------------------------------------------
function drawRunways() {
    if (!runwayLayer) return;

    runwayLayer.clearLayers();

    const rwy04 = [
        [50.64455, 5.44305],
        [50.65035, 5.46315]
    ];

    const rwy22 = [...rwy04].reverse();

    L.polyline(rwy04, {
        color: "orange",
        weight: 6,
        opacity: 0.9
    }).addTo(runwayLayer);

    L.polyline(rwy22, {
        color: "orange",
        weight: 6,
        opacity: 0.9
    }).addTo(runwayLayer);
}

// ------------------------------------------------------
// EXPORT GLOBAL (clé pour app.js)
// ------------------------------------------------------
window.initMap = initMap;   // 🔥🔥🔥 indispensable
