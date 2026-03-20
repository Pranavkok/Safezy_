import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import NavLink from './NavLink';
import { NavigationSubmenuType, SIDEBAR_MENU_ITEMS } from './SidebarMenu';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import { BadgeInfo, Briefcase, X } from 'lucide-react';

const showCustomToast = (subItem: NavigationSubmenuType) => {
  toast.custom(
    t => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-8px)'
        }}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {subItem.title.includes('Bulk') ? (
              <Briefcase className="w-5 h-5 text-primary" />
            ) : (
              <BadgeInfo className="w-5 h-5 text-primary" />
            )}
            <p className="font-medium text-gray-900">{subItem.title}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {subItem.toastText}
          </p>
        </div>
      </div>
    ),
    {
      duration: 10000,
      position: 'top-right'
    }
  );
};
const CustomNavigationMenu = () => {
  const pathname = usePathname();

  const router = useRouter();

  const { logout, authId } = useUser();

  const handleLogout = async (route: string) => {
    const loadingToastId = toast.loading('Logging out...', {
      duration: Infinity
    });

    await logout();
    setTimeout(() => {
      router.push(route);
    }, 100);
    toast.dismiss(loadingToastId);
  };

  return SIDEBAR_MENU_ITEMS.map((item, index) => {
    if (item.isForSideMenu) {
      return;
    }
    if (item.subMenu) {
      return (
        <NavigationMenu key={item.id}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="!bg-transparent !text-white font-bold uppercase  p-0">
                <NavLink
                  href={item.route}
                  className="whitespace-nowrap"
                  pathname={pathname}
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-2 bg-white shadow-md rounded-md border border-gray-100 min-w-[240px]">
                <div className="grid grid-cols-1 gap-1">
                  {item.subMenu.map(subItem => (
                    <NavigationMenuLink key={subItem.id} asChild>
                      <NavLink
                        onClick={async () => {
                          if (subItem.toastText) {
                            toast.dismiss();
                            showCustomToast(subItem);
                          }

                          if (subItem.needsLogout) {
                            if (authId) {
                              await handleLogout(subItem.needsLogout.route);
                            }
                          }
                        }}
                        pathname={pathname}
                        href={subItem.route}
                        className="px-4 py-2 rounded-sm transition-colors duration-200 hover:bg-gray-100 group block whitespace-nowrap pl-2"
                      >
                        <div className="flex gap-1">
                          {subItem.icon ? subItem.icon : ''}
                          <span className="text-gray-800 font-medium text-sm group-hover:text-primary">
                            {subItem.title}
                          </span>
                        </div>
                      </NavLink>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );
    }
    return (
      <NavLink
        key={item.route + index}
        href={item.route}
        className="whitespace-nowrap "
        pathname={pathname}
      >
        {item.icon}
        {item.title}
      </NavLink>
    );
  });
};

export default CustomNavigationMenu;
