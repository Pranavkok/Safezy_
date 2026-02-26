import { IconType } from '@/types/icon.types';
import * as React from 'react';

const NavbarSearchIcon = ({ className }: IconType) => (
  <svg
    className={`${className}`}
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
  >
    <path
      fill="#FF914D"
      fillRule="evenodd"
      d="M9.766 5.337c0 2.185-1.874 3.956-4.186 3.956s-4.185-1.77-4.185-3.956c0-2.184 1.874-3.955 4.185-3.955 2.312 0 4.186 1.77 4.186 3.955m-.764 4.167A5.77 5.77 0 0 1 5.58 10.61C2.498 10.611 0 8.251 0 5.337 0 2.425 2.498.063 5.58.063c3.083 0 5.58 2.362 5.58 5.274A5.07 5.07 0 0 1 9.99 8.571l3.807 3.598a.634.634 0 0 1 0 .932.726.726 0 0 1-.987 0z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export default NavbarSearchIcon;
