const express = require('express');

const router = express.Router();

const LAT = Number(process.env.WEATHER_LAT || 36.9741);  // Santa Cruz, CA
const LON = Number(process.env.WEATHER_LON || -122.0308);
const UA  = 'GravityConstructionSC/1.0 (dhollinga6@gmail.com)'; // weather.gov requires a UA

// In-memory cache — the widget polls at most every ~10min but callers may burst.
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache = { at: 0, payload: null };
let forecastUrl = null; // resolved once via /points/{lat},{lon}

async function resolveForecastUrl() {
  if (forecastUrl) return forecastUrl;
  const r = await fetch(`https://api.weather.gov/points/${LAT},${LON}`, {
    headers: { 'User-Agent': UA, 'Accept': 'application/geo+json' },
  });
  if (!r.ok) throw new Error(`weather.gov /points ${r.status}`);
  const data = await r.json();
  forecastUrl = data && data.properties && data.properties.forecast;
  if (!forecastUrl) throw new Error('No forecast URL in /points response');
  return forecastUrl;
}

async function fetchWeather() {
  const url = await resolveForecastUrl();
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/geo+json' },
  });
  if (!r.ok) throw new Error(`weather.gov forecast ${r.status}`);
  const data = await r.json();
  const periods = (data && data.properties && data.properties.periods) || [];
  const current = periods[0];
  if (!current) throw new Error('No forecast periods');

  return {
    location: 'Santa Cruz, CA',
    fetchedAt: new Date().toISOString(),
    current: {
      name: current.name,
      temperature: current.temperature,
      unit: current.temperatureUnit,
      shortForecast: current.shortForecast,
      icon: current.icon,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      isDaytime: current.isDaytime,
    },
    upcoming: periods.slice(1, 5).map(p => ({
      name: p.name,
      temperature: p.temperature,
      unit: p.temperatureUnit,
      shortForecast: p.shortForecast,
      icon: p.icon,
    })),
  };
}

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.payload && now - cache.at < CACHE_TTL_MS) {
      return res.json({ ...cache.payload, cached: true });
    }
    const payload = await fetchWeather();
    cache = { at: now, payload };
    res.json(payload);
  } catch (err) {
    console.error('[weather]', err.message);
    // If we have a stale cache, serve it rather than erroring out the widget
    if (cache.payload) {
      return res.json({ ...cache.payload, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Weather unavailable' });
  }
});

module.exports = router;
