import { calculateHeatScore } from "./heatScore";

export function getHeatTimeline(hourly) {
  if (!hourly || !hourly.time) {
    return [];
  }

  const timeline = [];

  for (let i = 0; i < hourly.time.length; i++) {
    timeline.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i],
      apparentTemperature: hourly.apparent_temperature[i],
      humidity: hourly.relative_humidity_2m[i],
      uvIndex: hourly.uv_index[i],
      risk: calculateHeatScore(
        hourly.temperature_2m[i],
        hourly.relative_humidity_2m[i],
        hourly.apparent_temperature[i],
        hourly.uv_index[i]
      ),
    });
  }

  return timeline;
}