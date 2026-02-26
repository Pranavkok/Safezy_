import ASSETS from '@/assets';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';
import EhsNewsListingSection from '../ehs/ehs-news/EhsNewsListingSection';
import { ChartSpline, ClipboardCheck, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ProductCategorySection from './ProductCategorySection';
import CarouselComponent, {
  ImageDataProps
} from '@/components/landingPage/CarouselComponent';
import ProductListingSection from './ProductListingSection';
import DiscountSection from './DiscountSection';
import WhoWeAreSection from './WhoWeAreSection';

const features = [
  {
    title: 'Toolbox Talk',
    description:
      'Conduct effective safety briefings and track team participation',
    icon: (
      <MessageSquare className="h-8 w-8 transition-all duration-200 group-hover:scale-110" />
    ),
    stats: '1.2k+ Talks Conducted',
    href: AppRoutes.EHS_TOOLBOX_TALK,
    features: ['Team Communication', 'Safety Briefings', 'Attendance Tracking']
  },
  {
    title: 'Incident Analysis',
    description:
      'Analyze and prevent workplace incidents with detailed reports',
    icon: (
      <ChartSpline className="h-8 w-8 transition-all duration-200 group-hover:scale-110" />
    ),
    stats: '100% Investigation Rate',

    href: AppRoutes.EHS_INCIDENT_ANALYSIS_ADD,
    features: ['Root Cause Analysis', 'Preventive Actions', 'Trend Analysis']
  },
  {
    title: 'Safety Checklist',
    description: 'Comprehensive checklists for workplace safety compliance',
    icon: (
      <ClipboardCheck className="h-8 w-8 transition-all duration-200 group-hover:scale-110" />
    ),
    stats: '5k+ Checks Completed',

    href: AppRoutes.EHS_CHECKLIST_LISTING,
    features: ['Daily Inspections', 'Compliance Tracking', 'Auto Reminders']
  }
];

const listData: ImageDataProps[] = [
  {
    id: 'safety-solution-products',
    title: 'Safety Solution Products',
    description:
      'Discover a wide range of high-quality safety products designed to keep you protected in every work environment.',
    img: ASSETS.IMG.LANDING_IMAGE_2,
    buttons: [{ name: 'Explore Now', url: AppRoutes.PRODUCT_LISTING }]
  },
  {
    id: 'ehs-toolbox-talks',
    title: 'EHS Toolbox Talks',
    description:
      'Enhance workplace safety with essential EHS Toolbox Talks. Get access to valuable discussions and best practices.',
    img: ASSETS.IMG.LANDING_IMAGE_3,
    buttons: [
      { name: 'Explore EHS Toolbox Topics', url: AppRoutes.EHS_TOOLBOX_TALK }
    ]
  },
  {
    id: 'ehs-incident-analysis',
    title: 'EHS Incident Analysis',
    description:
      'Gain insights into workplace incidents with detailed EHS analysis. Learn from past events to build a safer future.',
    img: ASSETS.IMG.LANDING_IMAGE_4,
    buttons: [{ name: 'Visit Now', url: AppRoutes.EHS_INCIDENT_ANALYSIS_ADD }],
    isComing: true
  },
  {
    id: 'ehs-news-update',
    title: 'EHS News & Update',
    description: 'Latest in the world of EHS',
    img: ASSETS.IMG.LANDING_IMAGE_5,
    buttons: [{ name: 'Visit News Feed', url: '#ehs-news' }],
    isComing: true
  }
];

const HomeSection = () => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* landingPage */}
      <CarouselComponent
        imageArray={listData}
        delayAmount={7000}
        dotsCss="hidden sm:flex"
      />
      <ProductCategorySection />
      <ProductListingSection />
      <DiscountSection />
      <div className=" py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold  text-primary">
              EHS Management System
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <Link href={feature.href} key={feature.href}>
                <Card
                  className={cn(
                    'group h-full transition-all duration-300',
                    'bg-white hover:bg-gradient-to-b hover:from-white hover:to-gray-50',
                    'border border-gray-200 hover:border-primary/20',
                    'hover:shadow-lg hover:-translate-y-1',
                    'relative overflow-hidden',
                    'p-4 sm:p-6'
                  )}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 
                    rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"
                    />
                  </div>

                  <div className="relative">
                    {/* Icon & Title Section */}
                    <div className={cn('flex items-start gap-4', 'mb-6')}>
                      <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <Badge
                      variant="secondary"
                      className="mb-4 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {feature.stats}
                    </Badge>

                    {/* Features List */}
                    <div className={cn('flex flex-wrap items-center gap-3')}>
                      {feature.features.map((item, i) => (
                        <div
                          key={item + i}
                          className={cn(
                            'flex items-center gap-2 text-sm text-gray-600',
                            'group-hover:text-gray-900 transition-colors'
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div id="ehs-news">
        <EhsNewsListingSection />
      </div>
      <div className="mb-10">
        <WhoWeAreSection />
      </div>
    </div>
  );
};

export default HomeSection;
