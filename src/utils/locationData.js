import Country from "country-state-city/lib/country";
import State from "country-state-city/lib/state";

const cityCache = new Map();
let cityModulePromise = null;

function loadCityModule() {
  if (!cityModulePromise) {
    cityModulePromise = import("country-state-city/lib/city");
  }
  return cityModulePromise;
}

export function flagEmoji(isoCode) {
  if (!isoCode) return "";
  return isoCode
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

export function getCountries() {
  return Country.getAllCountries();
}

export function getCountryByCode(isoCode) {
  if (!isoCode) return undefined;
  return Country.getCountryByCode(isoCode);
}

export function getStatesOfCountry(countryCode) {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode);
}

export function getStateByCodeAndCountry(stateCode, countryCode) {
  if (!stateCode || !countryCode) return undefined;
  return State.getStateByCodeAndCountry(stateCode, countryCode);
}

export function getStateByCountryAndName(countryCode, name) {
  if (!countryCode || !name) return undefined;
  const q = name.trim().toLowerCase();
  return getStatesOfCountry(countryCode).find((s) => s.name.toLowerCase() === q);
}

export function getCountryByName(name) {
  if (!name) return undefined;
  const q = name.trim().toLowerCase();
  return getCountries().find((c) => c.name.toLowerCase() === q);
}

export async function loadCities(countryCode, stateCode) {
  if (!countryCode) return [];
  const key = `${countryCode}|${stateCode || ""}`;
  if (cityCache.has(key)) return cityCache.get(key);
  const { default: City } = await loadCityModule();
  const raw = stateCode
    ? City.getCitiesOfState(countryCode, stateCode)
    : City.getCitiesOfCountry(countryCode);
  const seen = new Set();
  const names = [];
  for (const c of raw) {
    const name = c && c.name ? c.name.trim() : "";
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  cityCache.set(key, names);
  return names;
}
