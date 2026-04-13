export function getWeatherRecommendation(weather) {
  if (!weather) return "No weather data available";

  const temp = weather.temp;
  const condition = weather.main.toLowerCase();

  if (condition.includes("rain")) {
    return "🌧️ It’s rainy — perfect for museums or cafes ☕";
  }

  if (temp > 30) {
    return "🔥 Very hot — try indoor places or beaches 🌊";
  }

  if (temp < 20) {
    return "🌤️ Cool weather — great for walking tours 🚶";
  }

  return "🌴 Perfect weather to explore outdoors!";
}