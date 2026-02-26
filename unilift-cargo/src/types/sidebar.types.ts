export type SidebarMenuItemType = {
  id: number;
  title: string;
  icon?: React.ReactNode;
  route: string | null;
  subMenu?: {
    id: number;
    title: string;
    icon?: React.ReactNode;
    route: string;
  }[];
};

export type SidebarMenuType = readonly SidebarMenuItemType[];
