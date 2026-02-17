import { useEffect, useState } from "react";
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
    const [weatherData, setWeatherData] = useState(null);
    const [loadingState, setLoadingState] = useState(false);
    const [error, setError] = useState(null);

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

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.trim() !== "") {
            setCity(value);
        }
    };
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
                    
                    <div className="search-bar">
                        <input 
                            type="text"
                            placeholder="Search for a city..."
                            onChange={handleInputChange}
                        />
                        <IconSearch className="search-icon" />
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