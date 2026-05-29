// ======================================================
// SERVER.MJS — Cockpit IFR EBLG PRO+++
// Backend Node.js / Express compatible Render
// ======================================================

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ------------------------------------------------------
// PATHS
// ------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------
// EXPRESS
// ------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// STATIC FRONTEND (Render-compatible)
// ------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));

// ------------------------------------------------------
// LOG
// ------------------------------------------------------
function log(msg) {
    console.log(`[SERVER] ${msg}`);
}

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------
async function safeFetch(url, fallback = null) {
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json();
    } catch (err) {
        log(`Fetch error on ${url}: ${err}`);
        return fallback;
    }
}

// ======================================================
// ROUTES METAR / TAF
// ======================================================
app.get("/metar", async (req, res) => {
    const url = "https://api.checkwx.com/metar/EBLG/decoded";
    const data = await safeFetch(url, { metar: "N/A" });
    res.json(data);
});

app.get("/taf", async (req, res) => {
    const url = "https://api.checkwx.com/taf/EBLG/decoded";
    const data = await safeFetch(url, { taf: "N/A" });
    res.json(data);
});

// ======================================================
// ROUTE FIDS — 10 prochains vols
// ======================================================
app.get("/fids", async (req, res) => {
    try {
        const [arr, dep] = await Promise.all([
            safeFetch("https://fids.liegeairport.com/api/flights/Arrivals", []),
            safeFetch("https://fids.liegeairport.com/api/flights/Departures", [])
        ]);

        const getTime = f =>
            new Date(
                f.estimatedTime ||
                f.scheduledTime ||
                f.actualTime ||
                0
            ).getTime();

        const arrivals = arr
            .filter(f => getTime(f) > 0)
            .sort((a, b) => getTime(a) - getTime(b))
            .slice(0, 10);

        const departures = dep
            .filter(f => getTime(f) > 0)
            .sort((a, b) => getTime(a) - getTime(b))
            .slice(0, 10);

        res.json({ arrivals, departures });

    } catch (err) {
        log("FIDS error: " + err);
        res.json({ arrivals: [], departures: [] });
    }
});

// ======================================================
// ROUTE ADS-B (proxy OpenSky)
// ======================================================
app.get("/api/adsb", async (req, res) => {
    const url = "https://opensky-network.org/api/states/all";
    const data = await safeFetch(url, { states: [] });
    res.json(data);
});

// ======================================================
// ROUTE RADAR — format simplifié
// ======================================================
app.get("/radar", async (req, res) => {
    const url = "https://opensky-network.org/api/states/all";
    const data = await safeFetch(url, null);

    if (!data || !data.states) {
        return res.json({ flights: [] });
    }

    const flights = data.states
        .filter(s => s[5] !== null && s[6] !== null)
        .map(s => ({
            icao: s[0],
            callsign: s[1]?.trim(),
            lat: s[6],
            lon: s[5],
            alt: s[13],
            vel: s[9]
        }));

    res.json({ flights });
});

// ======================================================
// ROUTE SONOMETERS
// ======================================================
import sonoData from "./sonometers-data.js";
app.get("/sonos", (req, res) => {
    res.json(sonoData);
});

// ======================================================
// FALLBACK — Single Page App
// ======================================================
app.get("*", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    log(`Listening on port ${PORT}`);
    log(`Serving frontend from ${PUBLIC_DIR}`);
});
