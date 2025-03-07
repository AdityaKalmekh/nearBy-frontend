"use client"

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface DropdownItem {
    title: string;
    description: string;
    href: string;
    icon?: React.ReactNode;
}

interface NavDropdownProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    items: DropdownItem[];
    buttonText: string;
    buttonClass: string;
    onToggle: () => void;
    isMobile?: boolean;
}

const NavDropdown: React.FC<NavDropdownProps> = ({
    isOpen,
    items,
    buttonText,
    buttonClass,
    onToggle,
    isMobile = false
}) => {

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node) &&
                isOpen
            ) {
                onToggle();
            }
        };

        if (!isMobile) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, onToggle, isMobile]);

    const dropdownContent = (
        <div className={`${isMobile ? 'w-full' : 'absolute right-0 mt-6 w-72'} bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
            <div className="p-2">
                {items.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-xl"
                    >
                        {item.icon && <span className="mr-3 text-gray-400">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500 hidden sm:block">{item.description}</p>
                        </div>
                        <span className="ml-2 flex-shrink-0 text-gray-400">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className={`${isMobile ? 'w-full' : 'relative'}`}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={`${buttonClass}`}
            >
                {buttonText}
            </button>
            {isOpen && <div ref={dropdownRef}>{dropdownContent}</div>}
        </div>
    );
};

export default NavDropdown
