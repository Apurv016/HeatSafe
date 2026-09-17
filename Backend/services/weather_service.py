import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def get_weather(latitude: float, longitude: float):
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
        response = await client.get(
            OPEN_METEO_URL,
            params=params,
        )

    response.raise_for_status()

    return response.json()