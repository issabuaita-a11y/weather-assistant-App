import { WeatherData, HourlyForecast } from '../types/weather';
import { WeatherSuggestion, SuggestionPriority } from '../types/suggestions';
import { WeatherFeatures } from '../types';

/**
 * Calculate wind chill (feels like temperature with wind)
 * Uses the standard wind chill formula for temperatures below 50°F
 */
function calculateWindChill(temp: number, windSpeed: number): number {
  if (temp > 50 || windSpeed < 3) return temp;
  // Wind chill formula: 35.74 + 0.6215*T - 35.75*V^0.16 + 0.4275*T*V^0.16
  const windChill = 35.74 + 0.6215 * temp - 35.75 * Math.pow(windSpeed, 0.16) + 0.4275 * temp * Math.pow(windSpeed, 0.16);
  return Math.round(windChill);
}

/**
 * Calculate heat index (feels like temperature with humidity)
 * Uses the standard heat index formula for temperatures above 80°F
 */
function calculateHeatIndex(temp: number, humidity: number): number {
  if (temp < 80 || humidity < 40) return temp;
  // Simplified heat index formula
  const hi = -42.379 + 2.04901523 * temp + 10.14333127 * humidity - 0.22475541 * temp * humidity
    - 6.83783e-3 * temp * temp - 5.481717e-2 * humidity * humidity
    + 1.22874e-3 * temp * temp * humidity + 8.5282e-4 * temp * humidity * humidity
    - 1.99e-6 * temp * temp * humidity * humidity;
  return Math.round(hi);
}

/**
 * Detect weather condition type
 */
function getConditionType(condition: string): 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'other' {
  const lower = condition.toLowerCase();
  if (lower.includes('clear') || lower.includes('sunny')) return 'clear';
  if (lower.includes('partly') || lower.includes('partially')) return 'partly-cloudy';
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return 'rain';
  if (lower.includes('snow') || lower.includes('sleet') || lower.includes('flurry')) return 'snow';
  if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('fog')) return 'cloudy';
  return 'other';
}

/**
 * Get weather at a specific time from hourly forecast
 */
function getWeatherAtTime(hourlyForecast: HourlyForecast[], targetTime: Date): HourlyForecast | null {
  if (hourlyForecast.length === 0) return null;
  
  // Find closest hour
  let closest = hourlyForecast[0];
  let minDiff = Math.abs(new Date(closest.time).getTime() - targetTime.getTime());
  
  for (const hour of hourlyForecast) {
    const diff = Math.abs(new Date(hour.time).getTime() - targetTime.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = hour;
    }
  }
  
  return closest;
}

/**
 * Calculate event duration in hours
 */
function getEventDuration(startTime: Date, endTime: Date): number {
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
}

/**
 * Generate contextual, intelligent weather suggestions
 * Focuses on weather condition nuances and practical "just in case" advice
 */
export function generateEnhancedSuggestions(
  eventWeather: WeatherData,
  hourlyForecast: HourlyForecast[],
  eventStartTime: Date,
  eventEndTime: Date,
  eventTitle: string,
  userPreferences: WeatherFeatures
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];
  const now = new Date();

  if (hourlyForecast.length === 0) {
    return generateBasicSuggestions(eventWeather, userPreferences);
  }

  const eventTemp = eventWeather.temp;
  const eventWind = eventWeather.wind || 0;
  const eventHumidity = eventWeather.humidity || 0;
  const eventUV = eventWeather.uv || 0;
  const eventPrecip = eventWeather.precipitation || 0;
  const conditionType = getConditionType(eventWeather.condition);
  const eventDuration = getEventDuration(eventStartTime, eventEndTime);

  // Calculate departure time (1-2 hours before event)
  const hoursUntilEvent = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const departureHoursBefore = hoursUntilEvent >= 2 ? 1.5 : 1;
  const departureTime = new Date(eventStartTime.getTime() - departureHoursBefore * 60 * 60 * 1000);
  const departureWeather = getWeatherAtTime(hourlyForecast, departureTime);

  // Calculate temp range during event
  const eventTemps = hourlyForecast
    .filter(h => {
      const hTime = new Date(h.time);
      return hTime >= eventStartTime && hTime <= eventEndTime;
    })
    .map(h => h.temp);
  const tempRange = eventTemps.length > 0 
    ? Math.max(...eventTemps) - Math.min(...eventTemps)
    : 0;

  // PRIORITY 1: SAFETY WARNINGS

  // Wind Chill (Wind + Cold)
  if (userPreferences.windSpeed && userPreferences.feelsLike && eventTemp < 50 && eventWind > 15) {
    const windChill = calculateWindChill(eventTemp, eventWind);
    const feelsLike = eventWeather.feelsLike || windChill;
    
    if (feelsLike < 0) {
      suggestions.push({
        text: `Dangerous wind chill - feels like ${feelsLike}°F (cover all exposed skin)`,
        icon: '⚠️',
        priority: 'high',
      });
    } else if (feelsLike < 15) {
      suggestions.push({
        text: `Severe wind chill - feels like ${feelsLike}°F (limit time outside)`,
        icon: '🥶',
        priority: 'high',
      });
    } else if (feelsLike < 25) {
      suggestions.push({
        text: `Wind chill makes it feel like ${feelsLike}°F - bundle up`,
        icon: '🧥',
        priority: 'high',
      });
    }
  }

  // Dangerous Wind
  if (userPreferences.windSpeed && eventWind > 45) {
    suggestions.push({
      text: `DANGEROUS WINDS (${eventWind} mph) - avoid outdoor activities if possible`,
      icon: '⚠️',
      priority: 'high',
    });
  }

  // Extreme Temperatures
  if (eventTemp < 0) {
    suggestions.push({
      text: `Dangerous cold (${eventTemp}°F) - frostbite possible in minutes`,
      icon: '🥶',
      priority: 'high',
    });
  } else if (eventTemp > 95) {
    suggestions.push({
      text: `Dangerous heat (${eventTemp}°F) - limit outdoor activities`,
      icon: '🌡️',
      priority: 'high',
    });
  }

  // Heat Index
  if (eventTemp > 80 && eventHumidity > 70) {
    const heatIndex = calculateHeatIndex(eventTemp, eventHumidity);
    if (heatIndex > 90) {
      suggestions.push({
        text: `Feels like ${heatIndex}°F due to humidity - stay hydrated`,
        icon: '💧',
        priority: 'high',
      });
    }
  }

  // PRIORITY 2: PRECIPITATION PREP ("JUST IN CASE" TIPS)

  if (userPreferences.precipitation) {
    // Very High Chance (60%+)
    if (eventPrecip > 60) {
      suggestions.push({
        text: `Rain very likely (${eventPrecip}%) - full rain gear (umbrella, jacket, boots)`,
        icon: '☔',
        priority: 'high',
      });
    }
    // High Chance (40-60%)
    else if (eventPrecip > 40) {
      suggestions.push({
        text: `Likely to rain (${eventPrecip}%) - umbrella and waterproof jacket`,
        icon: '☔',
        priority: 'high',
      });
    }
    // Moderate Chance (20-40%)
    else if (eventPrecip > 20) {
      suggestions.push({
        text: `Rain possible (${eventPrecip}%) - definitely bring an umbrella`,
        icon: '🌂',
        priority: 'medium',
      });
    }
    // Low Chance (1-20%) - "Just in case" tips
    else if (eventPrecip > 0) {
      suggestions.push({
        text: `Only ${eventPrecip}% chance of rain but bring a compact umbrella just in case`,
        icon: '🌂',
        priority: 'low',
      });
    }

    // Cold + Rain combination
    if (eventPrecip > 20 && eventTemp < 40) {
      suggestions.push({
        text: `Cold rain expected - waterproof AND insulated jacket`,
        icon: '🧥',
        priority: 'high',
      });
    }

    // Footwear recommendations based on precipitation
    if (eventPrecip > 20) {
      suggestions.push({
        text: `Rain likely - wear waterproof shoes or boots`,
        icon: '👢',
        priority: 'medium',
      });
    } else if (eventPrecip > 0 && eventTemp < 40) {
      suggestions.push({
        text: `Possible wet conditions - waterproof boots recommended`,
        icon: '🥾',
        priority: 'low',
      });
    } else if (eventPrecip > 0) {
      suggestions.push({
        text: `Small rain chance - wear shoes you don't mind getting wet`,
        icon: '👟',
        priority: 'low',
      });
    }

    // Ice/Snow conditions
    if (eventPrecip > 0 && eventTemp >= 28 && eventTemp <= 35) {
      suggestions.push({
        text: `Possible ice - definitely wear boots with grip`,
        icon: '⚠️',
        priority: 'high',
      });
    }
  }

  // PRIORITY 3: SUN PROTECTION (Condition-based)

  // CLEAR SKY
  if (conditionType === 'clear') {
    if (eventTemp < 40) {
      suggestions.push({
        text: `Cold but bright sun - dress warm and bring sunglasses`,
        icon: '😎',
        priority: 'medium',
      });
    } else {
      suggestions.push({
        text: `Bright sun - bring sunglasses`,
        icon: '😎',
        priority: 'medium',
      });
    }

    if (userPreferences.uvIndex && eventUV > 3) {
      suggestions.push({
        text: `Strong sun exposure (UV: ${eventUV}) - wear sunscreen and sunglasses`,
        icon: '☀️',
        priority: 'medium',
      });
    }
  }
  // PARTLY CLOUDY
  else if (conditionType === 'partly-cloudy') {
    suggestions.push({
      text: `Partly cloudy - sun may peek through, bring sunglasses`,
      icon: '😎',
      priority: 'low',
    });

    if (userPreferences.uvIndex && eventUV > 5) {
      suggestions.push({
        text: `UV still high despite clouds (${eventUV}) - sunglasses recommended`,
        icon: '😎',
        priority: 'medium',
      });
    }

    if (tempRange > 10) {
      suggestions.push({
        text: `Mix of sun and clouds - layer up for changing conditions`,
        icon: '🌤️',
        priority: 'medium',
      });
    }
  }
  // CLOUDY/OVERCAST
  else if (conditionType === 'cloudy') {
    suggestions.push({
      text: `Overcast - will feel cooler than forecast suggests`,
      icon: '🌫️',
      priority: 'low',
    });

    if (userPreferences.windSpeed && eventWind > 15) {
      const feelsColder = Math.round(eventWind * 0.5);
      suggestions.push({
        text: `Cloudy and windy - dress warmer, feels ${feelsColder}° colder`,
        icon: '☁️',
        priority: 'medium',
      });
    }
  }

  // UV-specific recommendations
  if (userPreferences.uvIndex && eventUV > 6) {
    suggestions.push({
      text: `Strong sun (UV: ${eventUV}) - sunglasses and SPF 30+ sunscreen`,
      icon: '☀️',
      priority: 'medium',
    });
  } else if (userPreferences.uvIndex && eventUV > 3 && conditionType !== 'cloudy') {
    suggestions.push({
      text: `Moderate UV (${eventUV}) - sunglasses recommended`,
      icon: '😎',
      priority: 'low',
    });
  }

  // PRIORITY 4: TEMPERATURE COMFORT

  // Temperature thresholds
  if (eventTemp < 15) {
    suggestions.push({
      text: `Extreme cold (${eventTemp}°F) - cover all exposed skin`,
      icon: '🥶',
      priority: 'high',
    });
  } else if (eventTemp < 32) {
    suggestions.push({
      text: `Freezing (${eventTemp}°F) - wear insulated coat`,
      icon: '🧥',
      priority: 'high',
    });
  } else if (eventTemp < 50) {
    suggestions.push({
      text: `Cold (${eventTemp}°F) - jacket needed`,
      icon: '🧥',
      priority: 'medium',
    });
  } else if (eventTemp > 85) {
    suggestions.push({
      text: `Hot (${eventTemp}°F) - stay hydrated, seek shade`,
      icon: '💧',
      priority: 'medium',
    });
  }

  // Cold + Condition combinations
  if (eventTemp < 40 && conditionType === 'cloudy') {
    suggestions.push({
      text: `Cold and gray - dress extra warm, no sun to help`,
      icon: '🌫️',
      priority: 'medium',
    });
  }

  // PRIORITY 5: WIND ADVISORIES (Actionable)

  if (userPreferences.windSpeed && eventWind > 15) {
    if (eventWind > 45) {
      suggestions.push({
        text: `Dangerous winds (${eventWind} mph) - stay near buildings, away from trees`,
        icon: '⚠️',
        priority: 'high',
      });
    } else if (eventWind > 35) {
      suggestions.push({
        text: `Very windy (${eventWind} mph) - skip umbrella, use hooded jacket instead`,
        icon: '🧥',
        priority: 'high',
      });
      suggestions.push({
        text: `Strong gusts - secure all loose items, bags, scarves`,
        icon: '💨',
        priority: 'medium',
      });
    } else if (eventWind > 25) {
      suggestions.push({
        text: `Windy (${eventWind} mph) - umbrella will be difficult to use`,
        icon: '🌂',
        priority: 'medium',
      });
      suggestions.push({
        text: `Strong wind - wear a tight-fitting hat or skip the hat`,
        icon: '🎩',
        priority: 'low',
      });
    } else if (eventWind > 15) {
      suggestions.push({
        text: `Breezy (${eventWind} mph) - hats and scarves should be secured`,
        icon: '🧣',
        priority: 'low',
      });
    }
  }

  // Wind + Condition combinations
  if (conditionType === 'clear' && eventWind > 25) {
    suggestions.push({
      text: `Sunny but very windy (${eventWind} mph) - sunglasses that won't blow off`,
      icon: '😎',
      priority: 'medium',
    });
  }

  if (conditionType === 'cloudy' && eventWind > 15) {
    suggestions.push({
      text: `Cloudy and windy - feels colder than forecast, dress warm`,
      icon: '☁️',
      priority: 'medium',
    });
  }

  if (conditionType === 'rain' && eventWind > 20) {
    if (eventWind > 25) {
      suggestions.push({
        text: `Rainy and windy - umbrella may not help, wear hooded raincoat`,
        icon: '☔',
        priority: 'high',
      });
    } else {
      suggestions.push({
        text: `Wet and windy - waterproof everything, avoid umbrellas if wind > 25mph`,
        icon: '🌧️',
        priority: 'medium',
      });
    }
  }

  // PRIORITY 6: LAYERING ADVICE

  // Temperature range during event
  if (tempRange > 10) {
    const minTemp = Math.min(...eventTemps);
    const maxTemp = Math.max(...eventTemps);
    if (maxTemp > eventTemp) {
      suggestions.push({
        text: `Warming up during event (${minTemp}° → ${maxTemp}°) - dress in removable layers`,
        icon: '👕',
        priority: 'medium',
      });
    } else {
      suggestions.push({
        text: `Cooling down during event (${maxTemp}° → ${minTemp}°) - bring an extra layer`,
        icon: '🧥',
        priority: 'medium',
      });
    }
  }

  // Indoor/Outdoor context
  const isOutdoor = ['outdoor', 'park', 'walk', 'run', 'bike', 'hike', 'beach', 'picnic', 'stadium', 'field']
    .some(keyword => eventTitle.toLowerCase().includes(keyword));
  
  if (!isOutdoor && eventTemp < 32) {
    suggestions.push({
      text: `NYC buildings overheat - wear layers you can remove indoors`,
      icon: '🏢',
      priority: 'low',
    });
  }

  // PRIORITY 7: COMPARATIVE TIPS (Before vs During)

  if (departureWeather) {
    const departureCondition = getConditionType(departureWeather.condition);
    const departurePrecip = departureWeather.precipitation || 0;
    const departureWind = departureWeather.wind || 0;

    // Different conditions
    if (departureCondition !== conditionType) {
      if (departureCondition === 'clear' && conditionType === 'cloudy') {
        suggestions.push({
          text: `Clear when you leave, cloudy during event - bring sunglasses anyway`,
          icon: '😎',
          priority: 'low',
        });
      } else if (departureCondition === 'cloudy' && conditionType === 'rain') {
        suggestions.push({
          text: `Dry when you leave but ${eventPrecip}% rain chance during event - pack umbrella`,
          icon: '🌂',
          priority: 'medium',
        });
      }
    }

    // Wind changes
    if (departureWind < 20 && eventWind > 30) {
      suggestions.push({
        text: `Calm winds when leaving but ${eventWind} mph gusts during event - prepare for wind`,
        icon: '💨',
        priority: 'medium',
      });
    }

    // Precipitation changes
    if (departurePrecip < 10 && eventPrecip > 30) {
      suggestions.push({
        text: `Dry when you leave but ${eventPrecip}% rain chance during event - pack umbrella`,
        icon: '🌂',
        priority: 'medium',
      });
    }
  }

  // Sidewalk safety (NYC-specific)
  if (eventPrecip > 0 && eventTemp < 40) {
    suggestions.push({
      text: `Sidewalks may be icy - wear boots with good traction`,
      icon: '👢',
      priority: 'medium',
    });
  }

  // Sort by priority (high → medium → low)
  const priorityOrder: Record<SuggestionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Ensure diversity - mix different types of tips
  const uniqueSuggestions: WeatherSuggestion[] = [];
  const seenIcons = new Set<string>();
  const tipTypes = new Set<string>(); // Track tip categories: safety, precip, sun, temp, wind, layer, compare
  
  // First pass: Add all high-priority safety warnings
  for (const suggestion of suggestions) {
    if (suggestion.priority === 'high') {
      uniqueSuggestions.push(suggestion);
      seenIcons.add(suggestion.icon);
      if (uniqueSuggestions.length >= 4) break;
    }
  }

  // Second pass: Add diverse medium/low priority tips
  for (const suggestion of suggestions) {
    if (uniqueSuggestions.length >= 4) break;
    if (suggestion.priority !== 'high') {
      // Prioritize diversity - prefer different icon types
      if (!seenIcons.has(suggestion.icon) || uniqueSuggestions.length < 2) {
        uniqueSuggestions.push(suggestion);
        seenIcons.add(suggestion.icon);
      }
    }
  }

  return uniqueSuggestions.length > 0 ? uniqueSuggestions : suggestions.slice(0, 4);
}

/**
 * Basic suggestions fallback (when no hourly data available)
 */
function generateBasicSuggestions(
  weather: WeatherData,
  userPreferences: WeatherFeatures
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];
  const conditionType = getConditionType(weather.condition);
  const eventTemp = weather.temp;
  const eventWind = weather.wind || 0;
  const eventUV = weather.uv || 0;
  const eventPrecip = weather.precipitation || 0;

  // Wind Chill
  if (userPreferences.windSpeed && userPreferences.feelsLike && eventTemp < 50 && eventWind > 15) {
    const windChill = calculateWindChill(eventTemp, eventWind);
    const feelsLike = weather.feelsLike || windChill;
    
    if (feelsLike < 0) {
      suggestions.push({
        text: `Dangerous wind chill - feels like ${feelsLike}°F (cover all exposed skin)`,
        icon: '⚠️',
        priority: 'high',
      });
    } else if (feelsLike < 15) {
      suggestions.push({
        text: `Severe wind chill - feels like ${feelsLike}°F (limit time outside)`,
        icon: '🥶',
        priority: 'high',
      });
    }
  }

  // Dangerous Wind
  if (userPreferences.windSpeed && eventWind > 45) {
    suggestions.push({
      text: `DANGEROUS WINDS (${eventWind} mph) - avoid outdoor activities`,
      icon: '⚠️',
      priority: 'high',
    });
  }

  // Precipitation
  if (userPreferences.precipitation && eventPrecip > 0) {
    if (eventPrecip > 60) {
      suggestions.push({
        text: `Rain very likely (${eventPrecip}%) - full rain gear`,
        icon: '☔',
        priority: 'high',
      });
    } else if (eventPrecip > 40) {
      suggestions.push({
        text: `Likely to rain (${eventPrecip}%) - umbrella and waterproof jacket`,
        icon: '☔',
        priority: 'high',
      });
    } else if (eventPrecip > 20) {
      suggestions.push({
        text: `Rain possible (${eventPrecip}%) - bring an umbrella`,
        icon: '🌂',
        priority: 'medium',
      });
    } else {
      suggestions.push({
        text: `Only ${eventPrecip}% chance but bring compact umbrella just in case`,
        icon: '🌂',
        priority: 'low',
      });
    }
  }

  // Sun Protection
  if (conditionType === 'clear') {
    suggestions.push({
      text: `Bright sun - bring sunglasses`,
      icon: '😎',
      priority: 'medium',
    });
  } else if (conditionType === 'partly-cloudy') {
    suggestions.push({
      text: `Partly cloudy - sun may peek through, bring sunglasses`,
      icon: '😎',
      priority: 'low',
    });
  }

  if (userPreferences.uvIndex && eventUV > 6) {
    suggestions.push({
      text: `Strong sun (UV: ${eventUV}) - sunglasses and SPF 30+`,
      icon: '☀️',
      priority: 'medium',
    });
  }

  // Temperature
  if (eventTemp < 32) {
    suggestions.push({
      text: `Freezing (${eventTemp}°F) - wear insulated coat`,
      icon: '🧥',
      priority: 'high',
    });
  } else if (eventTemp < 50) {
    suggestions.push({
      text: `Cold (${eventTemp}°F) - jacket needed`,
      icon: '🧥',
      priority: 'medium',
    });
  }

  // Sort and return
  const priorityOrder: Record<SuggestionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return suggestions.slice(0, 4);
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateEnhancedSuggestions instead
 */
export function generateWeatherSuggestions(
  weather: WeatherData,
  userPreferences: WeatherFeatures
): WeatherSuggestion[] {
  return generateBasicSuggestions(weather, userPreferences);
}
