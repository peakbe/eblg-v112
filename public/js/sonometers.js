// ======================================================
// SONOMETERS.JS — Cockpit IFR EBLG PRO+++
// Chargement sonomètres + filtres + rendu UI
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";

let sonoData = []; // cache local

// ------------------------------------------------------
// 1) TABLE COULEURS SELON PISTE ACTIVE
// ------------------------------------------------------
const RUNWAY_COLOR_MAP = {
    "22": {
        green: ["F002","F003","F004","F005","F006","F007","F008","F009","F010","F011","F012","F013","F016"],
        red:   ["F001","F014","F015","F017"]
    },
    "04": {
        green: ["F002","F003","F007","F008","F009","F011","F013","F014","F015"],
        red:   ["F004","F005","F006","F010","F012","F016","F001","F017"]
    }
};

// ======================================================
// COULEUR SONOMÈTRE — Normalisation PRO+++
// ======================================================
export function getSonoColor(name, runway) {
    if (!name || !runway) return "blue";

    // Normalisation ID
    const id = String(name).trim().toUpperCase();

    // Récupération config piste
    const cfg = window.SONO_RUNWAY_CONFIG?.[runway];
    if (!cfg) return "blue";

    // Normalisation listes
    const greens = cfg.green.map(x => x.trim().toUpperCase());
    const reds   = cfg.red.map(x => x.trim().toUpperCase());

    // Décision couleur
    if (greens.includes(id)) return "green";
    if (reds.includes(id)) return "red";

    return "blue"; // fallback neutre
}

// ------------------------------------------------------
// Fonction principale appelée par app.js
// ------------------------------------------------------
async function loadSonometers() {
    const listEl = document.getElementById("sono-list");

    try {
        const data = await fetchJSON(ENDPOINTS.sonos);

        if (!Array.isArray(data)) {
            console.warn("[SONO] Format inattendu:", data);
            sonoData = [];
            renderSonometers([]);
            updateStatusPanel("SONO", { error: true });
            return;
        }

        sonoData = data;
        renderSonometers(sonoData);
        updateStatusPanel("SONO", { ok: true });

    } catch (err) {
        console.error("[SONO] Erreur loadSonometers()", err);
        if (listEl) listEl.textContent = "Erreur sonomètres";
        updateStatusPanel("SONO", { error: true });
    }
}

// ------------------------------------------------------
// Rendu liste sonomètres
// ------------------------------------------------------
function renderSonometers(list) {
    const container = document.getElementById("sono-list");
    const townSelect = document.getElementById("sono-filter-town");
    const sortSelect = document.getElementById("sono-sort");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        container.textContent = "Aucun sonomètre";
        return;
    }

    // --- Filtres communes ---
    const towns = [...new Set(list.map(s => s.town).filter(Boolean))].sort();
    townSelect.innerHTML = `<option value="">Toutes les communes</option>`;
    towns.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        townSelect.appendChild(opt);
    });

    // --- Application des filtres ---
    let filtered = [...list];

    const selectedTown = townSelect.value;
    if (selectedTown) {
        filtered = filtered.filter(s => s.town === selectedTown);
    }

    // --- Tri ---
    const sortMode = sortSelect.value;
    if (sortMode === "id") {
        filtered.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
    } else if (sortMode === "address") {
        filtered.sort((a, b) => (a.address || "").localeCompare(b.address || ""));
    }
    // Tri distance → possible si tu veux l’ajouter plus tard

    // --- Rendu ---
    filtered.forEach(s => {
        const div = document.createElement("div");
        div.className = "sono-item";

        div.innerHTML = `
            <div><strong>${s.id}</strong> — ${s.address || ""} (${s.town || ""})</div>
            <div>dB: <strong>${s.db ?? "--"}</strong> · statut: ${s.status || "?"}</div>
        `;

        container.appendChild(div);
    });
}

// ------------------------------------------------------
// INIT UI (filtres)
// ------------------------------------------------------
function initSonoUI() {
    const townSelect = document.getElementById("sono-filter-town");
    const sortSelect = document.getElementById("sono-sort");

    if (townSelect) {
        townSelect.addEventListener("change", () => renderSonometers(sonoData));
    }
    if (sortSelect) {
        sortSelect.addEventListener("change", () => renderSonometers(sonoData));
    }
}

initSonoUI();

// ------------------------------------------------------
// EXPORT GLOBAL (clé pour app.js)
// ------------------------------------------------------
window.loadSonometers = loadSonometers;
window.initSonometers = () => {};
