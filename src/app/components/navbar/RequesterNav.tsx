import React, { useEffect, useRef, useState } from 'react';
import { Car, Activity, ChevronDown, HelpCircle, Wallet, User, Tag, Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onRideClick?: () => void;
  onActivityClick?: () => void;
  onProfileClick?: () => void;
}

const RequesterNavbar: React.FC<NavbarProps> = ({
  onRideClick,
  onActivityClick
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, isLoading } = useAuth();

  // Check if the screen is mobile (below md breakpoint)
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 500);
      if (window.innerWidth < 500) {
        setIsProfileOpen(false);
      }
    };

    // Check initially
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileDropdown = () => {
    // Only toggle dropdown if not in mobile view
    if (!isMobileView) {
      setIsProfileOpen(!isProfileOpen);
    } else {
      setIsProfileOpen(false);
    }
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    const success = await logout();
    if (typeof success === 'boolean' && success) {
      router.push('/');
    }
  }

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
        </div>
      )}

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
              <span className="hidden sm:inline">Ride</span>
            </button>
          </div>

          {/* Right Section - Activity and Profile */}
          <div className="flex items-center">
            {/* Activity Button */}
            <button
              onClick={onActivityClick}
              className="flex items-center px-2 md:px-3 py-4 hover:bg-gray-50 rounded-full font-medium mr-2 md:mr-4"
            >
              {/* <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg> */}
              <Activity className='h-5 w-5' />
              <span className="hidden md:inline ml-2">Activity</span>
            </button>

            {/* Profile Button with Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
            // onMouseEnter={() => !isMobileView && setIsProfileOpen(true)}
            // onMouseLeave={() => !isMobileView && setIsProfileOpen(false)}
            >
              <div
                onClick={toggleProfileDropdown}
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
                <ChevronDown className={`h-5 w-5 text-gray-500 ml-2 hidden md:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3   w-52 bg-gray-100 rounded-md shadow-lg z-10">
                  {/* <div className="py-1"> */}
                  <a href="#help" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-md">
                    <HelpCircle className="h-5 w-5 mr-3" />
                    <span>Help</span>
                  </a>
                  <a href="#wallet" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200">
                    <Wallet className="h-5 w-5 mr-3" />
                    <span>Wallet</span>
                  </a>
                  <a href="#account" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200">
                    <User className="h-5 w-5 mr-3" />
                    <span>Manage account</span>
                  </a>
                  <a href="#promotions" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200">
                    <Tag className="h-5 w-5 mr-3" />
                    <span>Promotions</span>
                  </a>
                  <a href="#settings" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200">
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sign out</span>
                  </button>
                  {/* </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default RequesterNavbar;