export function getRecommendations(
  temperature,
  humidity,
  uvIndex,
  riskLevel
) {
  const recommendations = [];

  // Extreme heat
  if (riskLevel === "EXTREME RISK") {
    recommendations.push(
      "🚨 Extreme heat conditions detected. Avoid prolonged outdoor exposure."
    );

    recommendations.push(
      "🧊 Take frequent cooling breaks and stay in a cool or shaded area."
    );
  }

  // High heat risk
  else if (riskLevel === "HIGH RISK") {
    recommendations.push(
      "⚠️ High heat risk. Take regular breaks during outdoor activity."
    );

    recommendations.push(
      "🧊 Prefer shaded or cool areas whenever possible."
    );
  }

  // Moderate heat risk
  else if (riskLevel === "MODERATE RISK") {
    recommendations.push(
      "💧 Stay hydrated and take regular breaks if you are outdoors."
    );
  }

  // Humidity
  if (temperature >= 30 && humidity >= 80) {
    recommendations.push(
      "💧 High humidity may make conditions feel hotter. Drink water regularly."
    );
  }

  // UV
  if (uvIndex >= 8) {
    recommendations.push(
      "☀️ Very high UV conditions. Limit direct sunlight and use sun protection."
    );
  } else if (uvIndex >= 6) {
    recommendations.push(
      "🧴 UV levels are high. Consider protection from direct sunlight."
    );
  }

  // Extreme temperature
  if (temperature >= 40) {
    recommendations.push(
      "🌡️ Extremely high temperature detected. Avoid strenuous outdoor activity."
    );
  } else if (temperature >= 35) {
    recommendations.push(
      "🌡️ High temperature detected. Reduce prolonged outdoor exertion."
    );
  }

  // Low-risk fallback
  if (recommendations.length === 0) {
    recommendations.push(
      "✅ Current conditions are relatively comfortable."
    );

    recommendations.push(
      "🌤️ Continue normal activities while staying aware of changing weather conditions."
    );
  }

  return recommendations;
}