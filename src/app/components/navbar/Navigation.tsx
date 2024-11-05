"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react';
import NavDropdown from './NavDropdown';

interface NavigationItem {
  name: string;
  href: string;
}

const NavigationItems: NavigationItem[] = [
  { name: 'Service Provider', href: '/serviceprovider' },
  { name: 'Request', href: '#' },
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
    href: '/Login',
  },
  {
    title: 'Sign in to Service Requester',
    description: 'Access your customer account',
    href: '/Login',
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

  const signupOptions: DropdownItem[] = [
    {
      title: 'Sign up as Service Provider',
      description: 'Start providing services on our platform',
      href: '/signup/provider',
    },
    {
      title: 'Sign up as Service Requester',
      description: 'Join to request services',
      href: '/signup/requester',
    },
  ];

  return (
    <Disclosure as="nav" className="bg-black">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-10">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
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

              <div className="flex items-center space-x-2">
                <NavDropdown
                  isOpen={loginOpen}
                  setIsOpen={setLoginOpen}
                  items={loginOptions}
                  buttonText="Log in"
                  buttonClass="text-white hover:bg-zinc-800 rounded-full px-3 py-2 text-[15px]"
                  onToggle={handleLoginClick}
                />
                <NavDropdown
                  isOpen={signupOpen}
                  setIsOpen={setSignupOpen}
                  items={signupOptions}
                  buttonText="Sign up"
                  buttonClass="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium"
                  onToggle={handleSignupClick}
                />
                <DisclosureButton className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NavigationItems.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-gray-100 block rounded-md px-3 py-2 text-base font-medium hover:bg-zinc-800 hover:text-white"
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default Navigation