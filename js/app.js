// ======================================================
// APP.JS — VERSION PRO+ v96
// Initialisation séquencée, rechargement périodique,
// gestion d’erreurs centralisée, logs propres.
// ======================================================
// =========================
// APP.JS PRO+
// =========================

import { initMap } from "./map.js";
import "./helpers.js";
import "./metar.js";
import "./taf.js";
import "./fids.js";
import "./sonometers.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("[APP] Initialisation…");

    const map = initMap();

    if (!map) {
        console.error("[APP ERROR] La carte n'a pas pu être initialisée.");
        return;
    }

    console.log("[APP] Carte prête. Modules chargés.");
});



// ------------------------------------------------------
// 2) CONFIG RUNTIME
// ------------------------------------------------------

const REFRESH_INTERVALS = {
    metar: 60_000,   // 1 min
    taf:   10 * 60_000, // 10 min
    fids:  60_000    // 1 min
};

const IS_DEV = location.hostname === "localhost" || location.hostname === "127.0.0.1";

function logInfo(...args) {
    if (IS_DEV) console.log("[APP]", ...args);
}

function logError(...args) {
    console.error("[APP ERROR]", ...args);
}


// ------------------------------------------------------
// 3) WRAPPERS SÉCURISÉS
// ------------------------------------------------------

async function safeLoadMetar() {
    try {
        await loadMetar();
        logInfo("METAR chargé");
    } catch (err) {
        logError("Erreur METAR :", err);
    }
}

async function safeLoadTaf() {
    try {
        await loadTaf();
        logInfo("TAF chargé");
    } catch (err) {
        logError("Erreur TAF :", err);
    }
}

async function safeLoadFids() {
    try {
        await loadFids();
        logInfo("FIDS chargé");
    } catch (err) {
        logError("Erreur FIDS :", err);
    }
}


// ------------------------------------------------------
// 4) INITIALISATION PRINCIPALE
// ------------------------------------------------------

window.onload = () => {
    logInfo("Initialisation de l’application…");

    // ------------------------------
    // A) Carte Leaflet
    // ------------------------------
    try {
        window.map = initMap();
        logInfo("Carte initialisée");
    } catch (err) {
        logError("Erreur initMap :", err);
        return; // Sans carte, on arrête tout
    }

    // ------------------------------
    // B) Interface utilisateur
    // ------------------------------
    try {
        initUI();
        logInfo("UI initialisée");
    } catch (err) {
        logError("Erreur initUI :", err);
    }

    // ------------------------------
    // C) Données initiales
    // ------------------------------
    safeLoadMetar();
    safeLoadTaf();
    safeLoadFids();

    // ------------------------------
    // D) Liste des sonomètres
    // ------------------------------
    try {
        populateSonometerList();
        logInfo("Liste des sonomètres générée");
    } catch (err) {
        logError("Erreur populateSonometerList :", err);
    }

    // ------------------------------
    // E) Heatmap ON/OFF
    // ------------------------------
    try {
        initHeatmapToggle(window.map);
        logInfo("Toggle Heatmap initialisé");
    } catch (err) {
        logError("Erreur initHeatmapToggle :", err);
    }

    // ------------------------------
    // F) Rechargement périodique
    // ------------------------------
    setInterval(safeLoadMetar, REFRESH_INTERVALS.metar);
    setInterval(safeLoadTaf,   REFRESH_INTERVALS.taf);
    setInterval(safeLoadFids,  REFRESH_INTERVALS.fids);

    logInfo("Timers de rafraîchissement configurés");
};
