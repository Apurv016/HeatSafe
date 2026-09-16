const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export async function getWeather(latitude, longitude) {
  const url =
    `${WEATHER_API_URL}?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,wind_speed_10m` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  return data;
}