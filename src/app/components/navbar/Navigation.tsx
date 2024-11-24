"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react';
import NavDropdown from '../Authentication/NavDropdown';

interface NavigationItem {
  name: string;
  href: string;
}

const NavigationItems: NavigationItem[] = [
  { name: 'Service Provider', href: '/serviceprovider' },
  { name: 'Service Requester', href: '#' },
]
interface DropdownItem {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

const loginOptions: DropdownItem[] = [
  {
    title: 'Sign in to Service Provider',
    description: 'Access your service provider account',
    href: '/provider',
  },
  {
    title: 'Sign in to Service Requester',
    description: 'Access your customer account',
    href: '/requester',
  },
];

const signupOptions: DropdownItem[] = [
  {
    title: 'Sign up as Service Provider',
    description: 'Start providing services on our platform',
    href: '/provider',
  },
  {
    title: 'Sign up as Service Requester',
    description: 'Join to request services',
    href: '/requester',
  },
];

const Navigation = () => {
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [signupOpen, setSignupOpen] = useState<boolean>(false);

  const handleLoginClick = () => {
    setSignupOpen(false);
    setLoginOpen(!loginOpen);
  }

  const handleSignupClick = () => {
    setLoginOpen(false);
    setSignupOpen(!signupOpen);
  }

  return (
    <Disclosure as="nav" className="bg-black">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative flex h-14 items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0">
                  <a className="text-white text-xl">NearBy</a>
                </div>
                <div className="hidden lg:ml-6 lg:flex lg:space-x-2">
                  {NavigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-white rounded-full px-3 py-2 text-[15px] hover:bg-zinc-800"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                <NavDropdown
                  isOpen={loginOpen}
                  setIsOpen={setLoginOpen}
                  items={loginOptions}
                  buttonText="Log in"
                  buttonClass="text-white hover:bg-zinc-800 rounded-full px-3 py-2 text-[15px] transition-colors whitespace-nowrap"
                  onToggle={handleLoginClick}
                />
                <NavDropdown
                  isOpen={signupOpen}
                  setIsOpen={setSignupOpen}
                  items={signupOptions}
                  buttonText="Sign up"
                  buttonClass="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                  onToggle={handleSignupClick}
                />
              </div>


              <div className='flex lg:hidden'>
                <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="lg:hidden">
            <div className="space-y-1 px-4 pb-4 pt-2">
              {NavigationItems.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-gray-300 block rounded-md px-3 py-2 text-base font-medium hover:bg-zinc-800 hover:text-white"
                >
                  {item.name}
                </DisclosureButton>
              ))}
              <div className="space-y-1">
                <NavDropdown
                  isOpen={loginOpen}
                  setIsOpen={setLoginOpen}
                  items={loginOptions}
                  buttonText="Log in"
                  buttonClass="w-full text-left text-gray-300 hover:text-white hover:bg-zinc-800 rounded-md px-3 py-2 text-base font-medium"
                  onToggle={handleLoginClick}
                  isMobile={true}
                />
                <NavDropdown
                  isOpen={signupOpen}
                  setIsOpen={setSignupOpen}
                  items={signupOptions}
                  buttonText="Sign up"
                  buttonClass="w-full text-left text-gray-300 hover:text-white hover:bg-zinc-800 rounded-md px-3 py-2 text-base font-medium"
                  onToggle={handleSignupClick}
                  isMobile={true}
                />
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default Navigation