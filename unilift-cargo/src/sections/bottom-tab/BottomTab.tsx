'use client';
import React from 'react';
import { Home, LayoutDashboard, ShoppingCart, Store, User } from 'lucide-react';
import IconContainer from './IconContainer';
import { AppRoutes } from '@/constants/AppRoutes';
const BottomTab = () => {
  return (
    <div className={`h-[100px] z-[100] bg-white mt-5 fixed w-[100%] bottom-0`}>
      <div
        // className={`h-[100%]  flex items-center gap-3 px-3 ${Capacitor.getPlatform() === 'ios' && 'h-[80%]'}`}
        className="flex px-2 h-[100%]"
      >
        <IconContainer
          Icon={<Home />}
          Name={'Home'}
          NavigateTo={AppRoutes.HOME}
        />
        <IconContainer
          Icon={<Store />}
          Name="Inventory"
          NavigateTo={AppRoutes.CONTRACTOR_EQUIPMENT_LISTING}
        />
        <IconContainer
          Icon={<LayoutDashboard />}
          Name="Menu"
          NavigateTo={AppRoutes.CONTRACTOR_DASHBOARD}
        />
        <IconContainer
          Icon={<ShoppingCart />}
          Name="Cart"
          NavigateTo={AppRoutes.CONTRACTOR_CART}
        />
        <IconContainer
          Icon={<User />}
          Name="Account"
          NavigateTo={AppRoutes.CONTRACTOR_PROFILE}
        />
      </div>
    </div>
  );
};

export default BottomTab;
