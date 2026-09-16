export function calculateHeatScore(
  temperature,
  humidity,
  apparentTemperature,
  uvIndex
) {
  let score = 0;

  // Apparent temperature contribution
  if (apparentTemperature >= 45) {
    score += 50;
  } else if (apparentTemperature >= 40) {
    score += 40;
  } else if (apparentTemperature >= 35) {
    score += 30;
  } else if (apparentTemperature >= 32) {
    score += 20;
  } else if (apparentTemperature >= 28) {
    score += 10;
  }

  // Humidity contribution
  if (humidity >= 90) {
    score += 30;
  } else if (humidity >= 80) {
    score += 25;
  } else if (humidity >= 70) {
    score += 15;
  } else if (humidity >= 60) {
    score += 10;
  }

  // Temperature contribution
  if (temperature >= 40) {
    score += 15;
  } else if (temperature >= 35) {
    score += 10;
  } else if (temperature >= 30) {
    score += 5;
  }

  // UV contribution
  if (uvIndex >= 8) {
    score += 5;
  } else if (uvIndex >= 6) {
    score += 4;
  } else if (uvIndex >= 3) {
    score += 2;
  }

  score = Math.min(score, 100);

  let level;
  let emoji;

  if (score >= 75) {
    level = "EXTREME RISK";
    emoji = "🔴";
  } else if (score >= 50) {
    level = "HIGH RISK";
    emoji = "🟠";
  } else if (score >= 25) {
    level = "MODERATE RISK";
    emoji = "🟡";
  } else {
    level = "LOW RISK";
    emoji = "🟢";
  }

  return {
    score,
    level,
    emoji,
  };
}