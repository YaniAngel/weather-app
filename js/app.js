document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Add your own API key here
    const searchBtn = document.getElementById("search-btn"); // Button to trigger search
    const cityInput = document.getElementById("city-input"); // Input field for city name
    const citySuggestions = document.getElementById("city-suggestions"); // Datalist for city suggestions
    const weatherResult = document.getElementById("weather-result"); // Div to display weather info
    const unitToggle = document.getElementById("unit-toggle"); // Toggle switch for temperature unit

    let currentWeatherData = null; // Store fetched weather data

    /**
     * Fetches weather data for the given city.
     * @param {string} city - The city name (e.g., "New York, US").
     */
    async function getWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            if (!response.ok) throw new Error("City not found"); // Handle invalid city names

            currentWeatherData = await response.json(); // Store data globally
            displayWeather(currentWeatherData);
        } catch (error) {
            weatherResult.innerHTML = `<p style="color: red;">${error.message}</p>`; // Show error message
        }
    }

    /**
     * Converts temperature between Celsius and Fahrenheit.
     * @param {number} temp - Temperature in Celsius.
     * @returns {number} - Converted temperature.
     */
    function convertTemperature(temp) {
        return unitToggle.checked ? temp : (temp * 9/5) + 32;
    }

    /**
     * Updates the weather display based on the current unit selection.
     * Uses stored weather data to avoid unnecessary API calls.
     */
    function updateTemperatureDisplay() {
        if (!currentWeatherData) return; // Don't update if no data is available
        displayWeather(currentWeatherData);
    }

    /**
     * Displays weather details in the UI.
     * @param {Object} data - Weather API response object.
     */
    function displayWeather(data) {
        const { name, main, weather } = data;
        const temperature = convertTemperature(main.temp);
        const unitSymbol = unitToggle.checked ? "°C" : "°F";

        weatherResult.innerHTML = `
            <h2>${name}</h2>
            <p>Temperature: ${temperature.toFixed(1)}${unitSymbol}</p>
            <p>Weather: ${weather[0].description}</p>
        `;
    }

    /**
     * Fetches city suggestions based on user input.
     * Uses OpenWeatherMap's Geocoding API to provide city name and country.
     * @param {string} query - The user's input (e.g., "New Yo").
     */
    async function fetchCitySuggestions(query) {
        if (query.length < 2) return; // Only fetch if input length > 1
        
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

        try {
            const response = await fetch(url);
            const cities = await response.json();
            
            citySuggestions.innerHTML = ""; // Clear previous suggestions
            
            cities.forEach(city => {
                let option = document.createElement("option");
                option.value = `${city.name}, ${city.country}`; // Format: "City, Country"
                citySuggestions.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching city suggestions:", error);
        }
    }

    /**
     * Event Listener: Fetch city suggestions as user types.
     */
    cityInput.addEventListener("input", () => {
        fetchCitySuggestions(cityInput.value);
    });

    /**
     * Event Listener: Get weather when user clicks the search button.
     */
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    });

    /**
     * Event Listener: Update temperature display when unit toggle is switched.
     */
    unitToggle.addEventListener("change", updateTemperatureDisplay);
});
