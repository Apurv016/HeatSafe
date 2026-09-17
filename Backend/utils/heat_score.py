def calculate_heat_score(
    temperature: float,
    humidity: float,
    apparent_temperature: float,
    uv_index: float,
):
    score = 0

    # Apparent temperature
    if apparent_temperature >= 45:
        score += 60
    elif apparent_temperature >= 40:
        score += 50
    elif apparent_temperature >= 35:
        score += 40
    elif apparent_temperature >= 32:
        score += 30
    elif apparent_temperature >= 30:
        score += 20
    elif apparent_temperature >= 28:
        score += 10

    # Humidity
    if temperature >= 30:
        if humidity >= 90:
            score += 20
        elif humidity >= 80:
            score += 15
        elif humidity >= 70:
            score += 10
        elif humidity >= 60:
            score += 5

    # Temperature
    if temperature >= 40:
        score += 15
    elif temperature >= 35:
        score += 10
    elif temperature >= 30:
        score += 5

    # UV index
    if uv_index >= 8:
        score += 5
    elif uv_index >= 6:
        score += 4
    elif uv_index >= 3:
        score += 2

    score = min(score, 100)

    if score >= 75:
        level = "EXTREME RISK"
        emoji = "🔴"
    elif score >= 50:
        level = "HIGH RISK"
        emoji = "🟠"
    elif score >= 25:
        level = "MODERATE RISK"
        emoji = "🟡"
    else:
        level = "LOW RISK"
        emoji = "🟢"

    return {
        "score": score,
        "level": level,
        "emoji": emoji,
    }