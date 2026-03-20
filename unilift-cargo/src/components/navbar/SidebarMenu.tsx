import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { LogoutIcon } from '@/components/svgs';
import { useUser } from '@/context/UserContext';
import {
  ChevronDown,
  Package,
  Phone,
  Info,
  // UserPlus,
  LucideLogIn,
  ShoppingCart,
  ThumbsUp,
  Store,
  ScrollText,
  // Locate,
  UserCog,
  MessageSquare,
  HardHat
} from 'lucide-react';
import { DashboardIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import BlogIcon from '../svgs/BlogIcon';

export type NavigationSubmenuType = {
  id: string;
  title: string;
  toastText?: string;
  needsLogout?: {
    route: string;
  };
  route: string;
  icon?: ReactNode;
};

interface NavigationMenuType {
  id: string;
  title: string;
  icon: ReactNode;
  route: string;
  isForSideMenu?: boolean;
  subMenu?: NavigationSubmenuType[];
}

export const SIDEBAR_MENU_ITEMS: NavigationMenuType[] = [
  {
    id: 'ppe-store',
    title: 'PPE Store',
    icon: <Store className="w-5 h-5" />,
    route: AppRoutes.PRODUCT_LISTING,
    subMenu: [
      { id: 'ppe-all', title: 'All', route: '/products' },
      {
        id: 'ppe-head',
        title: 'Head Protection',
        route: '/products?category=head_protection'
      },
      {
        id: 'ppe-respiratory',
        title: 'Respiratory Protection',
        route: '/products?category=respiratory_protection'
      },
      {
        id: 'ppe-face',
        title: 'Face Protection',
        route: '/products?category=face_protection'
      },
      {
        id: 'ppe-eye',
        title: 'Eye Protection',
        route: '/products?category=eye_protection'
      },
      {
        id: 'ppe-hand',
        title: 'Hand Protection',
        route: '/products?category=hand_protection'
      },
      {
        id: 'ppe-foot',
        title: 'Foot Protection',
        route: '/products?category=leg_protection'
      },
      {
        id: 'ppe-fall',
        title: 'Fall Protection',
        route: '/products?category=fall_protection'
      },
      {
        id: 'ppe-body',
        title: 'Body Protection',
        route: '/products?category=body_protection'
      },
      {
        id: 'ppe-ear',
        title: 'Ear Protection',
        route: '/products?category=ear_protection'
      }
    ]
  },
  {
    id: 'ehs',
    title: 'EHS',
    icon: <HardHat className="w-5 h-5" />,
    route: '',
    subMenu: [
      {
        id: 'ehs-toolbox',
        title: 'EHS Toolbox Talks',
        route: AppRoutes.EHS_TOOLBOX_TALK
      },
      {
        id: 'ehs-checklist',
        title: 'EHS Checklist',
        route: AppRoutes.EHS_CHECKLIST_LISTING
      },
      {
        id: 'ehs-first-principles',
        title: 'EHS First Principles',
        route: AppRoutes.EHS_FIRST_PRINCIPLES
      },
      {
        id: 'ehs-incident',
        title: 'EHS Incident Analysis',
        route: AppRoutes.EHS_INCIDENT_ANALYSIS_ADD
      },
      {
        id: 'ehs-news',
        title: 'EHS News & Update',
        route: '/#ehs-news'
      }
    ]
  },
  {
    id: 'inquiry',
    title: 'Enquiry',
    icon: <MessageSquare className="w-5 h-5" />,
    route: '',
    subMenu: [
      {
        id: 'inquiry-bulk',
        title: 'Enquiry for Bulk Purchase',
        route: AppRoutes.CONTACT_US,
        toastText:
          'For any bulk purchase inquiries, please provide your requirements along with your contact details in the Contact Us form.'
      },
      {
        id: 'inquiry-supplier',
        title: 'Become a Safezy Supplier',
        route: AppRoutes.CONTACT_US,
        toastText:
          'Interested in becoming a Safezy supplier? Fill out the Contact Us form with your necessary details, and we will get in touch with you.'
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    route: AppRoutes.CONTRACTOR_DASHBOARD,
    icon: <DashboardIcon className="h-5 w-5" />,
    isForSideMenu: true
  },
  {
    id: 'orders',
    title: 'My Orders',
    route: AppRoutes.CONTRACTOR_ORDER_LISTING,
    icon: <ScrollText className="h-5 w-5" />,
    isForSideMenu: true
  },
  {
    id: 'inventory',
    title: 'My Inventory',
    route: AppRoutes.CONTRACTOR_EQUIPMENT_LISTING,
    icon: <Package className="h-5 w-5" />,
    isForSideMenu: true
  },
  {
    id: 'profile-settings',
    title: 'Profile Settings',
    route: AppRoutes.CONTRACTOR_PROFILE,
    icon: <UserCog className="h-5 w-5" />,
    isForSideMenu: true
  },
  {
    id: 'recommended-products',
    title: 'Recommended Products',
    route: AppRoutes.RECOMMENDED_PRODUCTS,
    icon: <ThumbsUp className="h-5 w-5" />,
    isForSideMenu: true
  },
  {
    id: 'blogs',
    title: 'Blogs',
    icon: <BlogIcon className="w-[18px] h-[18px]" />,
    route: AppRoutes.BLOG
  },
  {
    id: 'about-us',
    title: 'About Us',
    icon: <Info className="w-5 h-5" />,
    route: AppRoutes.ABOUT_US
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    icon: <Phone className="w-5 h-5" />,
    route: AppRoutes.CONTACT_US
  },
  // {
  //   id: 'track-ppe',
  //   title: 'Track PPE',
  //   icon: <Locate className="w-5 h-5" />,
  //   route: '',
  //   subMenu: [
  //     {
  //       id: 'track-signup',
  //       title: 'Sign Up',
  //       route: AppRoutes.SIGN_UP_PRINCIPAL,
  //       icon: <UserPlus className="w-4 h-4 mr-2 mt-[1px] text-gray-700" />,
  //       needsLogout: {
  //         route: AppRoutes.SIGN_UP_PRINCIPAL
  //       }
  //     }
  //   ]
  // },
  {
    id: 'cart',
    title: 'Cart',
    icon: <ShoppingCart className="w-5 h-5" />,
    route: '/cart'
  }
];

interface SidebarMenuProps {
  onCloseSidebar?: () => void;
}

const SidebarMenu = ({ onCloseSidebar }: SidebarMenuProps) => {
  const pathname = usePathname();
  const { firstName, lastName, email, logout } = useUser();
  const router = useRouter();

  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [isLogouting, setIsLogouting] = useState(false);

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

  const toggleSubMenu = (title: string) => {
    setOpenSubMenu(openSubMenu === title ? null : title);
  };

  const isActive = (route: string) => {
    if (pathname === route) return true;
    return false;
  };

  const handleLinkClick = (route: string) => {
    if (route.includes('#')) {
      onCloseSidebar?.();
    }
  };

  const renderSubMenu = (subMenu: NavigationSubmenuType[]) => {
    return (
      <ul className="pl-4 mt-2 space-y-2">
        {subMenu.map(item => (
          <li key={item.id} className="w-full">
            <Link
              href={item.route}
              onClick={() => handleLinkClick(item.route)}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                isActive(item.route)
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`w-72 h-full flex flex-col`}>
      {firstName && lastName && (
        <div className="flex flex-col items-center space-x-3 p-4 border-b">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
            {firstName[0].toUpperCase() + lastName[0].toUpperCase()}
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-base font-semibold mt-2">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      )}
      <nav className={`flex-grow overflow-y-auto px-4 `}>
        <ul className="space-y-2">
          {SIDEBAR_MENU_ITEMS.map(item => (
            <li key={item.id} className="w-full">
              {item.subMenu ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.title)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md cursor-pointer ${
                      item.route && isActive(item.route)
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform duration-200 ${openSubMenu === item.title ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openSubMenu === item.title &&
                    item.subMenu &&
                    renderSubMenu(item.subMenu)}
                </>
              ) : (
                <Link
                  href={item.route || '/'}
                  onClick={() => handleLinkClick(item.route)}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                    isActive(item.route)
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile and Login/Logout Section */}
      <div>
        <ul className="flex flex-col gap-3 item-center justify-center mb-6">
          {firstName && lastName ? (
            <>
              <li className="w-full flex justify-center">
                <Link
                  href={AppRoutes.CONTRACTOR_PROFILE}
                  className="w-full flex justify-center items-center gap-3 mx-5 py-1 text-black text-sm capitalize font-medium bg-white rounded hover:bg-primary group"
                >
                  <p className="bg-primary w-8 h-8 rounded-full text-sm flex justify-center items-center ml-1 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    {firstName[0]}
                    {lastName[0]}
                  </p>
                  <p className="group-hover:text-white transition-all duration-300">
                    {firstName} {lastName}
                  </p>
                </Link>
              </li>
              <li className="w-full flex justify-center">
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
            </>
          ) : (
            <li className="w-full flex justify-center">
              <Link
                href={AppRoutes.LOGIN}
                className="w-full flex justify-center items-center gap-3 mx-5 py-2 text-black text-sm capitalize font-medium bg-white rounded hover:bg-primary"
              >
                <LucideLogIn className="fill-[#394257]" />
                <p>Log in</p>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SidebarMenu;
