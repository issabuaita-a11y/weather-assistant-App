import { WeatherData, HourlyForecast } from '../types/weather';
import { WeatherSuggestion, SuggestionPriority } from '../types/suggestions';
import { WeatherFeatures } from '../types';

/**
 * Generate smart weather suggestions based on weather data and user preferences
 * Returns max 3 suggestions, prioritized by importance (high → medium → low)
 */
export function generateWeatherSuggestions(
  weather: WeatherData,
  userPreferences: WeatherFeatures
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];

  // HIGH PRIORITY SUGGESTIONS

  // Precipitation (if user enabled)
  if (userPreferences.precipitation) {
    if (weather.precipitation > 80) {
      suggestions.push({
        text: 'Heavy rain expected - bring umbrella and waterproof gear',
        icon: '☂️',
        priority: 'high',
      });
    } else if (weather.precipitation > 60) {
      suggestions.push({
        text: 'Bring an umbrella',
        icon: '☂️',
        priority: 'high',
      });
    } else if (weather.precipitation > 20) {
      suggestions.push({
        text: 'Chance of rain - consider an umbrella',
        icon: '🌂',
        priority: 'high',
      });
    }
  }

  // Air Quality (if user enabled)
  if (userPreferences.airQuality && weather.airQuality !== undefined) {
    if (weather.airQuality > 150) {
      suggestions.push({
        text: 'Unhealthy air - limit outdoor exposure',
        icon: '😷',
        priority: 'high',
      });
    } else if (weather.airQuality > 100) {
      suggestions.push({
        text: 'Poor air quality - consider wearing a mask',
        icon: '😷',
        priority: 'high',
      });
    }
  }

  // UV Index (if user enabled)
  if (userPreferences.uvIndex && weather.uv !== undefined) {
    if (weather.uv > 8) {
      suggestions.push({
        text: 'Wear sunscreen and sunglasses',
        icon: '😎',
        priority: 'high',
      });
    } else if (weather.uv > 6) {
      suggestions.push({
        text: 'Wear sunscreen (SPF 30+)',
        icon: '☀️',
        priority: 'high',
      });
    }
  }

  // Visibility (if user enabled)
  if (userPreferences.visibility && weather.visibility !== undefined) {
    if (weather.visibility < 1) {
      suggestions.push({
        text: 'Low visibility - drive carefully',
        icon: '🚗',
        priority: 'high',
      });
    } else if (weather.visibility < 5) {
      suggestions.push({
        text: 'Reduced visibility - allow extra travel time',
        icon: '🚗',
        priority: 'high',
      });
    }
  }

  // MEDIUM PRIORITY SUGGESTIONS

  // Temperature
  if (weather.temp < 50) {
    suggestions.push({
      text: 'Wear a warm coat',
      icon: '🧥',
      priority: 'medium',
    });
  }

  if (weather.temp > 85) {
    suggestions.push({
      text: 'Stay hydrated',
      icon: '💧',
      priority: 'medium',
    });
  }

  // Feels Like (if user enabled)
  if (userPreferences.feelsLike && weather.feelsLike !== undefined && weather.temp !== undefined) {
    const feelsLikeDiff = weather.feelsLike - weather.temp;
    if (feelsLikeDiff < -10) {
      suggestions.push({
        text: 'Wind chill makes it feel colder - dress warmer',
        icon: '🧥',
        priority: 'medium',
      });
    } else if (feelsLikeDiff > 10) {
      suggestions.push({
        text: 'Humidity makes it feel hotter - stay hydrated',
        icon: '💧',
        priority: 'medium',
      });
    }
  }

  // LOW PRIORITY SUGGESTIONS

  // Wind (if user enabled)
  if (userPreferences.windSpeed && weather.wind !== undefined) {
    if (weather.wind > 20) {
      suggestions.push({
        text: 'Secure loose items',
        icon: '💨',
        priority: 'low',
      });
    }
  }

  // Humidity
  if (weather.humidity && weather.humidity > 80) {
    suggestions.push({
      text: 'Expect muggy conditions',
      icon: '🌫️',
      priority: 'low',
    });
  }

  // Sort by priority (high → medium → low) and return max 3
  const priorityOrder: Record<SuggestionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions.slice(0, 3);
}

/**
 * Generate enhanced suggestions based on hourly forecast data
 * Provides contextual tips based on weather changes leading up to the event
 */
export function generateEnhancedSuggestions(
  eventWeather: WeatherData,
  hourlyForecast: HourlyForecast[],
  eventStartTime: Date,
  userPreferences: WeatherFeatures
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];
  const now = new Date();

  if (hourlyForecast.length === 0) {
    // Fallback to basic suggestions if no hourly data
    return generateWeatherSuggestions(eventWeather, userPreferences);
  }

  // Find when rain starts (if it does) - only if user enabled precipitation
  if (userPreferences.precipitation) {
    const rainStart = hourlyForecast.find(h => h.precipitation > 20);
    if (rainStart) {
      const rainTime = new Date(rainStart.time);
      const hoursUntilRain = Math.round((rainTime.getTime() - now.getTime()) / (60 * 60 * 1000));
      
      if (hoursUntilRain > 0 && hoursUntilRain <= 2) {
        if (rainStart.precipitation > 80) {
          suggestions.push({
            text: `Heavy rain starts ${hoursUntilRain === 1 ? '1 hour' : `${hoursUntilRain} hours`} before - bring umbrella and waterproof gear`,
            icon: '☂️',
            priority: 'high',
          });
        } else if (rainStart.precipitation > 60) {
          suggestions.push({
            text: `Rain starts ${hoursUntilRain === 1 ? '1 hour' : `${hoursUntilRain} hours`} before - leave early with umbrella`,
            icon: '☂️',
            priority: 'high',
          });
        } else {
          suggestions.push({
            text: `Chance of rain ${hoursUntilRain === 1 ? '1 hour' : `${hoursUntilRain} hours`} before - consider an umbrella`,
            icon: '🌂',
            priority: 'high',
          });
        }
      } else if (eventWeather.precipitation > 50) {
        suggestions.push({
          text: 'Bring an umbrella',
          icon: '☂️',
          priority: 'high',
        });
      }
    }
  }

  // Check for temperature changes
  if (hourlyForecast.length >= 2) {
    const firstTemp = hourlyForecast[0].temp;
    const lastTemp = hourlyForecast[hourlyForecast.length - 1].temp;
    const tempChange = lastTemp - firstTemp;

    if (tempChange < -10) {
      suggestions.push({
        text: `Temperature drops ${Math.abs(tempChange)}° during event - bring a sweater`,
        icon: '🧥',
        priority: 'medium',
      });
    } else if (tempChange > 10) {
      suggestions.push({
        text: `Temperature rises ${tempChange}° during event - dress in layers`,
        icon: '👕',
        priority: 'medium',
      });
    }
  }

  // Check for UV peak during event (if user enabled)
  if (userPreferences.uvIndex) {
    const maxUV = Math.max(...hourlyForecast.map(h => h.uv || 0));
    if (maxUV > 8) {
      const uvPeak = hourlyForecast.find(h => h.uv === maxUV);
      if (uvPeak) {
        const peakTime = new Date(uvPeak.time);
        if (peakTime >= now && peakTime <= eventStart) {
          suggestions.push({
            text: 'UV peaks during your event - wear sunscreen and sunglasses',
            icon: '😎',
            priority: 'high',
          });
        }
      }
    } else if (maxUV > 6) {
      const uvPeak = hourlyForecast.find(h => h.uv === maxUV);
      if (uvPeak) {
        const peakTime = new Date(uvPeak.time);
        if (peakTime >= now && peakTime <= eventStart) {
          suggestions.push({
            text: 'UV peaks during your event - wear sunscreen (SPF 30+)',
            icon: '☀️',
            priority: 'high',
          });
        }
      }
    }
  }

  // Check air quality trends (if user enabled)
  if (userPreferences.airQuality) {
    const airQualityValues = hourlyForecast
      .map(h => h.airQuality)
      .filter((aq): aq is number => aq !== undefined);
    
    if (airQualityValues.length > 0) {
      const maxAQ = Math.max(...airQualityValues);
      if (maxAQ > 150) {
        suggestions.push({
          text: 'Unhealthy air quality during event - limit outdoor exposure',
          icon: '😷',
          priority: 'high',
        });
      } else if (maxAQ > 100) {
        suggestions.push({
          text: 'Poor air quality during event - consider wearing a mask',
          icon: '😷',
          priority: 'high',
        });
      }
    } else if (eventWeather.airQuality !== undefined) {
      if (eventWeather.airQuality > 150) {
        suggestions.push({
          text: 'Unhealthy air - limit outdoor exposure',
          icon: '😷',
          priority: 'high',
        });
      } else if (eventWeather.airQuality > 100) {
        suggestions.push({
          text: 'Poor air quality - consider wearing a mask',
          icon: '😷',
          priority: 'high',
        });
      }
    }
  }

  // Check visibility trends (if user enabled)
  if (userPreferences.visibility) {
    const visibilityValues = hourlyForecast
      .map(h => h.visibility)
      .filter((v): v is number => v !== undefined);
    
    if (visibilityValues.length > 0) {
      const minVisibility = Math.min(...visibilityValues);
      if (minVisibility < 1) {
        suggestions.push({
          text: 'Low visibility expected - drive carefully',
          icon: '🚗',
          priority: 'high',
        });
      } else if (minVisibility < 5) {
        suggestions.push({
          text: 'Reduced visibility expected - allow extra travel time',
          icon: '🚗',
          priority: 'high',
        });
      }
    } else if (eventWeather.visibility !== undefined) {
      if (eventWeather.visibility < 1) {
        suggestions.push({
          text: 'Low visibility - drive carefully',
          icon: '🚗',
          priority: 'high',
        });
      } else if (eventWeather.visibility < 5) {
        suggestions.push({
          text: 'Reduced visibility - allow extra travel time',
          icon: '🚗',
          priority: 'high',
        });
      }
    }
  }

  // Check feels like temperature (if user enabled)
  if (userPreferences.feelsLike && hourlyForecast.length > 0) {
    const eventFeelsLike = hourlyForecast[hourlyForecast.length - 1].feelsLike;
    const eventTemp = eventWeather.temp;
    
    if (eventFeelsLike !== undefined && eventTemp !== undefined) {
      const feelsLikeDiff = eventFeelsLike - eventTemp;
      if (feelsLikeDiff < -10) {
        suggestions.push({
          text: 'Wind chill makes it feel much colder - dress warmer',
          icon: '🧥',
          priority: 'medium',
        });
      } else if (feelsLikeDiff > 10) {
        suggestions.push({
          text: 'Humidity makes it feel much hotter - stay hydrated',
          icon: '💧',
          priority: 'medium',
        });
      }
    }
  }

  // Check current vs event temperature
  if (hourlyForecast.length > 0) {
    const currentTemp = hourlyForecast[0].temp;
    const eventTemp = eventWeather.temp;
    const tempDiff = Math.abs(eventTemp - currentTemp);

    if (tempDiff > 15) {
      if (eventTemp < currentTemp) {
        suggestions.push({
          text: `Much cooler at event time (${eventTemp}° vs ${currentTemp}°) - bring a jacket`,
          icon: '🧥',
          priority: 'medium',
        });
      } else {
        suggestions.push({
          text: `Much warmer at event time (${eventTemp}° vs ${currentTemp}°) - dress lighter`,
          icon: '👕',
          priority: 'medium',
        });
      }
    }
  }

  // Add basic suggestions if we don't have enough
  const basicSuggestions = generateWeatherSuggestions(eventWeather, userPreferences);
  for (const basic of basicSuggestions) {
    // Only add if not already covered by enhanced suggestions
    const alreadyCovered = suggestions.some(s => 
      s.text.toLowerCase().includes(basic.text.toLowerCase().split(' ')[0])
    );
    if (!alreadyCovered) {
      suggestions.push(basic);
    }
  }

  // Sort by priority and return max 3
  const priorityOrder: Record<SuggestionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return suggestions.slice(0, 3);
}
