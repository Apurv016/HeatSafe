import { useEffect, useState } from "react";
import "./App.css";
import { getWeather } from "./services/weatherService";
import { getRecommendations } from "./utils/recommendations";
import { calculateHeatScore } from "./utils/heatScore";
import { countries } from "./data/countries";
import { locations } from "./data/locations";
import { getHottestPeriod } from "./utils/forecast";
import { getHydrationRecommendation } from "./utils/hydration";
function App() {
  const [weather, setWeather] = useState(null);
  const [waterConsumed, setWaterConsumed] = useState(() => {
  const savedWater = localStorage.getItem("heatsafe-water");
  return savedWater ? Number(savedWater) : 0;
});
useEffect(() => {
  localStorage.setItem("heatsafe-water", waterConsumed);
}, [waterConsumed]);
  const [hourly, setHourly] = useState(null);
const [hottestPeriod, setHottestPeriod] = useState(null);
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
        setError(null);
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
        setHourly(data.hourly);
        setHottestPeriod(getHottestPeriod(data.hourly));
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
  const hydrationAmount = getHydrationRecommendation(
  weather.temperature_2m,
  weather.relative_humidity_2m,
  risk.level
  );
  const hydrationProgress = Math.min(
  (waterConsumed / hydrationAmount) * 100,
  100
);

const remainingWater = Math.max(
  hydrationAmount - waterConsumed,
  0
);
  return (
    <div className="app">

      <header className="header">

        <div className="logo">
          🔥 HeatSafe
        </div>

        <div className="country-selector">

          {/* COUNTRY */}

          <label htmlFor="country">
            🌍 Country
          </label>

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
                setSelectedCity(countryLocations[0]?.cities?.[0]);
              } else {
                setSelectedRegion(null);
                setSelectedCity(null);
              }
            }}
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
              >
                {country.name}
              </option>
            ))}
          </select>

          {/* REGION */}

          {locations[selectedCountry.code] && (
            <>
              <label htmlFor="region">
                📍 Region
              </label>

              <select
                id="region"
                value={selectedRegion?.region || ""}
                onChange={(event) => {
                  const region = locations[
                    selectedCountry.code
                  ].find(
                    (item) =>
                      item.region === event.target.value
                  );

                  setSelectedRegion(region);
                  setSelectedCity(region?.cities?.[0]);
                }}
              >
                {locations[selectedCountry.code].map(
                  (region) => (
                    <option
                      key={region.region}
                      value={region.region}
                    >
                      {region.region}
                    </option>
                  )
                )}
              </select>

              {/* CITY */}

              <label htmlFor="city">
                🏙️ City
              </label>

              <select
                id="city"
                value={selectedCity?.name || ""}
                onChange={(event) => {
                  const city =
                    selectedRegion?.cities?.find(
                      (item) =>
                        item.name === event.target.value
                    );

                  setSelectedCity(city);
                }}
              >
                {selectedRegion?.cities?.map(
                  (city) => (
                    <option
                      key={city.name}
                      value={city.name}
                    >
                      {city.name}
                    </option>
                  )
                )}
              </select>
            </>
          )}

        </div>

      </header>

      <main className="hero">

  <div className="selected-location">
    📍 {selectedCity?.name}, {selectedRegion?.region},{" "}
    {selectedCountry?.name}
  </div>

  <p className="subtitle">
    Your personal heat-risk and safety assistant.
  </p>

        {/* RISK CARD */}

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
                style={{
                  width: `${risk.score}%`,
                }}
              ></div>

            </div>

          </div>
          <div className="risk-explanation">

  <h3>
  🧠 Why is the risk {risk.level.replace(" RISK", "").toLowerCase()}?
</h3>

  <div className="risk-factors">

    <div>
      🌡️ Temperature: {weather.temperature_2m}°C
    </div>

    <div>
      💦 Feels like: {weather.apparent_temperature}°C
    </div>

    <div>
      💧 Humidity: {weather.relative_humidity_2m}%
    </div>

    <div>
      ☀️ UV Index: {weather.uv_index}
    </div>

  </div>

</div>

        </div>
                {/* HOTTEST PERIOD */}

        {hottestPeriod && (
          <div className="forecast-card">

            <h2>🔥 Hottest Period</h2>

            <div className="forecast-temperature">
              Feels like {hottestPeriod.apparentTemperature}°C
            </div>

            <div className="forecast-time">
              {new Date(hottestPeriod.time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            <div className="forecast-details">
              🌡️ {hottestPeriod.temperature}°C
              &nbsp; • &nbsp;
              💧 {hottestPeriod.humidity}%
              &nbsp; • &nbsp;
              ☀️ UV {hottestPeriod.uvIndex}
            </div>

          </div>
        )}

        {/* WEATHER CARDS */}

        <div className="weather-grid">

          <div className="weather-card">

            <div className="weather-icon">
              🌡️
            </div>

            <div className="weather-value">
              {weather.temperature_2m}°C
            </div>

            <div className="weather-label">
              Temperature
            </div>

          </div>

          <div className="weather-card">

            <div className="weather-icon">
              💧
            </div>

            <div className="weather-value">
              {weather.relative_humidity_2m}%
            </div>

            <div className="weather-label">
              Humidity
            </div>

          </div>

          <div className="weather-card">

            <div className="weather-icon">
              ☀️
            </div>

            <div className="weather-value">
              {weather.uv_index}
            </div>

            <div className="weather-label">
              UV Index
            </div>

          </div>

          <div className="weather-card">

            <div className="weather-icon">
              🌬️
            </div>

            <div className="weather-value">
              {weather.wind_speed_10m} km/h
            </div>

            <div className="weather-label">
              Wind Speed
            </div>

          </div>

        </div>
                {/* HYDRATION */}

        <section className="hydration-card">

  <div className="hydration-icon">
    💧
  </div>

  <div className="hydration-content">

    <h2>Hydration Target</h2>

    <div className="hydration-amount">
      {hydrationAmount} mL/day
    </div>

    <p>
      You've consumed {waterConsumed} mL today.
    </p>

    <div className="hydration-progress">
      <div
        className="hydration-progress-fill"
        style={{ width: `${hydrationProgress}%` }}
      ></div>
    </div>

    <div className="hydration-progress-text">
      {Math.round(hydrationProgress)}% complete
      &nbsp; • &nbsp;
      {remainingWater} mL remaining
    </div>

    <div className="hydration-actions">

      <button
        onClick={() =>
          setWaterConsumed((current) => current + 250)
        }
      >
        +250 mL
      </button>

      <button
        onClick={() => setWaterConsumed(0)}
      >
        Reset
      </button>

    </div>

  </div>

</section>

        {/* SAFETY RECOMMENDATIONS */}

        <section className="recommendations">

          <h2>
            ⚠️ Safety Recommendations
          </h2>

          {recommendations.map(
            (recommendation, index) => (
              <div
                className="recommendation"
                key={index}
              >
                {recommendation}
              </div>
            )
          )}

        </section>

      </main>

    </div>
  );
}

export default App;