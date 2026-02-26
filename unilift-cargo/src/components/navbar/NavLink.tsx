import { cn } from '@/lib/utils';
import Link from 'next/link';

const NavLink = ({
  href,
  children,
  className,
  pathname,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  pathname: string;
  onClick?: () => void;
}) => {
  const isActive = pathname === href;

  return (
    <Link
      onClick={onClick || (() => {})}
      href={href}
      className={cn(
        'relative group transition-all duration-300 ease-in-out',
        'text-white font-semibold capitalize tracking-wider',
        'hover:text-primary-foreground/80',
        "after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px]",
        'after:bg-primary-foreground after:transition-all after:duration-300 after:ease-in-out',
        'hover:after:w-full',
        'flex gap-1',
        isActive && 'text-primary-foreground/90 after:w-full',
        className
      )}
    >
      {children}
    </Link>
  );
};

export default NavLink;
