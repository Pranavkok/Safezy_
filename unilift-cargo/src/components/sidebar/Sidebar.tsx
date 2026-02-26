'use client';

import { LogoutIcon, MainLogo } from '@/components/svgs';
import React, { useEffect, useState } from 'react';
import SidebarItem from './SidebarItem';
import HamburgerIcon from '@/components/svgs/HamburgerIcon';
import { SidebarMenuItemType, SidebarMenuType } from '@/types/sidebar.types';
import SecondaryLogo from '@/components/svgs/SecondaryLogo';
import { Button } from '../ui/button';
import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_ROLES } from '@/constants/constants';
import ContractorNotificationCount from '../ContractorNotificationCount';
import { Capacitor } from '@capacitor/core';

const Sidebar = ({ sidebarMenu }: { sidebarMenu: SidebarMenuType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogouting, setIsLogouting] = useState(false);
  const { firstName, lastName, logout, userRole } = useUser();

  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    setIsLogouting(true);
    try {
      await logout();
      router.push(AppRoutes.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLogouting(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white lg:hidden">
        <div className="flex items-center justify-between h-[60px] lg:h-[68px] border px-3 lg:px-5">
          <button
            onClick={toggleSidebar}
            aria-controls="logo-sidebar"
            type="button"
            className="w-10 h-9 p-2 text-sm text-gray-500 rounded-lg lg:hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Open sidebar</span>
            <HamburgerIcon className="" />
          </button>

          <Link
            href="#"
            className="flex justify-center w-full lg:justify-start mt-2 mr-3 sm:mr-10"
          >
            <MainLogo className="h-10 mx-auto lg:mx-0 " />
          </Link>

          {userRole === USER_ROLES.CONTRACTOR && (
            <div
              className={
                Capacitor.isNativePlatform()
                  ? 'mt-2'
                  : 'w-10 h-10 mt-5 border border-red-500'
              }
            >
              <ContractorNotificationCount />
            </div>
          )}
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40  h-full pt-20 lg:pt-10 transition-transform   ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-background  lg:bg-background  lg:translate-x-0  w-72 ${Capacitor.isNativePlatform() && 'pb-[100px]'} `}
        aria-label="Sidebar"
      >
        <div className="h-full pb-4 overflow-y-auto lg:bg-background  px-4 flex flex-col justify-between  ">
          <div>
            <Link
              href={userRole === USER_ROLES.CONTRACTOR ? AppRoutes.HOME : '/'}
              className="hidden lg:flex bg-primary pt-3  lg:justify-center rounded mb-5"
            >
              <SecondaryLogo className="h-12  " />
            </Link>
            <ul className="mb-6 flex flex-col gap-1.5 mr-10">
              {sidebarMenu.map((menuItem: SidebarMenuItemType) => (
                <SidebarItem key={menuItem.id} item={menuItem} />
              ))}
            </ul>
          </div>
          <div>
            <ul className="flex flex-col gap-3  item-center justify-center mb-6 ">
              {firstName && lastName && (
                <li className="w-full flex justify-center">
                  <Link
                    href={AppRoutes.CONTRACTOR_PROFILE}
                    className={cn(
                      'w-full flex justify-center items-center gap-3 mx-5 py-1 text-black text-sm capitalize font-medium bg-white rounded hover:bg-primary group',
                      pathname === AppRoutes.CONTRACTOR_PROFILE &&
                        'bg-primary text-white'
                    )}
                  >
                    <p
                      className={cn(
                        'bg-primary w-8 h-8 rounded-full text-sm flex justify-center items-center ml-1 group-hover:bg-white group-hover:text-primary transition-all duration-300',
                        pathname === AppRoutes.CONTRACTOR_PROFILE &&
                          'bg-white text-primary'
                      )}
                    >
                      {firstName[0]}
                      {userRole !== USER_ROLES.PRINCIPAL_EMPLOYER &&
                        lastName[0]}
                      {userRole === USER_ROLES.PRINCIPAL_EMPLOYER &&
                        firstName[1]}
                    </p>
                    <p
                      className={cn(
                        'group-hover:text-white transition-all duration-300',
                        pathname === AppRoutes.CONTRACTOR_PROFILE &&
                          'text-white'
                      )}
                    >
                      Hello {userRole === USER_ROLES.ADMIN && 'Admin'}
                      {userRole === USER_ROLES.CONTRACTOR && firstName}
                      {userRole === USER_ROLES.PRINCIPAL_EMPLOYER && firstName}!
                    </p>
                  </Link>
                </li>
              )}
              <li className="w-full flex justify-center ">
                <Button
                  onClick={handleLogout}
                  disabled={isLogouting}
                  className={`w-full flex justify-center items-center gap-3 mx-5 py-2 text-black text-sm capitalize font-medium bg-white rounded hover:bg-primary ${
                    isLogouting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLogouting ? (
                    <span className="flex items-center">
                      <span className="loader mr-2" /> Logging out...
                    </span>
                  ) : (
                    <>
                      <LogoutIcon className="fill-[#394257]" />
                      <p>Log out</p>
                    </>
                  )}
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
