const HEAT_RISK_API_URL = "http://127.0.0.1:8000/api/heat-risk";

export async function getHeatRisk(
  temperature,
  humidity,
  apparentTemperature,
  uvIndex
) {
  const url =
    `${HEAT_RISK_API_URL}?temperature=${temperature}` +
    `&humidity=${humidity}` +
    `&apparent_temperature=${apparentTemperature}` +
    `&uv_index=${uvIndex}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to calculate heat risk");
  }

  return await response.json();
}