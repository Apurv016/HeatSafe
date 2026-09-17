import { useEffect, useState } from "react";
import "./App.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { getWeather } from "./services/weatherService";
import { getRecommendations } from "./utils/recommendations";
import { calculateHeatScore } from "./utils/heatScore";
import { countries } from "./data/countries";
import { locations } from "./data/locations";
import { getHottestPeriod } from "./utils/forecast";
import { getHydrationRecommendation } from "./utils/hydration";
import { getHeatTimeline } from "./utils/heatTimeline";
function App() {
const [weather, setWeather] = useState(null);
const [locationTimezone, setLocationTimezone] = useState("Asia/Kolkata");
const [timezoneAbbreviation, setTimezoneAbbreviation] = useState("IST");
const [utcOffsetSeconds, setUtcOffsetSeconds] = useState(19800);
const [waterConsumed, setWaterConsumed] = useState(() => {
  const savedWater = localStorage.getItem("heatsafe-water");
  return savedWater ? Number(savedWater) : 0;
});
useEffect(() => {
  localStorage.setItem("heatsafe-water", waterConsumed);
}, [waterConsumed]);
  const [hourly, setHourly] = useState(null);
  const [heatTimeline, setHeatTimeline] = useState([]);
const [hottestPeriod, setHottestPeriod] = useState(null);
const [selectedTimelineTime, setSelectedTimelineTime] = useState(null);
const [error, setError] = useState(null);
const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
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
setLocationTimezone(data.timezone || "Asia/Kolkata");
setTimezoneAbbreviation(data.timezoneAbbreviation || "IST");
setUtcOffsetSeconds(data.utcOffsetSeconds ?? 19800);
setHourly(data.hourly);
setHottestPeriod(getHottestPeriod(data.hourly));
setHeatTimeline(getHeatTimeline(data.hourly));
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
const peakRisk = heatTimeline.reduce((highest, item) => {
  if (!highest || item.risk.score > highest.risk.score) {
    return item;
  }

  return highest;
}, null);
const locationNowParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: locationTimezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).formatToParts(currentTime);
const nowYear = locationNowParts.find(
  (part) => part.type === "year"
)?.value;
const nowMonth = locationNowParts.find(
  (part) => part.type === "month"
)?.value;
const nowDay = locationNowParts.find(
  (part) => part.type === "day"
)?.value;
const nowHour = locationNowParts.find(
  (part) => part.type === "hour"
)?.value;
const nowMinute = locationNowParts.find(
  (part) => part.type === "minute"
)?.value;
const nowSecond = locationNowParts.find(
  (part) => part.type === "second"
)?.value;
const currentHourKey =
  `${nowYear}-${nowMonth}-${nowDay}T${nowHour}:00`;

const liveChartStartIndex = heatTimeline.findIndex(
  (item) => item.time === currentHourKey
);

const chartData =
  liveChartStartIndex >= 0
    ? heatTimeline.slice(
        liveChartStartIndex,
        liveChartStartIndex + 12
      )
    : heatTimeline.slice(0, 12);
    const liveChartX =
  Number(nowMinute) / 60 +
  Number(nowSecond) / 3600;

const livePoint = {
  chartX: liveChartX,
  time: `${nowYear}-${nowMonth}-${nowDay}T${nowHour}:${nowMinute}`,
  temperature: weather.temperature_2m,
  apparentTemperature: weather.apparent_temperature,
  humidity: weather.relative_humidity_2m,
  risk,
  isLive: true,
};

const chartDataWithX = [
  ...chartData.map((item, index) => ({
    ...item,
    chartX: index,
    isLive: false,
  })),
  livePoint,
].sort((a, b) => a.chartX - b.chartX);
const chartPeakRisk = chartDataWithX.reduce((highest, item) => {
  if (!highest || item.risk.score > highest.risk.score) {
    return item;
  }
  return highest;
}, null);
// 🌍 LOCATION TIMEZONE

const parseLocationTime = (time) => {
  if (!time) return null;

  const wallClockAsUTC = Date.parse(`${time}:00Z`);

  return new Date(
    wallClockAsUTC - utcOffsetSeconds * 1000
  );
};

const formatLocalTime = (time) => {
  const date = parseLocationTime(time);

  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: locationTimezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
// LIVE HEAT INTELLIGENCE
const currentChartRisk = chartData[0]?.risk?.score ?? risk.score;
const futureChartRisk =
  chartData.length > 1
    ? chartData[chartData.length - 1]?.risk?.score
    : currentChartRisk;

const riskChange = futureChartRisk - currentChartRisk;

let riskTrend = "Stable";
let riskTrendIcon = "→";

if (riskChange >= 8) {
  riskTrend = "Rising";
  riskTrendIcon = "↑";
} else if (riskChange <= -8) {
  riskTrend = "Falling";
  riskTrendIcon = "↓";
}
const formatClock = (date, timeZone) => {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const istOffsetSeconds = 19800;

const timeDifferenceSeconds =
  utcOffsetSeconds - istOffsetSeconds;

const differenceSign =
  timeDifferenceSeconds > 0
    ? "+"
    : timeDifferenceSeconds < 0
    ? "−"
    : "";

const absoluteDifference = Math.abs(timeDifferenceSeconds);

const differenceHours = Math.floor(
  absoluteDifference / 3600
);

const differenceMinutes = Math.floor(
  (absoluteDifference % 3600) / 60
);

const timeDifferenceLabel =
  timeDifferenceSeconds === 0
    ? "Same as IST"
    : `${differenceSign}${differenceHours}h${
        differenceMinutes
          ? ` ${differenceMinutes}m`
          : ""
      } vs IST`;

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
<div className="time-zone-panel">

  <div className="time-zone-item">
    <span>🌍 LOCAL TIME</span>

    <strong>
      {formatClock(currentTime, locationTimezone)}
    </strong>

    <small>{timezoneAbbreviation}</small>
  </div>

  <div className="time-zone-divider"></div>

  <div className="time-zone-item">
    <span>🇮🇳 IST</span>

    <strong>
      {formatClock(currentTime, "Asia/Kolkata")}
    </strong>

    <small>IST</small>
  </div>

  <div className="time-zone-difference">
    {timeDifferenceLabel}
  </div>

</div>
  <p className="subtitle">
    Your personal heat-risk and safety assistant.
  </p>

        {/* RISK CARD */}

        <div className={`risk-card risk-${risk.level.toLowerCase().replace(" risk", "")}`}>
          <div className="risk-level">
  <span className="risk-emoji">{risk.emoji}</span>
  <span>{risk.level}</span>
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
              {formatLocalTime(hottestPeriod.time)}
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
        {chartPeakRisk && (
  <section className="peak-risk-card">
    <h2>⚠️ Peak Heat Risk</h2>

    <div className="peak-risk-score">
      {chartPeakRisk.risk.emoji} {chartPeakRisk.risk.score}/100
    </div>

    <div className="peak-risk-level">
      {chartPeakRisk.risk.level}
    </div>

    <p>
      Expected around{" "}
      <strong>
        {formatLocalTime(chartPeakRisk.time)}
      </strong>
    </p>

    <p>
      Feels like{" "}
      <strong>
        {chartPeakRisk.apparentTemperature.toFixed(1)}°C
      </strong>
    </p>
  </section>
)}

{/* ANIMATED HEAT RISK FORECAST */}

<section className="heat-chart-card">
<div className="heat-intelligence">

  <div className="intelligence-title">
    <span>🔥</span>
    <span>LIVE HEAT INTELLIGENCE</span>
  </div>

  <div className="intelligence-grid">

    <div className="intelligence-item">
      <span className="intelligence-label">CURRENT</span>
      <strong>{currentChartRisk}/100</strong>
      <small>{risk.level}</small>
    </div>

    <div className="intelligence-item">
      <span className="intelligence-label">PEAK</span>
      <strong>{chartPeakRisk?.risk.score ?? "--"}/100</strong>
      <small>
        {chartPeakRisk
  ? formatLocalTime(chartPeakRisk.time)
  : "--"}
      </small>
    </div>

    <div className="intelligence-item">
      <span className="intelligence-label">TREND</span>
      <strong>
        {riskTrendIcon} {riskTrend}
      </strong>
      <small>
        {riskChange > 0 ? "+" : ""}
        {riskChange} pts
      </small>
    </div>

  </div>

</div>
  <div className="chart-header">
    <div>
      <h2>📈 Heat Risk Forecast</h2>
      <p>
  Next 12 hours • Local time ({timezoneAbbreviation}) • Live heat-risk projection
</p>
    </div>

    <div className="chart-badge">
      🔥 LIVE
    </div>
  </div>

  <div className="chart-wrapper">

    <ResponsiveContainer width="100%" height={420}>
      <LineChart
  data={chartDataWithX}
  margin={{
    top: 20,
    right: 65,
    left: 5,
    bottom: 10,
  }}
  onClick={(data) => {
    if (data && data.activeLabel !== undefined) {
      const clickedItem = chartDataWithX.find(
        (item) => item.chartX === data.activeLabel
      );

      if (clickedItem) {
        setSelectedTimelineTime(clickedItem.time);
      }
    }
  }}
>

        {/* GRADIENT */}

        <defs>

          <linearGradient
            id="heatGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="0%"
              stopColor="#ff5722"
              stopOpacity={0.45}
            />

            <stop
              offset="70%"
              stopColor="#ff5722"
              stopOpacity={0.12}
            />

            <stop
              offset="100%"
              stopColor="#ff5722"
              stopOpacity={0}
            />

          </linearGradient>
          <linearGradient
  id="heatLineGradient"
  x1="0"
  y1="0"
  x2="1"
  y2="0"
>
  <stop offset="0%" stopColor="#22c55e" />
  <stop offset="35%" stopColor="#facc15" />
  <stop offset="65%" stopColor="#ff9800" />
  <stop offset="100%" stopColor="#ff3d00" />
</linearGradient>

<filter
  id="heatGlowStrong"
  x="-50%"
  y="-50%"
  width="200%"
  height="200%"
>
  <feGaussianBlur
    stdDeviation="7"
    result="blur"
  />

  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
          {/* GLOW */}

          <filter
            id="glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >

            <feGaussianBlur
              stdDeviation="4"
              result="coloredBlur"
            />

            <feMerge>

              <feMergeNode in="coloredBlur" />

              <feMergeNode in="SourceGraphic" />

            </feMerge>

          </filter>

        </defs>


        {/* RISK ZONES */}

        <ReferenceArea
          y1={0}
          y2={30}
          fill="#22c55e"
          fillOpacity={0.04}
        />

        <ReferenceArea
          y1={30}
          y2={60}
          fill="#f59e0b"
          fillOpacity={0.04}
        />

        <ReferenceArea
          y1={60}
          y2={100}
          fill="#ef4444"
          fillOpacity={0.05}
        />


        {/* GRID */}

        <CartesianGrid
          strokeDasharray="4 8"
          vertical={false}
          opacity={0.15}
        />


        {/* X AXIS */}

        <XAxis
  type="number"
  dataKey="chartX"
  domain={[0, 11]}
  ticks={chartData.map((_, index) => index)}
  axisLine={false}
  tickLine={false}
  tickMargin={12}
  tickFormatter={(value) => {
  const item = chartDataWithX.find(
    (item) => item.chartX === value && !item.isLive
  );
  return item ? formatLocalTime(item.time) : "";
}}
/>


        {/* Y AXIS */}

        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />       
        {/* LIVE CURRENT TIME */}
{chartDataWithX.length > 0 && (
  <ReferenceLine
    x={liveChartX}
    stroke="#00e5ff"
    strokeWidth={2.5}
    strokeDasharray="5 5"
    opacity={0.95}
    className="live-now-line"
    label={{
      value: `● NOW ${formatClock(currentTime, locationTimezone)}`,
      position: "insideTopLeft",
      fill: "#00e5ff",
      fontSize: 12,
      fontWeight: 900,
      className: "live-now-label",
    }}
  />
)}
{/* PEAK RISK INDICATOR */}
{chartPeakRisk && (
  <ReferenceLine
    x={chartPeakRisk.chartX}
    stroke="#ff5722"
    strokeDasharray="6 6"
    strokeWidth={1.5}
    opacity={0.7}
    label={{
      value: `🔥 PEAK ${chartPeakRisk.risk.score}/100`,
      position: "insideTopRight",
      offset: 15,
      fill: "#ff7043",
      fontSize: 13,
      fontWeight: 700,
    }}
  />
)}
{/* SELECTED TIMELINE HOUR */}

{selectedTimelineTime && (
  <ReferenceLine
    x={chartDataWithX.findIndex(
  (item) => item.time === selectedTimelineTime
)}
    stroke="#ffffff"
    strokeWidth={2}
    strokeDasharray="4 4"
    opacity={0.9}
    label={{
      value: "SELECTED",
      position: "insideTop",
      fill: "#ffffff",
      fontSize: 12,
      fontWeight: 700,
    }}
  />
)}
{/* RISK THRESHOLDS */}

<ReferenceLine
  y={30}
  stroke="#22c55e"
  strokeDasharray="5 5"
  opacity={0.35}
  label={{
    value: "LOW RISK",
    position: "insideLeft",
    fill: "#22c55e",
    fontSize: 10,
    fontWeight: 700,
  }}
/>

<ReferenceLine
  y={60}
  stroke="#f59e0b"
  strokeDasharray="5 5"
  opacity={0.4}
  label={{
    value: "MODERATE",
    position: "insideLeft",
    fill: "#f59e0b",
    fontSize: 10,
    fontWeight: 700,
  }}
/>

<ReferenceLine
  y={85}
  stroke="#ef4444"
  strokeDasharray="5 5"
  opacity={0.25}
  label={{
    value: "HIGH RISK",
    position: "insideLeft",
    fill: "#ef4444",
    fontSize: 10,
    fontWeight: 700,
  }}
/>
        {/* TOOLTIP */}
        <Tooltip
  cursor={{
    stroke: "#ff5722",
    strokeWidth: 1,
    strokeDasharray: "5 5",
  }}
  content={({ active, payload, label, coordinate, viewBox }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const riskData = payload.find(
      (entry) => entry.dataKey === "risk.score"
    );

    const payloadPoint = payload[0]?.payload;

    if (!riskData) {
      return null;
    }

    // Recharts snaps the tooltip to the nearest hourly point.
    // When the cursor is around the live NOW position, use the
    // live weather values instead of the rounded hourly forecast.
    const isNearNow =
      typeof label === "number" &&
      Math.abs(label - liveChartX) <= 0.25;

    const point = isNearNow ? livePoint : payloadPoint;

    return (
      <div
        style={{
          background: "rgba(20, 20, 25, 0.97)",
          border: isNearNow
            ? "1px solid rgba(0, 229, 255, 0.70)"
            : "1px solid rgba(255, 87, 34, 0.45)",
          borderRadius: "14px",
          padding: "14px 18px",
          boxShadow: isNearNow
            ? "0 0 25px rgba(0,229,255,0.18), 0 10px 30px rgba(0,0,0,0.4)"
            : "0 10px 30px rgba(0,0,0,0.4)",
          minWidth: "180px",
          transform:
            coordinate?.x < 180
              ? "translateX(20px)"
              : coordinate?.x > (viewBox?.width ?? 0) - 180
              ? "translateX(-200px)"
              : "translateX(-50%)",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "8px",
            textAlign: "center",
            color: isNearNow ? "#00e5ff" : "#ffffff",
          }}
        >
          {isNearNow
            ? `🔵 NOW ${formatClock(currentTime, locationTimezone)}`
            : point?.time
            ? formatLocalTime(point.time)
            : "--"}
        </div>

        <div
          style={{
            color: isNearNow ? "#00e5ff" : "#ff7043",
            fontSize: "16px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          🔥 Heat Risk: {point?.risk?.score ?? riskData.value}/100
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            lineHeight: "1.8",
          }}
        >
          🌡️ Temperature: {point?.temperature}°C
          <br />
          🥵 Feels like: {point?.apparentTemperature}°C
          <br />
          💧 Humidity: {point?.humidity}%
        </div>
      </div>
    );
  }}
/>
        {/* AREA */}

        <Area
          type="monotone"
          dataKey="risk.score"
          stroke="none"
          fill="url(#heatGradient)"
          animationDuration={1800}
          animationEasing="ease-out"
        />
        {/* AMBIENT HEAT GLOW */}
<Line
  type="monotone"
  dataKey="risk.score"
  stroke="#ff5722"
  strokeWidth={12}
  strokeOpacity={0.12}
  dot={false}
  activeDot={false}
  filter="url(#heatGlowStrong)"
  animationDuration={2200}
  animationEasing="ease-out"
/>
        {/* MAIN GLOWING LINE */}
        <Line
          type="monotone"
          dataKey="risk.score"
          stroke="url(#heatLineGradient)"
          strokeWidth={4}
          style={{ cursor: "pointer" }}
          dot={(props) => {
  const { cx, cy, payload } = props;

  const score = payload?.risk?.score ?? 0;
  const isLive = payload?.isLive;
  const isPeak =
    chartPeakRisk &&
    payload.time === chartPeakRisk.time;

  // Dynamic risk color
  let riskColor = "#22c55e"; // LOW

  if (score >= 60) {
    riskColor = "#ef4444"; // HIGH
  } else if (score >= 30) {
    riskColor = "#f59e0b"; // MODERATE
  }
if (isLive) {
  return (
    <g className="live-chart-point">
      <circle
        cx={cx}
        cy={cy}
        r={11}
        fill="none"
        stroke="#00e5ff"
        strokeWidth={2}
        className="live-point-pulse"
      />

      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#07141a"
        stroke="#00e5ff"
        strokeWidth={3}
      />
    </g>
  );
}
  // PEAK POINT
if (isPeak) {
  return (
    <g className="peak-chart-point">

      {/* PEAK SCORE */}
      <text
        x={cx}
        y={cy - 22}
        textAnchor="middle"
        fill="#ff7043"
        fontSize={11}
        fontWeight={900}
      >
        {score}/100
      </text>
        {/* Peak outer pulse */}
        <circle
          cx={cx}
          cy={cy}
          r={11}
          fill="none"
          stroke="#ff5722"
          strokeWidth={2}
          className="peak-pulse"
        />

        {/* Peak glow */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="#ff5722"
          opacity={0.28}
          filter="url(#glow)"
        />

        {/* Peak point */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#15161c"
          stroke="#ff5722"
          strokeWidth={3}
        />
      </g>
    );
  }

  // NORMAL RISK POINT
return (
  <g className="risk-chart-point">

    {/* Score label */}
<text
  x={cx}
  y={cy - 16}
  textAnchor="middle"
  fill={riskColor}
  fontSize={10}
  fontWeight={800}
>
  {score}
</text>

    {/* Soft colored glow */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={riskColor}
        opacity={0.22}
        filter="url(#glow)"
      />

      {/* Pulsing ring */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="none"
        stroke={riskColor}
        strokeWidth={1.5}
        opacity={0.7}
        className="risk-dot-pulse"
      />

      {/* Main point */}
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill="#15161c"
        stroke={riskColor}
        strokeWidth={2.5}
      />
    </g>
  );
}}
          activeDot={{
            r: 8,
            fill: "#ff5722",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
          filter="url(#glow)"
          animationDuration={2000}
          animationEasing="ease-in-out"
        />
      </LineChart>

    </ResponsiveContainer>

  </div>


  {/* LEGEND */}

  <div className="risk-legend">

    <div className="legend-item">
      <span className="legend-dot low"></span>
      Low Risk
    </div>

    <div className="legend-item">
      <span className="legend-dot moderate"></span>
      Moderate Risk
    </div>

    <div className="legend-item">
      <span className="legend-dot high"></span>
      High Risk
    </div>

  </div>

</section>

{/* HEAT RISK TIMELINE */}

<section className="heat-timeline">

  <div className="timeline-header">
    <div>
      <h2>🌡️ Heat Risk Timeline</h2>
      <p>Hourly heat conditions</p>
    </div>

    <div className="timeline-count">
      {Math.min(heatTimeline.length, 12)} HOURS
    </div>
  </div>

  <div className="timeline-list">

    {heatTimeline
      .slice(0, 12)
      .map((item) => {

        const score = item.risk.score;

        let riskClass = "low";

        if (score >= 60) {
          riskClass = "high";
        } else if (score >= 30) {
          riskClass = "moderate";
        }

        return (
          <div
  className={`timeline-item ${riskClass} ${
    chartPeakRisk && item.time === chartPeakRisk.time
      ? "peak-timeline"
      : ""
  } ${
    selectedTimelineTime === item.time
      ? "selected-timeline"
      : ""
  }`}
  key={item.time}
  onClick={() => {
    setSelectedTimelineTime(item.time);

    document
      .querySelector(".heat-chart-card")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }}
>
  {chartPeakRisk && item.time === chartPeakRisk.time && (
    <div className="timeline-peak-badge">
      🔥 PEAK
    </div>
  )}
            {/* TIME */}
            <div className="timeline-time">
  {formatLocalTime(item.time)}
</div>
            {/* ICON */}
            <div className="timeline-icon">
              {item.risk.emoji}
            </div>
            {/* TEMPERATURE */}
            <div className="timeline-temperature">
              {item.apparentTemperature.toFixed(1)}°
            </div>
            {/* RISK SCORE */}
            <div className="timeline-score">
              {score}/100
            </div>
            {/* RISK LEVEL */}
            <div className="timeline-risk">
              {item.risk.level.replace(" RISK", "")}
            </div>
            {/* SCORE BAR */}
            <div className="timeline-bar">
              <div
                className="timeline-bar-fill"
                style={{
                  width: `${score}%`,
                }}
              />
            </div>

          </div>
        );
      })}

  </div>

</section>

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