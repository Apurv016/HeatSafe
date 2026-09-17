const WEATHER_API_URL = "http://127.0.0.1:8000/api/weather";

export async function getWeather(latitude, longitude) {
  const url =
    `${WEATHER_API_URL}?latitude=${latitude}` +
    `&longitude=${longitude}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  return {
    ...data,
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation,
    utcOffsetSeconds: data.utc_offset_seconds,
  };
}