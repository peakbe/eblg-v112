// ======================================================
// LOGSLIVE.JS — Cockpit IFR EBLG PRO+++
// - Ping cyclique des endpoints backend
// - Statut LIVE (OK / fallback / erreur)
// - Anti-HTML, anti-spam, anti-freeze
// ======================================================

import { ENDPOINTS } from "./config.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[LIVE]", ...a);
const logErr = (...a) => console.error("[LIVE ERROR]", ...a);

let panel = null;
let liveLogs = [];

// ------------------------------------------------------
// INIT
// ------------------------------------------------------
export function startLiveLogs() {
    panel = document.getElementById("logs-live");
    if (!panel) {
        logErr("Panel #logs-live introuvable");
        return;
    }

    probeAll();
    setInterval(probeAll, 5000);
}

// ------------------------------------------------------
// PROBE GLOBAL
// ------------------------------------------------------
function probeAll() {
    probe("METAR", ENDPOINTS.metar);
    probe("TAF", ENDPOINTS.taf);
    probe("FIDS", ENDPOINTS.fids);
    probe("SONO", ENDPOINTS.sono);
    probe("ADSB", ENDPOINTS.adsb || "/api/adsb");
}

// ------------------------------------------------------
// PROBE UNITAIRE
// ------------------------------------------------------
async function probe(name, url) {
    const t0 = performance.now();

    try {
        const r = await fetch(url);
        const dt = Math.round(performance.now() - t0);

        if (!r.ok) {
            addLiveLog("error", `${name} → ERR (${dt} ms)`);
            return;
        }

        const text = await r.text();

        if (text.trim().startsWith("<")) {
            addLiveLog("warn", `${name} → fallback (${dt} ms)`);
            return;
        }

        addLiveLog("ok", `${name} → OK (${dt} ms)`);

    } catch (err) {
        addLiveLog("error", `${name} → erreur`);
    }
}

// ------------------------------------------------------
// AJOUT LOG LIVE
// ------------------------------------------------------
function addLiveLog(status, message) {
    liveLogs.unshift({
        status,
        message,
        time: new Date().toLocaleTimeString()
    });

    if (liveLogs.length > 40) liveLogs.pop();
    renderLiveLogs();
}

// ------------------------------------------------------
// RENDU
// ------------------------------------------------------
function renderLiveLogs() {
    if (!panel) return;

    panel.innerHTML = liveLogs
        .map(l => `
            <div class="log-live-entry log-live-${l.status}">
                <span class="log-live-time">${l.time}</span>
                ${l.message}
            </div>
        `)
        .join("");

    panel.scrollTop = 0;
}

// ------------------------------------------------------
// EXPORT GLOBAL (clé pour app.js)
// ------------------------------------------------------
window.startLiveLogs = startLiveLogs;
window.initLiveLogs = () => {};
