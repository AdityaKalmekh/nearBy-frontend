import { useClickOutside } from "@/app/hooks/useClickOutside";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLocation } from "@/app/hooks/useLocation";
import React from "react";

interface Location {
    lat: number,
    lng: number,
}

interface PlacesAutocompleteProps {
    setLocation: (location: Location) => void;
    setRequestError: (err: string | null) => void;
    location: Location | null;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
    setLocation,
    setRequestError,
    location
}) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search options here */
            // componentRestrictions: { country: ['us'] },
            types: ['establishment', 'geocode']
        },
        debounce: 300,
    });

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);
    const {
        getLocation
    } = useLocation();

    const handleYourLocation = async () => {
        const currenLocation = await getLocation();
        console.log(currenLocation);

        const formateLocation = {
            lat: currenLocation.coordinates[1],
            lng: currenLocation.coordinates[0]
        }
        setLocation(formateLocation);
    }

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setError(null);

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            setLocation({ lat, lng });
        } catch (error) {
            // console.error('Error: ', error);
            setError('Failed to get location coordinates. Please try again.');
            console.error('Geocoding Error: ', error);
        }
    };

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || !data.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < data.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : -1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    const selected = data[selectedIndex];
                    handleSelect(selected.structured_formatting.main_text + ', ' + selected.structured_formatting.secondary_text);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
            suggestionRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    const searchRef = useClickOutside(() => {
        setShowSuggestions(false);
    })

    const formatSuggestion = (description: string) => {
        const parts = description.split(',');
        const mainText = parts[0];
        const secondaryText = parts.slice(1).join(',').trim();
        return { mainText, secondaryText };
    };

    return (
        <div ref={searchRef} className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
                ref={inputRef}
                type="text"
                className="w-full md:w-4/5 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your location"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setShowSuggestions(true);
                    setError(null);
                    setRequestError(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                disabled={!ready}
                aria-autocomplete="list"
                aria-controls="suggestions-list"
                aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
                role='combobox'
                aria-expanded={showSuggestions}
            />

            {/* Custom Suggestions Dropdown */}
            <div className="absolute z-50 w-full md:w-4/5 mt-1 bg-white rounded-md shadow-lg border overflow-hidden">
                <ul
                    id="suggestions-list"
                    className="max-h-60 overflow-auto divide-y divide-gray-100"
                    role="listbox"
                >
                    {/* Your location option */}
                    {showSuggestions && status !== "OK" && !location &&(
                        <li
                            ref={(el: HTMLLIElement | null) => {
                                suggestionRefs.current[0] = el
                            }}
                            id="suggestion-0"
                            role="option"
                            aria-selected={selectedIndex === 0}
                            className={`px-4 py-3 cursor-pointer transition-colors ${selectedIndex === 0 ? 'bg-gray-100' : 'hover:bg-gray-50'
                                }`}
                            onClick={handleYourLocation}
                        >
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm font-semibold text-black">
                                    Your location
                                </span>
                            </div>
                        </li>
                    )}

                    {/* Google Places suggestions */}
                    {status === "OK" && data.map(({ place_id, description, structured_formatting }, index) => {
                        const { mainText, secondaryText } = structured_formatting
                            ? {
                                mainText: structured_formatting.main_text,
                                secondaryText: structured_formatting.secondary_text
                            }
                            : formatSuggestion(description);
                        return (
                            <li
                                // ref={el => suggestionRefs.current[index] = el}
                                ref={(el: HTMLLIElement | null) => {
                                    suggestionRefs.current[index] = el;
                                }}
                                key={place_id}
                                id={`suggestion-${index}`}
                                role="option"
                                aria-selected={selectedIndex === index}
                                className={`px-4 py-3 cursor-pointer transition-colors ${selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => handleSelect(structured_formatting.main_text + ', ' + structured_formatting.secondary_text)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {mainText}
                                    </span>
                                    <span className="text-sm text-gray-500 mt-0.5">
                                        {secondaryText}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};