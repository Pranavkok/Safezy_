import { SidebarMenuItemType } from '@/types/sidebar.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ item }: { item: SidebarMenuItemType }) => {
  const pathname = usePathname();

  const isActive = (route: string | null): boolean =>
    route ? pathname.includes(route.split('?')[0]) : false;

  const isSubmenuActive = item.subMenu?.some(subItem =>
    isActive(subItem.route)
  );

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(isSubmenuActive);

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const renderSubMenu = () => {
    if (!item.subMenu) return null;

    return (
      <ul className="pl-4 mt-2 space-y-2">
        {item.subMenu.map(subItem => (
          <li key={subItem.id}>
            <Link
              href={subItem.route}
              className={cn(
                'flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors',
                'hover:bg-primary hover:text-white',
                isActive(subItem.route) && 'bg-primary text-black'
              )}
            >
              {subItem.icon}
              <span className="ml-2">{subItem.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  // If item has submenu, render as expandable section
  if (item.subMenu) {
    return (
      <li>
        <div className="w-full">
          <button
            onClick={toggleSubMenu}
            className={`
              group w-full relative flex items-center justify-between text-sm rounded-sm px-3 py-2 
              font-medium duration-300 ease-in-out 
              ${isSubmenuActive && 'bg-primary/20 text-black '}   `}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transform transition-transform duration-200 
                ${isSubMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isSubMenuOpen && renderSubMenu()}
        </div>
      </li>
    );
  }

  // Regular menu item without submenu
  return (
    <li>
      <Link
        href={item.route ? item.route : ''}
        className={cn(
          'group relative flex items-center  rounded-sm px-3 py-2  text-sm font-medium',
          'duration-300 ease-in-out hover:bg-primary hover:text-white',
          isActive(item.route) && 'bg-primary text-black'
        )}
      >
        {item.icon}
        <span className="ml-2">{item.title}</span>
      </Link>
    </li>
  );
};

export default SidebarItem;
