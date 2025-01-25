import config from './config.js';

const CONSTANTS = {
  API_KEY: config.apiKey,
  WIND_DIRECTIONS: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
  DEFAULT_VALUE: '--'
};

// DOM Elements
const elements = {
  locationInput: document.getElementById('location-input'),
  weatherDescription: document.getElementById('current-weather-description'),
  primaryTemp: document.getElementsByClassName('temperature-primary')[0],
  secondaryTemp: document.getElementsByClassName('temperature-secondary')[0],
  windDetails: document.getElementById('wind-speed-direction'),
  humidity: document.getElementById('humidity-percentage'),
  pressure: document.getElementById('pressure-value'),
  weatherData: document.getElementsByClassName('weather-data'),
  toggleButtons: Array.from(document.getElementsByClassName('toggle-btn'))
};

class WeatherService {
  static async fetchWeather(location, units) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${CONSTANTS.API_KEY}`
      );

      if (!response.ok) {
        console.error('Weather request failed. ' + response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }
}

class WeatherData {
  static resetData() {
    Array.from(elements.weatherData).forEach(el => {
      el.textContent = CONSTANTS.DEFAULT_VALUE;
    });
  }

  static getActiveUnit() {
    const activeButton = elements.toggleButtons.find(btn =>
      btn.classList.contains('active-toggle')
    );
    return activeButton?.value;
  }

  static convertTemperature(temp, fromMetric) {
    return fromMetric ? (temp * 9) / 5 + 32 : ((temp - 32) * 5) / 9;
  }

  static getWindDirection(degrees) {
    const index = Math.round(degrees / 45) % 8;
    return CONSTANTS.WIND_DIRECTIONS[index];
  }

  static updateDisplay(weatherData, units) {
    const {
      main: { temp, humidity, pressure },
      wind: { speed: windSpeed, deg: windDeg },
      weather: [{ icon, description }]
    } = weatherData;

    const isMetric = units === 'metric';
    const secondaryTemp = this.convertTemperature(temp, isMetric);
    const windSpeedUnit = isMetric ? 'm/s' : 'mi/hr';

    elements.weatherDescription.textContent = `, it's ${description}`;
    elements.primaryTemp.textContent = temp.toFixed(0);
    elements.secondaryTemp.textContent = secondaryTemp.toFixed(0);
    elements.windDetails.textContent = `${windSpeed} ${windSpeedUnit}, ${this.getWindDirection(windDeg)}`;
    elements.humidity.textContent = `${humidity} %`;
    elements.pressure.textContent = `${pressure} hPa`;

    weatherUI.weatherIcon.update(icon.endsWith('d'), icon);
    weatherUI.backgroundDisplay.update(icon.endsWith('d'), icon);
    weatherUI.pressureIndicator.update(pressure);
  }
}

async function handleWeatherUpdate(location) {
  if (!location?.trim()) {
    WeatherData.resetData();
    return;
  }

  const units = WeatherData.getActiveUnit();
  if (!units) {
    console.error('No active unit toggle detected');
    WeatherData.resetData();
    return;
  }

  try {
    const weatherData = await WeatherService.fetchWeather(
      location.trim(),
      units
    );
    WeatherData.updateDisplay(weatherData, units);
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    WeatherData.resetData();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  weatherUI.init();
  elements.toggleButtons.forEach(btn => {
    btn.addEventListener('click', () =>
      handleWeatherUpdate(elements.locationInput.value)
    );
  });

  elements.locationInput.addEventListener('keydown', async event => {
    if (event.key === 'Enter') {
      await handleWeatherUpdate(event.target.value);
    }
  });
});
