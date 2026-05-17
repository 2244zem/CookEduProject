import React, { useState, useEffect } from 'react';
import { CloudSun, Search, Compass, AlertCircle, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherCardProps {
  temperature: number;
  weatherCondition: string;
  userAddress: string;
  onWeatherUpdate: (temp: number, condition: string, resolvedAddress: string) => void;
}

export default function WeatherCard({
  temperature,
  weatherCondition,
  userAddress,
  onWeatherUpdate
}: WeatherCardProps) {
  const [addressInput, setAddressInput] = useState(userAddress);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("cookedu_owm_key") || "");
  const [errorMsg, setErrorMsg] = useState("");

  // Save key to localStorage
  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("cookedu_owm_key", key);
  };

  const fetchWeather = async (targetAddress: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // If there is no API key or it's default, we simulate a premium live response
      if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_OPENWEATHER_API_KEY") {
        setTimeout(() => {
          // Generate realistic temperature based on string hash or random
          const isCold = targetAddress.toLowerCase().includes("london") || targetAddress.toLowerCase().includes("tokyo");
          const isHot = targetAddress.toLowerCase().includes("jakarta") || targetAddress.toLowerCase().includes("surabaya") || targetAddress.toLowerCase().includes("bali");
          
          let temp = 74; // default
          let cond = "Partly Cloudy";
          
          if (isCold) {
            temp = 48;
            cond = "Chilly Mist";
          } else if (isHot) {
            temp = 89;
            cond = "Sunny Refreshing";
          } else {
            // Pseudo-random based on address length
            temp = 55 + (targetAddress.length % 40);
            const conditions = ["Partly Cloudy", "Light Rain", "Clear Sky", "Overcast", "Windy Rain"];
            cond = conditions[targetAddress.length % conditions.length];
          }

          onWeatherUpdate(temp, cond, targetAddress);
          setLoading(false);
        }, 800);
        return;
      }

      // 1. Geocoding API: Text to Coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(targetAddress)}&limit=1&appid=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Gagal melakukan geocoding lokasi.");
      
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) {
        setErrorMsg("Lokasi tidak ditemukan. Menggunakan cuaca default.");
        setLoading(false);
        return;
      }

      const { lat, lon, name, country } = geoData[0];
      const displayName = country ? `${name}, ${country}` : name;

      // 2. Weather API: Get Weather in Imperial unit (Fahrenheit)
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error("Gagal mengambil data cuaca.");

      const weatherData = await weatherRes.json();
      const currentTemp = Math.round(weatherData.main.temp);
      const condition = weatherData.weather[0].main;

      onWeatherUpdate(currentTemp, condition, displayName);
    } catch (err: any) {
      console.error("Weather fetch error:", err);
      setErrorMsg("Koneksi gagal / API Key salah. Menjalankan simulasi pintar.");
      
      // Smart fallback simulation
      const temp = 72;
      const cond = "Cloudy Fallback";
      onWeatherUpdate(temp, cond, targetAddress);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch on Mount or API Key Change
  useEffect(() => {
    fetchWeather(userAddress);
  }, [apiKey]);

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      fetchWeather(addressInput);
    }
  };

  // Appetite gradient based on Fahrenheit temperature
  const getAppetiteGradient = (temp: number) => {
    if (temp <= 65) {
      return "from-slate-800 via-indigo-900 to-teal-800";
    }
    if (temp >= 85) {
      return "from-sky-500 via-teal-400 to-emerald-600";
    }
    return "from-sky-600 via-sky-700 to-teal-650";
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getAppetiteGradient(temperature)} text-white rounded-3xl p-6 shadow-xl border border-white/20 backdrop-blur-md transition-all duration-700`}>
      {/* Background ambient bubble */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* API Key configuration drawer/bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-white/70 shrink-0" />
            <span className="text-[11px] font-semibold text-white/80">Live Forecast Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="Masukkan API Key OpenWeather..."
              className="bg-black/20 border-none rounded-lg px-2.5 py-1 text-[10px] text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 w-44"
              title="API Key disimpan secara lokal di browser Anda."
            />
          </div>
        </div>

        {/* Main Weather details */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <form onSubmit={handleSubmitAddress} className="flex items-center gap-2 bg-black/10 rounded-xl px-3 py-1.5 border border-white/10 w-fit focus-within:ring-1 focus-within:ring-white/30">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onBlur={() => addressInput.trim() && fetchWeather(addressInput)}
                className="bg-transparent border-none text-xs font-bold text-white placeholder-white/50 focus:outline-none w-36"
                placeholder="Ubah lokasi..."
              />
              <button type="submit" disabled={loading}>
                <Search className={`w-3.5 h-3.5 text-white/70 hover:text-white transition-colors ${loading ? 'animate-pulse' : ''}`} />
              </button>
            </form>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">{temperature}</span>
              <span className="text-2xl font-semibold">°F</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                Feels like {weatherCondition}
              </span>
              {loading && <span className="text-[10px] text-white/80 animate-pulse">Memperbarui...</span>}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1 text-[10px] text-white/85">
                <AlertCircle className="w-3 h-3 text-white/90" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right section: visual illustrations */}
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md self-stretch md:self-auto justify-center md:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse" />
              <CloudSun className="w-14 h-14 text-white relative animate-bounce" style={{ animationDuration: '4s' }} />
            </div>
            <div className="text-left space-y-1">
              <p className="text-xs font-bold text-white leading-tight max-w-[200px]">
                Suhu ideal untuk hidangan dengan kecocokan Fahrenheit!
              </p>
              <div className="flex gap-3 text-[10px] text-white/80 font-medium">
                <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> Live Sync</span>
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> Fahrenheit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
