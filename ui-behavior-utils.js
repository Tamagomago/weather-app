// Helpers for styling and animations
const WEATHER_ICONS = {
  DAY: new Map([
    ['01d', 'clear-day'],
    ['02d', 'partly-cloudy-day'],
    ['03d', 'cloudy'],
    ['04d', 'overcast-day'],
    ['09d', 'partly-cloudy-day-rain'],
    ['10d', 'rain'],
    ['11d', 'thunderstorms-day'],
    ['13d', 'snow'],
    ['50d', 'mist']
  ]),
  NIGHT: new Map([
    ['01n', 'clear-night'],
    ['02n', 'partly-cloudy-night'],
    ['03n', 'cloudy'],
    ['04n', 'overcast-night'],
    ['09d', 'partly-cloudy-night-rain'],
    ['10d', 'rain'],
    ['11d', 'thunderstorms-night'],
    ['13d', 'snow'],
    ['50d', 'mist']
  ])
};

const BACKGROUND_TYPES = {
  DAY: new Map([
    ['01d', 'clear-day'],
    ['02d', 'cloudy-day'],
    ['03d', 'cloudy-day'],
    ['04d', 'cloudy-day'],
    ['09d', 'rain-day'],
    ['10d', 'rain-day'],
    ['11d', 'thunderstorms-day'],
    ['13d', 'snow-day'],
    ['50d', 'mist']
  ]),
  NIGHT: new Map([
    ['01n', 'clear-night'],
    ['02n', 'cloudy-night'],
    ['03n', 'cloudy-night'],
    ['04n', 'cloudy-night'],
    ['09d', 'rain-night'],
    ['10d', 'rain-night'],
    ['11d', 'thunderstorms-night'],
    ['13d', 'snow-night'],
    ['50d', 'mist']
  ])
};

const CONFIG = {
  HIGH_PRESSURE_THRESHOLD: 1020,
  INPUT_RESIZE_DELAY: 50,
  FONT_CHAR_OFFSET: 2,
  ICON_BASE_PATH: 'assets/weather-icons/production/fill/svg',
  BACKGROUND_BASE_PATH: 'assets/background'
};

class WeatherIcon {
  constructor(svgElement) {
    this.svgElement = svgElement;
  }

  update(isDayTime, iconId) {
    const iconSet = isDayTime ? WEATHER_ICONS.DAY : WEATHER_ICONS.NIGHT;
    const iconName = iconSet.get(iconId);

    if (!iconName) {
      console.error(`Unknown weather icon ID: ${iconId}`);
      return;
    }

    this.svgElement.src = `${CONFIG.ICON_BASE_PATH}/${iconName}.svg`;
    this.svgElement.alt = iconName;
  }
}

class PressureIndicator {
  constructor(iconElements) {
    this.icons = Array.from(iconElements);
  }

  update(pressure) {
    const isPressureHigh = pressure >= CONFIG.HIGH_PRESSURE_THRESHOLD;
    const activeIconId = isPressureHigh ? 'high' : 'low';

    this.icons.forEach(icon => {
      icon.classList.toggle(
        'active-pressure-icon',
        icon.id === `${activeIconId}-pressure-icon`
      );
    });
  }
}

class BackgroundDisplay {
  constructor(backgroundElement) {
    this.backgroundElement = backgroundElement;
  }

  update(isDayTime, iconId) {
    const overlay = document.querySelector('.video-overlay');
    overlay.classList.add('active');
    const backgroundSet = isDayTime
      ? BACKGROUND_TYPES.DAY
      : BACKGROUND_TYPES.NIGHT;
    const backgroundName = backgroundSet.get(iconId);
    if (!backgroundName) {
      console.error(`Unknown weather icon ID: ${iconId}`);
    }
    setTimeout(() => {
      this.backgroundElement.classList.add('hidden');
      setTimeout(() => {
        this.backgroundElement.src = `${CONFIG.BACKGROUND_BASE_PATH}/${backgroundName}.MP4`;
        this.backgroundElement.alt = backgroundName;
        this.backgroundElement.load();
        this.backgroundElement.onloadeddata = () => {
          this.backgroundElement.classList.remove('hidden');
        };
      }, 150);
    }, 150);
  }
}

class LocationInput {
  constructor(inputElement) {
    this.input = inputElement;
    this.resizeTimeout = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener('input', e => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        const length = e.target.value.length;
        const width = length > 0 ? length + CONFIG.FONT_CHAR_OFFSET : 1;
        e.target.style.width = `${width}ch`;
      }, CONFIG.INPUT_RESIZE_DELAY);
    });
  }
}

class ToggleButtons {
  constructor(buttonElements) {
    this.buttons = Array.from(buttonElements);
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.buttons.forEach(btn => btn.classList.toggle('active-toggle'));
      });
    });
  }
}

const weatherUI = {
  init() {
    this.weatherIcon = new WeatherIcon(
      document.getElementById('weather-icon-svg')
    );

    this.pressureIndicator = new PressureIndicator(
      document.querySelectorAll('.pressure > svg')
    );

    this.locationInput = new LocationInput(
      document.getElementById('location-input')
    );

    this.toggleButtons = new ToggleButtons(
      document.getElementsByClassName('toggle-btn')
    );

    this.backgroundDisplay = new BackgroundDisplay(
      document.querySelector('.video-background video')
    );
  }
};
