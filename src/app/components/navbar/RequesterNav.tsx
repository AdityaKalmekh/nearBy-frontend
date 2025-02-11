import React from 'react';
import { Car, Activity, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onRideClick?: () => void;
  onActivityClick?: () => void;
  onProfileClick?: () => void;
}

const RequesterNavbar: React.FC<NavbarProps> = ({
  onRideClick,
  onActivityClick,
  onProfileClick
}) => {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section - Logo and Ride */}
        <div className="flex items-center">
          {/* Logo */}
          <div className="text-lg md:text-2xl font-bold mr-4 md:mr-8">
            NearBy
          </div>

          {/* Ride Button */}
          <button
            onClick={onRideClick}
            className="flex items-center px-3 md:px-4 py-2 border-b-2 border-black font-medium"
          >
            <Car className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Ride</span>
          </button>
        </div>

        {/* Right Section - Activity and Profile */}
        <div className="flex items-center">
          {/* Activity Button */}
          <button
            onClick={onActivityClick}
            className="flex items-center px-2 md:px-3 py-2 hover:bg-gray-50 rounded-full font-medium mr-2 md:mr-4"
          >
            <Activity className="h-5 w-5" />
            <span className="hidden md:inline ml-2">Activity</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={onProfileClick}
            className="flex items-center px-2 md:px-3 py-2 hover:bg-gray-50 rounded-full"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500 ml-2 hidden md:block" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RequesterNavbar;