from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.weather_service import get_weather

app = FastAPI(
    title="HeatSafe API",
    description="Backend API for the HeatSafe heat-risk and safety application.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
async def weather_endpoint(
    latitude: float = Query(..., description="Location latitude"),
    longitude: float = Query(..., description="Location longitude"),
):
    return await get_weather(latitude, longitude)