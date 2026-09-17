from fastapi import FastAPI, Query
import httpx

app = FastAPI(
    title="HeatSafe API",
    description="Backend API for the HeatSafe heat-risk and safety application.",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "HeatSafe API is running!",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HeatSafe Backend",
    }
@app.get("/api/weather")
async def get_weather(
    latitude: float = Query(..., description="Location latitude"),
    longitude: float = Query(..., description="Location longitude"),
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "uv_index,"
            "wind_speed_10m"
        ),
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "uv_index"
        ),
        "timezone": "auto",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    response.raise_for_status()

    return response.json()