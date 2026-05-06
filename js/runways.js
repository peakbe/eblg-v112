// ======================================================
// RUNWAYS.JS — VERSION PRO+ EBLG
// Piste 04/22 réaliste, calcul vent, crosswind,
// dessin piste + corridor, panneau piste.
// ======================================================

// ------------------------------------------------------
// Données piste EBLG (coordonnées réelles)
// ------------------------------------------------------
export const RUNWAYS = {
    "22": {
        id: "22",
        heading: 220,
        start: [50.64834, 5.46639], // seuil 22
        end:   [50.64186, 5.44028]  // seuil 04
    },
    "04": {
        id: "04",
        heading: 40,
        start: [50.64186, 5.44028], // seuil 04
        end:   [50.64834, 5.46639]  // seuil 22
    }
};

// ------------------------------------------------------
// Détermination piste active selon direction du vent
// ------------------------------------------------------
export function getRunwayFromWind(windDir) {
    if (!windDir && windDir !== 0) return "22"; // fallback

    // Différence angulaire
    const diff22 = Math.abs(windDir - RUNWAYS["22"].heading);
    const diff04 = Math.abs(windDir - RUNWAYS["04"].heading);

    // Normalisation (ex : 350° vs 10°)
    const norm22 = Math.min(diff22, 360 - diff22);
    const norm04 = Math.min(diff04, 360 - diff04);

    return norm22 < norm04 ? "22" : "04";
}

// ------------------------------------------------------
// Calcul crosswind (vent traversier)
// ------------------------------------------------------
export function computeCrosswind(windDir, windSpeed, runwayHeading) {
    if (!windDir || !windSpeed || !runwayHeading) {
        return { crosswind: 0, headwind: 0 };
    }

    const angle = (windDir - runwayHeading) * (Math.PI / 180);

    const crosswind = Math.abs(Math.sin(angle) * windSpeed);
    const headwind = Math.cos(angle) * windSpeed;

    return { crosswind, headwind };
}

// ------------------------------------------------------
// Mise à jour panneau piste (UI)
// ------------------------------------------------------
export function updateRunwayPanel(runway, windDir, windSpeed, crosswind = 0) {
    const el = document.getElementById("runway-active");
    if (!el) return;

    el.innerHTML = `
        <b>Piste active :</b> ${runway}<br>
        Vent : ${windDir ?? "—"}° / ${windSpeed ?? "—"} kt<br>
        Crosswind : ${crosswind.toFixed(1)} kt
    `;
}

// ------------------------------------------------------
// Dessin de la piste
// ------------------------------------------------------
export function drawRunway(runwayId = "22", layer) {
    const rwy = RUNWAYS[runwayId];
    if (!rwy || !layer) return;

    layer.clearLayers();

    // Axe principal
    L.polyline([rwy.start, rwy.end], {
        color: "#ffffff",
        weight: 5,
        opacity: 0.95
    }).addTo(layer);

    // Contour lumineux (effet ATC)
    L.polyline([rwy.start, rwy.end], {
        color: "#00ffc8",
        weight: 9,
        opacity: 0.25
    }).addTo(layer);

    // Marqueurs seuils
    L.circleMarker(rwy.start, {
        radius: 4,
        color: "#00ffc8",
        fillColor: "#00ffc8",
        fillOpacity: 1
    }).addTo(layer).bindTooltip("Seuil " + runwayId);

    const opposite = runwayId === "22" ? "04" : "22";
    L.circleMarker(rwy.end, {
        radius: 4,
        color: "#00ffc8",
        fillColor: "#00ffc8",
        fillOpacity: 1
    }).addTo(layer).bindTooltip("Seuil " + opposite);
}

// ------------------------------------------------------
// Corridor d'approche réaliste
// ------------------------------------------------------
export function drawCorridor(runwayId = "22", layer) {
    const rwy = RUNWAYS[runwayId];
    if (!rwy || !layer) return;

    layer.clearLayers();

    // Longueur corridor (NM)
    const corridorLengthNm = 8;

    // Conversion NM → degrés
    const nmToDegLat = 1 / 60;
    const nmToDegLon = 1 / (60 * Math.cos(rwy.start[0] * Math.PI / 180));

    const headingRad = (rwy.heading * Math.PI) / 180;

    const dxNm = Math.cos(headingRad) * corridorLengthNm;
    const dyNm = Math.sin(headingRad) * corridorLengthNm;

    const corridorEnd = [
        rwy.start[0] + dyNm * nmToDegLat,
        rwy.start[1] + dxNm * nmToDegLon
    ];

    L.polyline([corridorEnd, rwy.start], {
        color: "#ff8800",
        weight: 2,
        dashArray: "6,4",
        opacity: 0.8
    }).addTo(layer);
}
