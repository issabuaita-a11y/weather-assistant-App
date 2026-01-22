import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Lock, Map } from 'lucide-react';
import { ScreenLayout, Button, Input } from '../components/ui';
import { OnboardingData } from '../types';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

// Photon API Response Types
interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
    type: string;
  };
  properties: {
    name: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    housenumber?: string;
    osm_key?: string;
    osm_value?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

const STORAGE_KEY = 'weather_app_onboarding_v2';

export const AddressScreen: React.FC<Props> = ({ data, updateData, onNext, onSkip, onBack }) => {
  const [query, setQuery] = useState(data.homeLocation?.address || '');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Helper function to save location to localStorage immediately
  const saveLocationToStorage = (homeLocation: OnboardingData['homeLocation']) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};
      const updatedData = {
        ...existingData,
        homeLocation,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('✅ Home location saved to localStorage:', homeLocation);
    } catch (error) {
      console.error('Failed to save location to localStorage:', error);
    }
  };

  useEffect(() => {
    // 1. Reset state if query is too short
    if (query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    
    // 2. Don't search if the query matches the currently selected address exactly
    if (data.homeLocation && query === data.homeLocation.address) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const performSearch = async () => {
      setIsLoading(true);
      try {
        // Using Photon (Komoot) API - much faster and permissive for autocomplete
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`,
          { signal: controller.signal }
        );
        
        if (!response.ok) throw new Error('API Error');
        
        const json: PhotonResponse = await response.json();
        
        if (active) {
          // Client-side filter for USA to satisfy "USA locations" preference
          // Photon doesn't strictly enforce country codes in the free API query param easily
          const usResults = json.features.filter(f => 
             !f.properties.country || f.properties.country.toLowerCase() === 'united states' || f.properties.country.toLowerCase() === 'usa'
          );

          // Deduplicate based on name + city + state
          const seen = new Set();
          const uniqueResults = usResults.filter(item => {
              const p = item.properties;
              const key = `${p.name}-${p.city}-${p.state}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
          });

          setSuggestions(uniqueResults.slice(0, 5));
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error);
          if (active) {
            setSuggestions([]); 
            setIsLoading(false);
          }
        }
      }
    };

    // Debounce the search
    const timer = setTimeout(performSearch, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      // Note: We don't strictly set isLoading(false) here to avoid flickering 
      // if the next effect immediately sets it to true.
    };
  }, [query, data.homeLocation]);

  const formatDisplay = (props: PhotonFeature['properties']) => {
     // Construct primary (Name or Street Address)
     let primary = props.name;
     if (props.street) {
         primary = `${props.housenumber ? props.housenumber + ' ' : ''}${props.street}`;
     }

     // Construct secondary (City, State)
     const secondaryParts = [];
     if (props.city && props.city !== primary) secondaryParts.push(props.city);
     if (props.state) secondaryParts.push(props.state);
     // if (props.country) secondaryParts.push(props.country);

     const secondary = secondaryParts.join(', ');
     
     return { primary, secondary, city: props.city, state: props.state };
  };

  const handleSelectLocation = (item: PhotonFeature) => {
    const { primary, secondary, city, state } = formatDisplay(item.properties);
    const fullAddress = [primary, secondary].filter(Boolean).join(', ');
    
    setQuery(fullAddress);
    setSuggestions([]);
    
    const homeLocation = {
      address: fullAddress,
      city: city || item.properties.name,
      state: state || '',
      coordinates: { 
          latitude: item.geometry.coordinates[1], // Lat is index 1 in GeoJSON
          longitude: item.geometry.coordinates[0] // Lon is index 0
      }
    };

    // Save to localStorage immediately (even in dev mode)
    saveLocationToStorage(homeLocation);
    
    // Also update React state
    updateData({ homeLocation });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode with Photon
          const response = await fetch(
            `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}&lang=en`
          );
          
          if (!response.ok) throw new Error('Reverse geocoding failed');
          
          const json: PhotonResponse = await response.json();
          if (json.features.length > 0) {
              const item = json.features[0];
              const { primary, secondary, city, state } = formatDisplay(item.properties);
              const fullAddress = [primary, secondary].filter(Boolean).join(', ');

              setQuery(fullAddress);
              setSuggestions([]);
              
              const homeLocation = {
                address: fullAddress,
                city: city || 'Current Location',
                state: state || '',
                coordinates: { latitude, longitude }
              };

              // Save to localStorage immediately (even in dev mode)
              saveLocationToStorage(homeLocation);
              
              // Also update React state
              updateData({ homeLocation });
          } else {
              throw new Error("No address found");
          }
        } catch (error) {
          console.error("Failed to detect location address:", error);
          const fallbackAddr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setQuery(fallbackAddr);
          
          const homeLocation = {
            address: fallbackAddr,
            city: 'Current Location',
            state: '',
            coordinates: { latitude, longitude }
          };

          // Save to localStorage immediately (even in dev mode)
          saveLocationToStorage(homeLocation);
          
          // Also update React state
          updateData({ homeLocation });
        } finally {
          setIsGettingLocation(false);
        }
      }, 
      (error) => {
        console.error("Geolocation error:", error);
        setIsGettingLocation(false);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  return (
    <ScreenLayout step={1} totalSteps={4} showBack onBack={onBack} theme="purple">
      <div className="flex-1 flex flex-col pt-4 mobile-lg:pt-6">
        {/* Top Section: Title */}
        <div className="mb-6 mobile-lg:mb-8">
          <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-4 mobile-lg:mb-5">
            Where do<br />you live?
          </h1>

          {/* Description - Under title */}
          <p className="text-[16px] mobile-lg:text-[17px] font-bold text-black/80 leading-tight">
            Get notified exactly when rain starts at your spot.
          </p>
        </div>

        {/* Middle Section: Input and Location Button */}
        <div className="flex-shrink-0">
          <div className="relative z-50 mb-2">
            <Input 
              icon={isLoading ? <Loader2 className="animate-spin text-black/50" size={20} /> : <Search size={20} />} 
              placeholder="Search city or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            
            {suggestions.length > 0 && (
              <div className="absolute top-[70px] left-0 right-0 bg-white/90 backdrop-blur-xl border-2 border-black/5 rounded-[24px] overflow-hidden shadow-2xl z-50 max-h-[300px] overflow-y-auto">
                {suggestions.map((item, idx) => {
                   const { primary, secondary } = formatDisplay(item.properties);
                   
                   return (
                      <div 
                        key={idx} // Photon doesn't always have unique IDs for fuzzy results, idx is safe here
                        onClick={() => handleSelectLocation(item)}
                        className="px-6 py-4 border-b border-black/5 active:bg-black/5 cursor-pointer last:border-0 hover:bg-black/5 transition-colors"
                      >
                        <span className="text-[16px] font-bold text-black block truncate">
                          {primary}
                        </span>
                        {secondary && (
                          <span className="text-[14px] text-black/50 block truncate">
                            {secondary}
                          </span>
                        )}
                      </div>
                   );
                })}
              </div>
            )}
          </div>

          <button 
            onClick={handleCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 text-black/60 font-semibold hover:text-black transition-colors disabled:opacity-50"
          >
            {isGettingLocation ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <MapPin size={20} />
            )}
            <span>{isGettingLocation ? 'Detecting...' : 'Use current location'}</span>
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-4 z-20 bg-transparent">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock size={12} className="text-black/40" />
            <span className="text-[11px] font-semibold text-black/40 uppercase tracking-widest">Private & Secure</span>
          </div>
          <Button onClick={onNext} disabled={!data.homeLocation}>
            Save Location
          </Button>
          {/* Spacer to match Calendar screen's Skip button height and spacing */}
          <div className="h-[44px] mobile-lg:h-[48px]"></div>
        </div>
      </div>
    </ScreenLayout>
  );
};