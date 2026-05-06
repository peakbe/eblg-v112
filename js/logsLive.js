// ======================================================
// LOGS LIVE — VERSION PRO+
// Couleurs ATC, auto-scroll, anti-spam, FIFO.
// ======================================================

import { ENDPOINTS } from "./config.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[LIVE]", ...a);
const logErr = (...a) => console.error("[LIVE ERROR]", ...a);

// Buffer interne
let liveLogs = [];

// Conteneur DOM
let panel = null;

// ======================================================
// Initialisation
// ======================================================
export function startLiveLogs() {
    panel = document.getElementById("logs-live");
    if (!panel) {
        logErr("Panel #logs-live introuvable");
        return;
    }

    log("Initialisation logs LIVE…");

    // Premier tick immédiat
    probeAll();

    // Tick toutes les 5 secondes
    setInterval(probeAll, 5000);
}

// ======================================================
// Probing des endpoints
// ======================================================
function probeAll() {
    probe("METAR", ENDPOINTS.metar);
    probe("TAF", ENDPOINTS.taf);
    probe("FIDS", ENDPOINTS.fids);
    probe("SONO", ENDPOINTS.sonometers);
}

// ======================================================
// Probe individuel
// ======================================================
async function probe(name, url) {
    const t0 = performance.now();

    try {
        const res = await fetch(url);
        const dt = Math.round(performance.now() - t0);

        if (!res.ok) {
            addLiveLog("error", `${name} → ERR (${dt} ms)`);
            return;
        }

        const json = await res.json();

        if (json.fallback) {
            addLiveLog("warn", `${name} → fallback (${dt} ms)`);
        } else {
            addLiveLog("ok", `${name} → OK (${dt} ms)`);
        }

    } catch (err) {
        addLiveLog("error", `${name} → erreur`);
    }
}

// ======================================================
// Ajout d’un log
// ======================================================
function addLiveLog(status, message) {
    const entry = {
        status,
        message,
        time: new Date().toLocaleTimeString()
    };

    liveLogs.unshift(entry);

    // FIFO 40 entrées
    if (liveLogs.length > 40) liveLogs.pop();

    renderLiveLogs();
}

// ======================================================
// Rendu UI
// ======================================================
function renderLiveLogs() {
    if (!panel) return;

    panel.innerHTML = liveLogs.map(log => `
        <div class="log-live-entry log-live-${log.status}">
            <span class="log-live-time">${log.time}</span>
            ${log.message}
        </div>
    `).join("");

    // Auto-scroll vers le haut (dernier log)
    panel.scrollTop = 0;
}
