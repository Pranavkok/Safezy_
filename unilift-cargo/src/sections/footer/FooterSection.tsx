'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppRoutes } from '@/constants/AppRoutes';
import ASSETS from '@/assets';
import { MailsIcon, PhoneCall } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export const CATEGORIES = [
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
];

const EHS_LINKS = [
  { title: 'EHS Toolbox Talks', href: AppRoutes.EHS_TOOLBOX_TALK },
  { title: 'EHS Checklists', href: AppRoutes.EHS_CHECKLIST_LISTING },
  { title: 'EHS First Principles', href: AppRoutes.EHS_FIRST_PRINCIPLES },
  { title: 'EHS Incident Analysis', href: AppRoutes.EHS_INCIDENT_ANALYSIS_ADD }
];

const QUICK_LINKS = [
  { title: 'About Us', href: AppRoutes.ABOUT_US },
  { title: 'Contact Us', href: AppRoutes.CONTACT_US },
  { title: 'Site-Map', href: AppRoutes.SITE_MAP },
  { title: 'Privacy Policy', href: AppRoutes.PRIVACY_POLICY },
  { title: 'Terms & Conditions', href: AppRoutes.TERMS_AND_CONDITIONS }
];

export const renderFooterColumn = (title: string, items: ReactNode) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-lg sm:text-xl font-bold uppercase border-b border-white/20 pb-2 mb-2">
      {title}
    </h3>
    <div className="flex flex-col gap-1 sm:gap-2">{items}</div>
  </div>
);

const FooterSection = () => {
  if (!Capacitor.isNativePlatform())
    return (
      <footer className="relative w-full">
        <Image
          src={ASSETS.IMG.FOOTER}
          alt="footer-background"
          width={1024}
          height={768}
          className="absolute w-full h-full object-cover brightness-50"
          priority
        />
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-primary/90 w-full p-4 pb-16 sm:p-8 lg:p-14 lg:pb-20">
          {/* Contact Information */}
          {renderFooterColumn(
            'Contact Us',
            <>
              <div className="flex items-center gap-2 group">
                <PhoneCall className="w-5 h-5" />
                <a
                  href="tel:+918591307077"
                  className="text-base font-semibold hover:text-white"
                >
                  +91 8591307077
                </a>
              </div>
              <div className="flex items-center gap-2 group">
                <MailsIcon className="w-5 h-5" />
                <a
                  href="mailto:support@safezy.in"
                  className="text-base font-semibold hover:text-white"
                >
                  support@safezy.in
                </a>
              </div>
            </>
          )}

          {/* Categories */}
          {renderFooterColumn(
            'Categories',
            CATEGORIES.map(item => (
              <Link
                key={item.id}
                href={item.route}
                className="text-base hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            ))
          )}

          {/* EHS Links */}
          {renderFooterColumn(
            'EHS',
            EHS_LINKS.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-base hover:text-white transition-colors"
              >
                {link.title}
              </Link>
            ))
          )}

          {/* Quick Links */}
          {renderFooterColumn(
            'Quick Links',
            QUICK_LINKS.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-base hover:text-white transition-colors"
              >
                {link.title}
              </Link>
            ))
          )}

          {/* Copyright Section */}
          <div className="absolute bottom-0 left-0 w-full bg-black/40 py-3 px-4 text-center text-sm">
            © {new Date().getFullYear()} Safezy. All rights reserved.
          </div>
        </div>
      </footer>
    );

  return null;
};

export default FooterSection;
