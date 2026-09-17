const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

export async function searchCity(cityName, countryCode = "") {
  const countryFilter = countryCode
    ? `&countryCode=${countryCode}`
    : "";

  const url =
    `${GEOCODING_API_URL}?name=${encodeURIComponent(cityName)}` +
    `&count=10` +
    `&language=en` +
    `&format=json` +
    countryFilter;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to search location");
  }

  const data = await response.json();

  return data.results || [];
}