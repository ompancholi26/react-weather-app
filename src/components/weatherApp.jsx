import { useEffect, useState, useRef } from "react";
import axios from "axios";
import cloudy from "../assets/images/cloudy.png";
import loading from "../assets/images/loading.gif";
import rainy from "../assets/images/rainy.png";
import snowy from "../assets/images/snowy.png";
import sunny from "../assets/images/sunny.png";
import { API_KEY } from "../assets/apikey";
import './weatherApp.css'
import { IconMapPinFilled, IconSearch, IconDroplet, IconWind, IconGauge, IconEye, IconTemperature, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";

const weatherImages = {
    Clear: sunny,
    Clouds: cloudy,
    Rain: rainy,
    Snow: snowy,
    Haze: cloudy,
    Mist: cloudy,
};

const backgroundImages = {
    Clear: "linear-gradient(to right,f3b07c,fcd283)",
    Clouds: "linear-gradient(to right,#57d6d4, #f71eec)",
    Rain: "linear-gradient(to right, #5bc8fb, #80eaff)",
    Snow: "linear-gradient(to right, #aff2ff, #fff)",
    Haze: "linear-gradient(to right, #57d6d4, #71eeec)",
    Mist: "linear-gradient(to right, #57d6d4, #71eeec)",
};

const WeatherApp = function () {
    const [city, setCity] = useState("New delhi");
    const [inputValue, setInputValue] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [loadingState, setLoadingState] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimer = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        fetchResult();
    }, [city]);

    const fetchResult = async () => {
        setLoadingState(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, {
                params: { q: city, appid: API_KEY, units: "metric" },
            });
            setWeatherData(response.data);
            console.log("Response:", response.data);
        } catch (err) {
            console.error("API error:", err.response?.status, err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
            setWeatherData(null);
        } finally {
            setLoadingState(false);
        }
    };

    const fetchCitySuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(GEO_API_URL, {
                params: {
                    q: query,
                    limit: 5,
                    appid: API_KEY,
                },
            });
            setSuggestions(response.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Geocoding error:", err);
            setSuggestions([]);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for debounced API call
        debounceTimer.current = setTimeout(() => {
            if (value.trim() !== "") {
                fetchCitySuggestions(value);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300); // Wait 300ms after user stops typing
    };

    const handleSuggestionClick = (suggestion) => {
        const cityName = `${suggestion.name}${suggestion.state ? ', ' + suggestion.state : ''}, ${suggestion.country}`;
        setCity(suggestion.name);
        setInputValue(cityName);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearchClick = () => {
        if (inputValue.trim() !== "") {
            setCity(inputValue);
            setShowSuggestions(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const weatherznames = weatherData?.weather?.[0]?.main;

    const backgroundImage = backgroundImages[weatherznames] || backgroundImages["Clear"];


    return (
        <div className="container" style={{ backgroundImage }}>
            <div className="Weather-App" style={{
                backgroundImage: backgroundImage?.replace("to right", "to top") || "",
            }}>
                {/* Search Section */}
                <div className="search-section">
                    <div className="location-info">
                        <IconMapPinFilled />
                        {weatherData?.name && <span>{weatherData.name}, {weatherData.sys?.country}</span>}
                    </div>
                    
                    <div className="search-bar" ref={suggestionsRef}>
                        <input 
                            type="text"
                            placeholder="Search for a city..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                        <IconSearch className="search-icon" onClick={handleSearchClick} />
                        
                        {/* City Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <IconMapPinFilled size={16} />
                                        <div className="suggestion-text">
                                            <span className="suggestion-name">{suggestion.name}</span>
                                            {suggestion.state && <span className="suggestion-state">, {suggestion.state}</span>}
                                            <span className="suggestion-country"> - {suggestion.country}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loadingState && (
                    <div className="loading-container">
                        <img src={loading} alt="loading" className="loading-gif" />
                        <p className="loading-text">Fetching weather...</p>
                    </div>
                )}
                
                {/* Error State */}
                {error && <p className="error">Error: {error}</p>}
                
                {/* Weather Content */}
                {weatherData && !loadingState && (
                    <div className="weather-content">
                        {/* Main Weather Display */}
                        <div className="main-weather">
                            <img 
                                src={weatherImages[weatherznames] || weatherImages["Clear"]} 
                                alt="weather" 
                                className="weather-image" 
                            />
                            <div className="temperature-display">
                                <h1 className="temperature">{Math.round(weatherData.main?.temp)}°C</h1>
                                <p className="weather-description">{weatherData.weather?.[0]?.description}</p>
                                <p className="weather-condition">{weatherData.weather?.[0]?.main}</p>
                            </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="weather-details-grid">
                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconTemperature size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{Math.round(weatherData.main?.feels_like)}°C</p>
                                    <p className="detail-label">Feels Like</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconDroplet size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{weatherData.main?.humidity}%</p>
                                    <p className="detail-label">Humidity</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconWind size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{Math.round(weatherData.wind?.speed * 3.6)} km/h</p>
                                    <p className="detail-label">Wind Speed</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconGauge size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{weatherData.main?.pressure} hPa</p>
                                    <p className="detail-label">Pressure</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconEye size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                                    <p className="detail-label">Visibility</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="detail-icon">
                                    <IconArrowUp size={24} />
                                </div>
                                <div className="detail-info">
                                    <p className="detail-value">{Math.round(weatherData.main?.temp_max)}°C</p>
                                    <p className="detail-label">Max Temp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default WeatherApp;