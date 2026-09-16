import { useEffect, useState } from "react";
import "./App.css";
import { getWeather } from "./services/weatherService";
import { getRecommendations } from "./utils/recommendations";
import { calculateHeatScore } from "./utils/heatScore";
function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await getWeather(20.2961, 85.8245);
        setWeather(data.current);
      } catch (err) {
        setError("Unable to fetch weather data.");
      }
    }

    fetchWeather();
  }, []);

  if (error) {
    return <div className="app">{error}</div>;
  }

  if (!weather) {
    return <div className="app">Loading weather...</div>;
  }
const risk = calculateHeatScore(
  weather.temperature_2m,
  weather.relative_humidity_2m,
  weather.apparent_temperature,
  weather.uv_index
);

const recommendations = getRecommendations(
  weather.temperature_2m,
  weather.relative_humidity_2m,
  weather.uv_index,
  risk.level
);
  return (
    <div className="app">

      <header className="header">
        <div className="logo">🔥 HeatSafe</div>
        <div className="location">📍 Bhubaneswar</div>
      </header>

      <main className="hero">

        <p className="subtitle">
          Your personal heat-risk and safety assistant.
        </p>

        <div className="risk-card">
          <div className="risk-level">
  {risk.emoji} {risk.level}
</div>

          <div className="temperature">
            {weather.temperature_2m}°C
          </div>

          <div className="feels-like">
            Feels like {weather.apparent_temperature}°C
          </div>
          <div className="heat-score">
  <div className="heat-score-text">
    Heat Risk Score: {risk.score}/100
  </div>

  <div className="score-bar">
    <div
      className="score-fill"
      style={{ width: `${risk.score}%` }}
    ></div>
  </div>
</div>
        </div>

        <div className="weather-grid">

          <div className="weather-card">
            <div className="weather-icon">🌡️</div>
            <div className="weather-value">
              {weather.temperature_2m}°C
            </div>
            <div className="weather-label">
              Temperature
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-icon">💧</div>
            <div className="weather-value">
              {weather.relative_humidity_2m}%
            </div>
            <div className="weather-label">
              Humidity
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-icon">☀️</div>
            <div className="weather-value">
              {weather.uv_index}
            </div>
            <div className="weather-label">
              UV Index
            </div>
          </div>
          <div className="weather-card">
  <div className="weather-icon">🌬️</div>
  <div className="weather-value">
    {weather.wind_speed_10m} km/h
  </div>
  <div className="weather-label">
    Wind Speed
  </div>
</div>

        </div>

        <section className="recommendations">

  <h2>⚠️ Safety Recommendations</h2>

  {recommendations.map((recommendation, index) => (
    <div className="recommendation" key={index}>
      {recommendation}
    </div>
  ))}

</section>

      </main>

    </div>
  );
}

export default App;