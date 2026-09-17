export function getHydrationRecommendation(
  temperature,
  humidity,
  riskLevel
) {
  let amount = 2000;

  if (temperature >= 35) {
    amount += 1000;
  } else if (temperature >= 30) {
    amount += 500;
  }

  if (humidity >= 80 && temperature >= 30) {
    amount += 500;
  }

  if (riskLevel === "HIGH RISK") {
    amount += 500;
  } else if (riskLevel === "EXTREME RISK") {
    amount += 1000;
  }

  return amount;
}