// app/page.tsx
import { Metadata } from 'next';
import HomeSection from '@/sections/home';

export const metadata: Metadata = {
  title: 'Safezy - Workplace Safety Management Solutions',
  description:
    'Comprehensive safety product management and procurement platform for businesses. Streamline workplace safety, order safety products, and manage employee assignments.',
  keywords: [
    'workplace safety',
    'safety products',
    'safety management',
    'employee safety',
    'workplace protection',
    'safety equipment',
    'safety procurement',
    'workplace risk management'
  ]
};

export default async function Home() {
  return <HomeSection />;
}
