import React, { useState, useEffect } from 'react';
import { Clock, Search, MapPin, Calendar } from 'lucide-react';
import { DateTime } from 'luxon';
import logo from '/src/assets/logo1.png';

interface TimeZoneData {
  country: string;
  city: string;
  timezone: string;
  time: string;
  date: string;
  delhiTime: string;
  delhiDate: string;
  dayDifference: string;
}

const countries = [
  { name: 'New York', country: 'United States', timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { name: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { name: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { name: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
  { name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
  { name: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { name: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow' },
  { name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  { name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
  { name: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
  { name: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },
  { name: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City' },
  { name: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos' },
  { name: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(countries[0]);
  const [currentTime, setCurrentTime] = useState<TimeZoneData | null>(null);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedDateTime, setSelectedDateTime] = useState('');

  const getTimeAndDateForTimezone = (timezone: string, customDateTime?: Date) => {
    const targetDate = customDateTime || new Date();
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: isLiveMode ? '2-digit' : undefined,
      hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      time: timeFormatter.format(targetDate),
      date: dateFormatter.format(targetDate),
      dateObj: new Date(targetDate.toLocaleString('en-US', { timeZone: timezone }))
    };
  };

  const getDayDifference = (selectedDate: Date, delhiDate: Date) => {
    // Compare only the date part (year, month, day)
    const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const delhi = new Date(delhiDate.getFullYear(), delhiDate.getMonth(), delhiDate.getDate());
    const diffDays = Math.round((selected.getTime() - delhi.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return 'Same day';
    } else if (diffDays === 1) {
      return 'Tomorrow in selected location';
    } else if (diffDays === -1) {
      return 'Yesterday in selected location';
    } else if (diffDays > 1) {
      return `${diffDays} days ahead in selected location`;
    } else {
      return `${Math.abs(diffDays)} days behind in selected location`;
    }
  };

  const convertCustomTimeToGlobalTime = (customDateTime: string, fromTimezone: string) => {
    // Parse the custom date/time as if it's in the selected location's timezone
    const localDate = new Date(customDateTime);
    
    // Get the timezone offset for the selected location at this date
    const tempDate = new Date(localDate.toLocaleString('en-US', { timeZone: fromTimezone }));
    const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const timezoneOffset = tempDate.getTime() - utcDate.getTime();
    
    // Create a date that represents the same local time in the selected timezone
    const adjustedDate = new Date(localDate.getTime() - timezoneOffset);
    
    return adjustedDate;
  };

  const getISTFromCustomInputLuxon = (customInput: string, fromTimezone: string) => {
    // Parse the input as a time in the selected location's timezone
    const dt = DateTime.fromISO(customInput, { zone: fromTimezone });
    // Convert to IST
    const ist = dt.setZone('Asia/Kolkata');
    return ist;
  };

  const updateTime = () => {
    if (selectedLocation) {
      let targetDate: Date;
      
      if (isLiveMode) {
        // Live mode: use current time
        targetDate = new Date();
      } else if (selectedDateTime) {
        // Custom mode: treat the input as local time in the selected location
        targetDate = convertCustomTimeToGlobalTime(selectedDateTime, selectedLocation.timezone);
      } else {
        targetDate = new Date();
      }
      
      const selectedTimeData = getTimeAndDateForTimezone(selectedLocation.timezone, targetDate);
      const delhiTimeData = getTimeAndDateForTimezone('Asia/Kolkata', targetDate);
      
      const dayDifference = getDayDifference(selectedTimeData.dateObj, delhiTimeData.dateObj);
      
      setCurrentTime({
        country: selectedLocation.country,
        city: selectedLocation.name,
        timezone: selectedLocation.timezone,
        time: selectedTimeData.time,
        date: selectedTimeData.date,
        delhiTime: delhiTimeData.time,
        delhiDate: delhiTimeData.date,
        dayDifference: dayDifference
      });
    }
  };

  useEffect(() => {
    updateTime();
    if (isLiveMode) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedLocation, isLiveMode, selectedDateTime]);

  useEffect(() => {
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm]);

  const handleLocationSelect = (location: typeof countries[0]) => {
    setSelectedLocation(location);
    setSearchTerm('');
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateTime(e.target.value);
    setIsLiveMode(false);
  };

  const resetToLiveMode = () => {
    setIsLiveMode(true);
    setSelectedDateTime('');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="bg-black p-2 rounded-lg">
                <img src={logo} alt="Logo" className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Colan InfoTech</h1>
                <p className="text-blue-200 text-sm">World Clock & Time Converter</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-white mt-2 sm:mt-0">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">
                {isLiveMode ? 'Live Time Tracking' : 'Custom Date/Time'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column - Search and Controls */}
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              {/* Moved Date Time Picker here */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Select Date & Time
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={resetToLiveMode}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        isLiveMode 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      Live Mode
                    </button>
                    <button
                      onClick={() => setIsLiveMode(false)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        !isLiveMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      Custom Date/Time
                    </button>
                  </div>
                  {!isLiveMode && (
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Enter Date and Time for {selectedLocation.name}:
                      </label>
                      <input
                        type="datetime-local"
                        value={selectedDateTime || getCurrentDateTime()}
                        onChange={handleDateTimeChange}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                      <p className="text-white/70 text-xs mt-2">
                        Enter the local date and time for <span className="font-semibold">{selectedLocation.name}</span>, and it will be converted to Delhi time
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* End Date Time Picker */}
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Location
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a city or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-white/60" />
              </div>
              {searchTerm && (
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {filteredCountries.map((location, index) => {
                    // Get the current date and time for this location
                    const { time, date } = getTimeAndDateForTimezone(location.timezone, isLiveMode ? new Date() : selectedDateTime ? convertCustomTimeToGlobalTime(selectedDateTime, location.timezone) : new Date());
                    return (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg mb-2 transition-all duration-200 text-white border border-white/10 hover:border-white/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-300" />
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-white/70">{location.country}</div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xs text-blue-200 font-mono">{time}</div>
                            <div className="text-xs text-blue-300">{date}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Globe */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Globe Container */}
              <div className="relative w-full aspect-square max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin-slow"></div>
                
                {/* Main Globe */}
                <div className="absolute inset-4 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full shadow-2xl animate-pulse">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/50 to-emerald-600/50 rounded-full animate-spin-slower relative overflow-hidden">
                    {/* Continents representation */}
                    <div className="absolute top-8 left-12 w-8 h-6 bg-emerald-400/60 rounded-full"></div>
                    <div className="absolute top-16 right-8 w-12 h-8 bg-emerald-400/60 rounded-lg"></div>
                    <div className="absolute bottom-12 left-8 w-10 h-6 bg-emerald-400/60 rounded-full"></div>
                    <div className="absolute bottom-8 right-12 w-6 h-8 bg-emerald-400/60 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/4 w-14 h-10 bg-emerald-400/60 rounded-xl"></div>
                  </div>
                </div>

                {/* Inner Glow */}
                <div className="absolute inset-8 bg-gradient-to-br from-blue-300/20 to-emerald-300/20 rounded-full animate-ping"></div>
                
                {/* Time Zones Indicators */}
                <div className="absolute top-0 left-1/2 w-1 h-8 bg-yellow-400 transform -translate-x-0.5 animate-pulse"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-yellow-400 transform -translate-x-0.5 animate-pulse"></div>
                <div className="absolute top-1/2 left-0 w-8 h-1 bg-yellow-400 transform -translate-y-0.5 animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-8 h-1 bg-yellow-400 transform -translate-y-0.5 animate-pulse"></div>
              </div>

              {/* Globe Label */}
              <div className="text-center mt-6">
                <h3 className="text-xl font-semibold text-white mb-2">World Time Zones</h3>
                <p className="text-blue-200 text-sm">
                  {isLiveMode ? 'Real-time global clock synchronization' : 'Custom date/time conversion'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Time Display */}
          <div>
            {currentTime && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {isLiveMode ? 'Current Time & Date' : 'Selected Time & Date'}
                  </h2>
                  {!isLiveMode && (
                    <div className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/30">
                      <span className="text-orange-200 text-xs font-medium">CUSTOM TIME</span>
                    </div>
                  )}
                </div>
                
                {/* Selected Location Time */}
                <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl p-6 mb-6 border border-blue-400/30">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-blue-300 mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      {currentTime.city}, {currentTime.country}
                    </h3>
                    {!isLiveMode && (
                      <div className="ml-auto bg-blue-500/30 px-2 py-1 rounded text-xs text-blue-200">
                        INPUT TIME
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-white">
                      {isLiveMode
                        ? currentTime.time
                        : selectedDateTime
                          ? new Date(selectedDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                          : currentTime.time}
                    </p>
                    <div className="flex items-center text-blue-200">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-lg">
                        {isLiveMode
                          ? currentTime.date
                          : selectedDateTime
                            ? new Date(selectedDateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            : currentTime.date}
                      </span>
                    </div>
                    <p className="text-sm text-blue-300">Timezone: {currentTime.timezone}</p>
                  </div>
                  {/* Show custom input date/time below the main card if in custom mode */}
                  {!isLiveMode && selectedDateTime && (
                    <div className="mt-4 p-2 bg-blue-900/40 rounded text-blue-100 text-sm text-center border border-blue-400/20 font-bold">
                      Input Date & Time: {new Date(selectedDateTime).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

                {/* Delhi Time */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-6 border border-emerald-400/30">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-emerald-300 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Delhi, India (IST)</h3>
                    {!isLiveMode && (
                      <div className="ml-auto bg-emerald-500/30 px-2 py-1 rounded text-xs text-emerald-200">
                        CONVERTED TIME
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-white">
                      {isLiveMode
                        ? currentTime.delhiTime
                        : selectedDateTime
                          ? (() => {
                              const istDate = getISTFromCustomInputLuxon(selectedDateTime, selectedLocation.timezone);
                              return istDate.toLocaleString({ hour: '2-digit', minute: '2-digit', hour12: true });
                            })()
                          : currentTime.delhiTime}
                    </p>
                    <div className="flex items-center text-emerald-200">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-lg">
                        {isLiveMode
                          ? currentTime.delhiDate
                          : selectedDateTime
                            ? (() => {
                                const istDate = getISTFromCustomInputLuxon(selectedDateTime, selectedLocation.timezone);
                                return istDate.toLocaleString({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                              })()
                            : currentTime.delhiDate}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-300">Indian Standard Time (UTC+5:30)</p>
                  </div>
                </div>

                {/* Day Difference Indicator */}
                <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-yellow-200 text-sm font-medium">Date Comparison</p>
                      <p className="text-white font-semibold">{currentTime.dayDifference}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popular Cities - Small Square Buttons in One Line */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Popular Cities</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {countries.slice(0, 10).map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className={`w-24 h-10 bg-white/10 backdrop-blur-md rounded-md border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center justify-center text-center px-1 ${selectedLocation.name === location.name ? 'ring-2 ring-blue-400 bg-white/20' : ''}`}
              >
                <span className="text-white font-medium text-xs truncate w-full">{location.name}</span>
                <span className="text-white/70 text-[10px] truncate w-full">{location.country}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="w-full text-center py-1 text-sm text-gray-300 font-bold">
        Develop By MERN Team | Sponsor by Colan Infotech - Chennai
      </footer>
    </div>
  );
}

export default App;