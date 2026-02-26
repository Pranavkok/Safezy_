'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Loader2, ThumbsUp, Store } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { useUser } from '@/context/UserContext';
import { OrderIcon } from '@/components/svgs';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

const UserMenu = () => {
  const { firstName, lastName, logout, email, isLoading } = useUser();
  const [isLogouting, setIsLogouting] = useState(false);
  const router = useRouter();

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

  // Loading state for the initial user data fetch
  if (isLoading) {
    return (
      <div className="flex items-center">
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    );
  }

  // Render when user is logged in
  if (firstName && lastName) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <p className="bg-white text-primary font-semibold w-9 h-9 rounded-full text-sm flex justify-center items-center ml-1">
            {firstName && lastName ? firstName[0] + lastName[0] : 'Safezy'}
          </p>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              {firstName[0].toUpperCase() + lastName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium leading-none">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={AppRoutes.CONTRACTOR_DASHBOARD}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={AppRoutes.CONTRACTOR_ORDER_LISTING}
              className="cursor-pointer"
            >
              <OrderIcon className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={AppRoutes.CONTRACTOR_EQUIPMENT_LISTING}
              className="cursor-pointer"
            >
              <Store className="mr-2 h-4 w-4" />
              <span>My Inventory</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={AppRoutes.CONTRACTOR_PROFILE}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={AppRoutes.RECOMMENDED_PRODUCTS}
              className="cursor-pointer bg-primary text-white focus:text-primary focus:bg-white focus:font-bold"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              <span>Recommended Products</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={event => {
              event.preventDefault();
              handleLogout();
            }}
            className="text-destructive focus:text-destructive"
            disabled={isLogouting}
          >
            {isLogouting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>{isLogouting ? 'Logging out...' : 'Log Out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Render when user is not logged in
  return (
    <Link
      className="bg-white flex justify-center items-center rounded-full text-sm text-primary h-9 font-bold px-6 py-1 hover:bg-white/90"
      href={AppRoutes.LOGIN}
    >
      Log In
    </Link>
  );
};

export default UserMenu;
