export function getHottestPeriod(hourly) {
  if (!hourly || !hourly.time || !hourly.apparent_temperature) {
    return null;
  }

  const now = new Date();

  let hottestIndex = -1;
  let highestTemperature = -Infinity;

  for (let i = 0; i < hourly.time.length; i++) {
    const forecastTime = new Date(hourly.time[i]);

    const difference =
      (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Only consider the next 24 hours
    if (difference >= 0 && difference <= 24) {
      const temperature = hourly.apparent_temperature[i];

      if (temperature > highestTemperature) {
        highestTemperature = temperature;
        hottestIndex = i;
      }
    }
  }

  if (hottestIndex === -1) {
    return null;
  }

  return {
    time: hourly.time[hottestIndex],
    apparentTemperature: highestTemperature,
    temperature: hourly.temperature_2m[hottestIndex],
    humidity: hourly.relative_humidity_2m[hottestIndex],
    uvIndex: hourly.uv_index[hottestIndex],
  };
}