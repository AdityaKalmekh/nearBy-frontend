import { Switch } from "@/components/ui/switch"
import { useAuthContext } from "@/contexts/auth-context";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Bell, ChevronDown, HelpCircle, Loader2, LogOut, Settings, Tag, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProviderDropdownProps {
    isTracking: boolean;
    handleStatusChange: (checked: boolean) => void;
}

const ProviderNavbar: React.FC<ProviderDropdownProps> = ({
    isTracking,
    handleStatusChange
}) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, logout, isLoading } = useAuthContext();

    // console.log({ user });

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

    const handleSignOut = async () => {
        setIsProfileOpen(false);
        const success = await logout();
        if (typeof success === 'boolean' && success) {
            router.push('/');
        }
    }

    const toggleProfileDropdown = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    return (
        <div>
            {isLoading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
                </div>
            )}

            <Disclosure as="nav" className="bg-black">
                {({ open }) => (
                    <>
                        <div className="mx-auto px-4">
                            <div className="relative flex h-14 items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <div className="flex-shrink-0">
                                        <a className="text-white text-xl">NearBy</a>
                                    </div>
                                </div>
                                {/* Mobile menu button */}
                                <div className="flex lg:hidden">
                                    <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                        )}
                                    </DisclosureButton>
                                </div>

                                <div
                                    className="hidden lg:flex items-center space-x-6"
                                    ref={dropdownRef}>
                                    {/* Existing controls */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-white">
                                            {isTracking ? 'Available' : 'Unavailable'}
                                        </span>
                                        <Switch
                                            checked={isTracking}
                                            onCheckedChange={handleStatusChange}
                                            className="data-[state=checked]:bg-green-500"
                                        />
                                    </div>
                                    <button className="relative">
                                        <Bell className="h-6 w-6 text-white" />
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            3
                                        </span>
                                    </button>

                                    <div className="relative">
                                        <button
                                            className="flex items-center space-x-1 hover:bg-zinc-800 px-2 py-2 rounded-lg"
                                            onClick={toggleProfileDropdown}>
                                            <User className="h-5 w-5 text-white" />
                                            <div className="text-sm text-white">
                                                <div>{user?.firstName}</div>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 mt-1 text-gray-500 hidden md:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isProfileOpen && (
                                            <div className="absolute top-full right-0 mt-5 w-52 bg-gray-100 rounded-md shadow-lg z-10">
                                                <a href="#help" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-t-md">
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
                                                    className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-b-md"
                                                >
                                                    <LogOut className="h-5 w-5 mr-3" />
                                                    <span>Sign out</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu panel */}
                        <DisclosurePanel className="lg:hidden bg-black">
                            <div className="px-4 pt-2 pb-3 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white">
                                        {isTracking ? 'Available' : 'Unavailable'}
                                    </span>
                                    <Switch
                                        checked={isTracking}
                                        onCheckedChange={handleStatusChange}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between mr-2">
                                    <div className="flex space-x-1">
                                        <User className="h-5 w-5 text-white" />
                                        <div className="text-sm text-white">
                                            <div>Dean Sanchez</div>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800"
                                        onClick={toggleProfileDropdown}
                                    >
                                        <ChevronDown className={`h-5 w-5 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {isProfileOpen && (
                                    <div className="mt-2 bg-gray-100 rounded-md shadow-lg">
                                        <a href="#help" className="flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-t-md">
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
                                            className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-stone-200 rounded-b-md"
                                        >
                                            <LogOut className="h-5 w-5 mr-3" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                )}

                                <button className="relative flex items-center">
                                    <Bell className="h-6 w-6 text-white" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        3
                                    </span>
                                </button>
                            </div>
                        </DisclosurePanel>
                    </>
                )}
            </Disclosure>
        </div>
    )
}

export default ProviderNavbar