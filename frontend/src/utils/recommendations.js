export function getRecommendations(temperature, humidity, uvIndex, riskLevel) {
  const recommendations = [];

  if (humidity >= 80) {
    recommendations.push("💧 Drink water frequently because humidity is high.");
  }

  if (temperature >= 35 || riskLevel === "HIGH RISK" || riskLevel === "EXTREME RISK") {
    recommendations.push("🧊 Take frequent cooling breaks and avoid prolonged heat exposure.");
  }

  if (uvIndex >= 6) {
    recommendations.push("☀️ Avoid direct sunlight during peak UV hours.");
  }

  if (temperature >= 38) {
    recommendations.push("🏠 Avoid strenuous outdoor activity during extreme heat.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Current conditions are relatively comfortable.");
  }

  return recommendations;
}