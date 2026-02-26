'use client';

import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { CATEGORIES } from '../footer/FooterSection';

const EHS_LINKS = [
  { title: 'EHS Toolbox Talks', href: AppRoutes.EHS_TOOLBOX_TALK },
  { title: 'EHS Checklists', href: AppRoutes.EHS_CHECKLIST_LISTING },
  { title: 'EHS First Principles', href: AppRoutes.EHS_FIRST_PRINCIPLES },
  { title: 'EHS Incident Analysis', href: AppRoutes.EHS_INCIDENT_ANALYSIS_ADD }
];

const renderColumn = (title: string, items: ReactNode) => (
  <div className="flex flex-col gap-2 min-w-[200px]">
    <h3 className="text-lg sm:text-xl font-bold text-black mb-1">{title}</h3>
    <span className="h-[1px] w-[300px] bg-primary mb-2" />
    <div className="flex flex-col gap-2 sm:gap-3">{items}</div>
  </div>
);

const SiteMapSection = () => {
  return (
    <div className="w-full px-8 md:px-20 mb-[70px] mt-[20px]">
      <h1 className="text-[1.625rem] md:text-[1.875rem] font-bold leading-[1.9669rem] md:leading-[2.2694rem] mb-[2.25rem] text-center text-primary">
        SITE MAP
      </h1>

      <div className="w-full flex flex-wrap justify-center gap-20">
        {/* Company Column */}
        {renderColumn(
          'About Safezy',
          <>
            <Link
              href={AppRoutes.ABOUT_US}
              className="text-base hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link
              href={AppRoutes.CONTACT_US}
              className="text-base hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href={AppRoutes.CONTACT_US}
              className="text-base hover:text-primary transition-colors"
            >
              Enquiry for Bulk Purchase
            </Link>
            <Link
              href={AppRoutes.CONTACT_US}
              className="text-base hover:text-primary transition-colors"
            >
              Become A Safezy Supplier
            </Link>
          </>
        )}

        {/* PPE Column */}
        {renderColumn(
          'PPE Store',
          CATEGORIES.map(item => (
            <Link
              key={item.id}
              href={item.route}
              className="text-base hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          ))
        )}

        {/* EHS Column */}
        {renderColumn(
          'EHS Solutions',
          EHS_LINKS.map(({ title, href }) => (
            <Link
              key={title}
              href={href}
              className="text-base hover:text-primary transition-colors"
            >
              {title}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SiteMapSection;
