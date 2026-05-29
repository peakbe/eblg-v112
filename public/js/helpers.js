// ======================================================
// HELPERS.JS — Cockpit IFR EBLG PRO+++
// Fetch JSON + statut panneau
// ======================================================

import { STATUS_CONFIG } from "./config.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[HELPERS]", ...a);
const logErr = (...a) => console.error("[HELPERS ERROR]", ...a);

// ------------------------------------------------------
// FETCH JSON ROBUSTE
// ------------------------------------------------------
export async function fetchJSON(url, options = {}) {
    try {
        const res = await fetch(url, {
            cache: "no-store",
            ...options
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
            logErr("Réponse non JSON pour", url, "→", ct);
            throw new Error("Réponse non JSON");
        }

        return await res.json();
    } catch (err) {
        logErr("fetchJSON erreur pour", url, err);
        throw err;
    }
}

// ------------------------------------------------------
// MISE À JOUR DU PANNEAU DE STATUT
// ------------------------------------------------------
export function updateStatusPanel(key, state) {
    const cfg = STATUS_CONFIG?.[key] || {};
    const el = document.querySelector(`[data-status-key="${key}"]`);
    if (!el) return;

    el.classList.remove("status-ok", "status-error", "status-warn");

    if (state.ok) {
        el.classList.add("status-ok");
        el.textContent = cfg.labelOk || `${key}: OK`;
    } else if (state.warn) {
        el.classList.add("status-warn");
        el.textContent = cfg.labelWarn || `${key}: WARN`;
    } else if (state.error) {
        el.classList.add("status-error");
        el.textContent = cfg.labelError || `${key}: ERR`;
    }
}
