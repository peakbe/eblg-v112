// ======================================================
// FIDS.JS — Cockpit IFR EBLG PRO+++
// Chargement Arrivées / Départs + rendu UI
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";

// ------------------------------------------------------
// Fonction principale appelée par app.js
// ------------------------------------------------------
async function loadFids() {
    const arrEl = document.getElementById("fids-arrivals");
    const depEl = document.getElementById("fids-departures");

    try {
        const data = await fetchJSON(ENDPOINTS.fids);

        // Format attendu :
        // { arrivals: [...], departures: [...] }
        if (!data || !Array.isArray(data.arrivals) || !Array.isArray(data.departures)) {
            console.warn("[FIDS] Format inattendu:", data);
            renderFids([], arrEl);
            renderFids([], depEl);
            updateStatusPanel("FIDS", { error: true });
            return;
        }

        renderFids(data.arrivals, arrEl);
        renderFids(data.departures, depEl);

        updateStatusPanel("FIDS", { ok: true });

    } catch (err) {
        console.error("[FIDS] Erreur loadFids()", err);
        if (arrEl) arrEl.textContent = "Erreur FIDS";
        if (depEl) depEl.textContent = "Erreur FIDS";
        updateStatusPanel("FIDS", { error: true });
    }
}

// ------------------------------------------------------
// Rendu FIDS
// ------------------------------------------------------
function renderFids(list, container) {
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        container.textContent = "Aucun vol";
        return;
    }

    const table = document.createElement("table");
    table.className = "fids-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Heure</th>
            <th>Vol</th>
            <th>Origine/Destination</th>
            <th>Statut</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    list.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${f.time || ""}</td>
            <td>${f.flight || ""}</td>
            <td>${f.city || ""}</td>
            <td>${f.status || ""}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild
