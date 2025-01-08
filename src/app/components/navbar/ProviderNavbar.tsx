import { Switch } from "@/components/ui/switch"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Bell, User } from "lucide-react";

interface ProviderDropdownProps {
    isTracking: boolean;
    handleStatusChange: (checked: boolean) => void;
}

const ProviderNavbar: React.FC<ProviderDropdownProps> = ({
    isTracking,
    handleStatusChange

}) => {
    return (
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
                                    {/* <Menu className="h-6 w-6" /> */}
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                            </div>

                            <div className="hidden lg:flex items-center space-x-6">
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

                                <div className="flex items-center space-x-3">
                                    {/* <img
                                    src="/api/placeholder/32/32"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full bg-gray-300"
                                /> */}
                                    <User className="h-5 w-5 text-white" />
                                    <div className="text-sm text-white">
                                        <div>Dean Sanchez</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu panel */}
                    <DisclosurePanel className="lg:hidden bg-black">
                        <div className="px-4 pt-2 pb-3 space-y-1">
                            <div className="flex items-center justify-between py-2">
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

                            <div className="flex items-center space-x-3">
                                {/* <img
                                    src="/api/placeholder/32/32"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full bg-gray-300"
                                /> */}
                                <User className="h-5 w-5 text-white" />
                                <div className="text-sm text-white">
                                    <div>Dean Sanchez</div>
                                </div>
                            </div>
                            {/* ... other mobile menu items ... */}
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    )
}

export default ProviderNavbar