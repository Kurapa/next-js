// src/lib/weather.ts

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  uvIndex: number;
  icon: string;
  location: string;
}

/**
 * Get current weather data using Open-Meteo API (free, no API key needed)
 */
export async function getCurrentWeather(
  latitude: number = 17.385, // Default: Hyderabad
  longitude: number = 78.4867
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    const current = data.current;

    // Map weather codes to conditions
    const weatherConditions: { [key: number]: { condition: string; icon: string } } = {
      0: { condition: 'Clear Sky', icon: '☀️' },
      1: { condition: 'Mainly Clear', icon: '🌤️' },
      2: { condition: 'Partly Cloudy', icon: '⛅' },
      3: { condition: 'Overcast', icon: '☁️' },
      45: { condition: 'Foggy', icon: '🌫️' },
      48: { condition: 'Foggy', icon: '🌫️' },
      51: { condition: 'Light Drizzle', icon: '🌦️' },
      53: { condition: 'Drizzle', icon: '🌦️' },
      55: { condition: 'Heavy Drizzle', icon: '🌧️' },
      61: { condition: 'Light Rain', icon: '🌧️' },
      63: { condition: 'Rain', icon: '🌧️' },
      65: { condition: 'Heavy Rain', icon: '⛈️' },
      71: { condition: 'Light Snow', icon: '🌨️' },
      73: { condition: 'Snow', icon: '❄️' },
      75: { condition: 'Heavy Snow', icon: '❄️' },
      77: { condition: 'Snow Grains', icon: '🌨️' },
      80: { condition: 'Light Showers', icon: '🌦️' },
      81: { condition: 'Showers', icon: '🌧️' },
      82: { condition: 'Heavy Showers', icon: '⛈️' },
      85: { condition: 'Light Snow Showers', icon: '🌨️' },
      86: { condition: 'Snow Showers', icon: '❄️' },
      95: { condition: 'Thunderstorm', icon: '⛈️' },
      96: { condition: 'Thunderstorm with Hail', icon: '⛈️' },
      99: { condition: 'Severe Thunderstorm', icon: '⛈️' },
    };

    const weatherCode = current.weather_code || 0;
    const weather = weatherConditions[weatherCode] || { condition: 'Unknown', icon: '🌤️' };

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weather.condition,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      rainChance: current.precipitation_probability || 0,
      uvIndex: Math.round(current.uv_index || 0),
      icon: weather.icon,
      location: 'Your Location',
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return fallback data
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      rainChance: 20,
      uvIndex: 6,
      icon: '⛅',
      location: 'Your Location',
    };
  }
}

/**
 * Get user's location and weather
 */
export async function getLocationWeather(): Promise<WeatherData> {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const weather = await getCurrentWeather(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(weather);
        },
        async () => {
          // If location permission denied, use default location
          const weather = await getCurrentWeather();
          resolve(weather);
        }
      );
    } else {
      // If geolocation not supported, use default location
      getCurrentWeather().then(resolve);
    }
  });
}