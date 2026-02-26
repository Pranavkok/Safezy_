'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HamburgerIcon from '@/components/svgs/HamburgerIcon';
import SecondaryLogo from '@/components/svgs/SecondaryLogo';
import NavbarSearchIcon from '@/components/svgs/NavbarSearchIcon';
import Overlay from '../Overlay';
import { AppRoutes } from '@/constants/AppRoutes';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import UserMenu from './UserMenu';
import SidebarMenu from './SidebarMenu';
import CustomNavigationMenu from './NavigationMenu';
import { Capacitor } from '@capacitor/core';
import { searchProductNavbar } from '@/actions/contractor/product';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

const MainNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, searchParams]);

  // Handle hash changes for anchor navigation
  useEffect(() => {
    const handleHashChange = () => {
      setIsSidebarOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Setup React Query for search
  const { data: searchResults = [], refetch } = useQuery({
    queryKey: ['navbarSearch'],
    queryFn: async () => {
      if (!searchText.trim()) return [];
      const result = await searchProductNavbar(searchText);
      return result.success && result.data ? result.data : [];
    },
    enabled: searchText.trim().length > 0,
    refetchOnWindowFocus: false
  });

  const _debouncedSubmit = useCallback(
    debounce(() => refetch(), 500),
    [refetch]
  );

  const handleSearchInput = (value: string) => {
    setSearchText(value);
    setSearchPopoverOpen(value.trim().length > 0);
    _debouncedSubmit();
  };

  // Function to close sidebar - can be passed to child components
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-primary shadow">
        <div className="flex items-center justify-between h-14 xl:h-16 px-3 xl:px-5">
          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="xl:hidden w-10 h-9 p-2 text-sm text-gray-500 rounded-lg bg-gray-100 focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Toggle menu</span>
            <HamburgerIcon />
          </Button>

          {/* Logo */}
          <Link
            href={AppRoutes.HOME}
            className="flex justify-center w-fit xl:justify-start mt-2 mr-3 sm:mr-10"
          >
            <SecondaryLogo className="h-10 mx-auto xl:mx-0" />
          </Link>

          <div className="flex items-center ">
            {/* Desktop Navigation Items */}
            <div className="hidden xl:flex gap-3 items-center justify-center text-sm">
              <CustomNavigationMenu />
            </div>

            {/* Search and Login */}
            <div className="hidden xl:flex items-center gap-4 pl-10">
              <div className="relative w-44">
                <Popover open={searchPopoverOpen}>
                  <PopoverTrigger>
                    <Input
                      value={searchText}
                      placeholder="Search"
                      className="bg-white text-sm text-black h-9 rounded-full focus:ring-2 focus:ring-primary placeholder:text-primary placeholder:font-bold"
                      onChange={e => handleSearchInput(e.target.value)}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-fit min-w-[11.62rem] p-1"
                    onOpenAutoFocus={e => e.preventDefault()}
                    onCloseAutoFocus={e => e.preventDefault()}
                  >
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                      <ul className="space-y-1">
                        {searchResults.map((result, index) => (
                          <li key={index}>
                            <Link
                              href={result.url}
                              onClick={() => {
                                setSearchText('');
                                setSearchPopoverOpen(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <span className="truncate">{result.label}</span>

                              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* No results state */}
                      {searchResults.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No results found
                        </div>
                      )}
                    </div>

                    {/* Optional: Footer with total results */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 px-3">
                        {searchResults.length} results found
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                <NavbarSearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-4  bg-white" />
              </div>

              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* For Mobile devices */}
      {Capacitor.isNativePlatform() ? (
        <aside
          className={`h-[calc(100vh-156px)] left-0 top-[56px] pt-3 fixed z-[100] transition-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-background xl:bg-background xl:-translate-x-full w-72`}
          aria-label="Sidebar"
        >
          <SidebarMenu onCloseSidebar={closeSidebar} />
        </aside>
      ) : (
        <aside
          className={`fixed top-0 left-0 z-40 h-full pt-20 xl:pt-5 transition-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-background xl:bg-background xl:-translate-x-full w-72`}
          aria-label="Sidebar"
        >
          <SidebarMenu onCloseSidebar={closeSidebar} />
        </aside>
      )}

      {/* Sidebar Overlay */}
      <Overlay
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="z-30"
      />
    </>
  );
};

export default MainNavbar;
