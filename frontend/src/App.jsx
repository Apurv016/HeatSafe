import { useEffect, useState } from "react";
import "./App.css";
import { getWeather } from "./services/weatherService";
import { getRecommendations } from "./utils/recommendations";
import { calculateHeatScore } from "./utils/heatScore";
import { countries } from "./data/countries";
import { locations } from "./data/locations";
function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedRegion, setSelectedRegion] = useState(
  locations[countries[0].code]?.[0]
);
const [selectedCity, setSelectedCity] = useState(
  locations[countries[0].code]?.[0]?.cities?.[0]
);
  useEffect(() => {
  async function fetchWeather() {
    try {
      setWeather(null);

      const latitude =
        selectedCity?.latitude ??
        selectedRegion?.cities?.[0]?.latitude ??
        selectedCountry.latitude;

      const longitude =
        selectedCity?.longitude ??
        selectedRegion?.cities?.[0]?.longitude ??
        selectedCountry.longitude;

      const data = await getWeather(latitude, longitude);

      setWeather(data.current);
    } catch (err) {
      setError("Unable to fetch weather data.");
    }
  }

  fetchWeather();
}, [selectedCountry, selectedRegion, selectedCity]);
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
  <div className="country-selector">
  <label htmlFor="country">🌍 Country</label>

  <select
    id="country"
    value={selectedCountry.code}
    onChange={(event) => {
      const country = countries.find(
        (item) => item.code === event.target.value
      );

      setSelectedCountry(country);

      const countryLocations = locations[country.code];

      if (countryLocations) {
        setSelectedRegion(countryLocations[0]);
      } else {
        setSelectedRegion(null);
      }
    }}
  >
    {countries.map((country) => (
      <option key={country.code} value={country.code}>
        {country.name}
      </option>
    ))}
  </select>
  {locations[selectedCountry.code] && (
  <>
    <label htmlFor="region">📍 Region</label>

    <select
      id="region"
      value={selectedRegion?.region || ""}
      onChange={(event) => {
        const region = locations[selectedCountry.code].find(
          (item) => item.region === event.target.value
        );

        setSelectedRegion(region);
        setSelectedCity(region?.cities?.[0]);
      }}
    >
      {locations[selectedCountry.code].map((region) => (
        <option key={region.region} value={region.region}>
          {region.region}
        </option>
      ))}
    </select>

    <label htmlFor="city">🏙️ City</label>

    <select
      id="city"
      value={selectedCity?.name || ""}
      onChange={(event) => {
        const city = selectedRegion.cities.find(
          (item) => item.name === event.target.value
        );

        setSelectedCity(city);
      }}
    >
      {selectedRegion?.cities?.map((city) => (
        <option key={city.name} value={city.name}>
          {city.name}
        </option>
      ))}
    </select>
  </>
)}
</div>
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