export function calculateHeatRisk(temperature, humidity, apparentTemperature) {
  if (apparentTemperature >= 45 || temperature >= 40) {
    return {
      level: "EXTREME RISK",
      emoji: "🔴",
    };
  }

  if (apparentTemperature >= 38 || temperature >= 35 || humidity >= 80) {
    return {
      level: "HIGH RISK",
      emoji: "🟠",
    };
  }

  if (apparentTemperature >= 32 || temperature >= 30 || humidity >= 70) {
    return {
      level: "MODERATE RISK",
      emoji: "🟡",
    };
  }

  return {
    level: "LOW RISK",
    emoji: "🟢",
  };
}