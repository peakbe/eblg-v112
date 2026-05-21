// ======================================================
// HELPERS.JS — Cockpit IFR EBLG PRO+++
// - fetchJSON blindé (anti-HTML, anti-JSON invalide)
// - timeout intégré
// - updateStatusPanel harmonisé
// ======================================================

// ------------------------------------------------------
// FETCH JSON ROBUSTE — ANTI-HTML — TIMEOUT — PRO+++
// ------------------------------------------------------
export async function fetchJSON(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const r = await fetch(url, { signal: controller.signal });

        if (!r.ok) {
            console.warn("[fetchJSON] HTTP", r.status, url);
            return null;
        }

        const text = await r.text();

        // 🔥 Anti-HTML : si la réponse commence par "<", on ignore
        if (text.trim().startsWith("<")) {
            console.warn("[fetchJSON] Réponse HTML ignorée", url);
            return null;
        }

        // Tentative de parse JSON
        try {
            return JSON.parse(text);
        } catch (err) {
            console.warn("[fetchJSON] JSON invalide", url);
            return null;
        }

    } catch (err) {
        if (err.name === "AbortError") {
            console.warn("[fetchJSON] Timeout", url);
        } else {
            console.error("[fetchJSON] Erreur", err);
        }
        return null;

    } finally {
        clearTimeout(timer);
    }
}

// ------------------------------------------------------
// UPDATE STATUS PANEL — PRO+++
// ------------------------------------------------------
export function updateStatusPanel(key, state) {
    const el = document.querySelector(`[data-status="${key}"]`);
    if (!el) return;

    el.classList.remove("ok", "error");

    if (state.ok) el.classList.add("ok");
    if (state.error) el.classList.add("error");
}

// ------------------------------------------------------
// HAVERSINE — DISTANCE (mètres)
// ------------------------------------------------------
export function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = x => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
}
