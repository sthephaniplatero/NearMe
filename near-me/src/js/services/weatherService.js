const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1`
    );

    const data = await res.json();

    return {
      temp: data.current.temp_c,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,

      main: data.current.condition.text,
      description: data.current.condition.text,
      icon: data.current.condition.icon,

      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset
    };

  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}