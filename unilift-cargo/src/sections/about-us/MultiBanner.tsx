import ASSETS from '@/assets';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const BANNER = [
  {
    img: ASSETS.IMG.AboutUs_PPE_Banner,
    title: 'Quality PPE Products',
    subtitle:
      'Our mission is to deliver top-tier personal protective equipment (PPE) designed for optimal safety, durability, and comfort. We offer a wide range of products suitable for various industries, ensuring protection in even the most demanding environments.'
  },
  {
    img: ASSETS.IMG.AboutUs_Real_Time_Tracking,
    title: 'Real-Time Equipment Tracking',
    subtitle:
      'Stay in control of your PPE with our advanced tracking system. Monitor usage, renewal dates, and expiry of equipment with ease. Never miss a crucial update and ensure your team is always equipped with the right gear.'
  },
  {
    img: ASSETS.IMG.AboutUs_Inventory,
    title: 'Inventory Management',
    subtitle:
      'Effortlessly manage your PPE inventory with our smart system. Track stock levels, assign equipment, and keep detailed records of who is using each item, ensuring streamlined operations and full compliance with safety regulations.'
  },
  {
    img: ASSETS.IMG.AboutUs_User_TDashboard,
    title: 'Empowering Safety Through Smart EHS',
    subtitle:
      'Our EHS Management System promotes a safer workplace with key tools like Toolbox Talks, Checklists, First Principle Analysis, and Incident Reporting—empowering teams to prevent hazards, ensure compliance, and foster a strong safety culture across your organization.'
  }
];
const MultiBanner = () => {
  return (
    <div className="flex flex-col items-center mb-[70px]">
      <h1 className="text-[1.625rem] md:text-[1.875rem] font-bold leading-[1.9669rem] md:leading-[2.2694rem] mb-[2.25rem] text-primary">
        ABOUT SAFEZY
      </h1>
      <div className=" px-[5.555vw] gap-[3.625rem] flex flex-col">
        {BANNER.map((item, index) => {
          const direction = index % 2;
          const directionCss =
            direction === 0
              ? 'left-1/2 md:left-[51px] -translate-x-1/2  md:-translate-x-0'
              : ' md:right-[51px] right-1/2 translate-x-1/2 md:translate-x-0 items-end';

          return (
            <div
              key={item.img.src}
              className="relative rounded-lg overflow-hidden h-80"
            >
              <div className="absolute inset-0 w-full h-full bg-transparentBlack md:bg-transparent z-20" />
              <div className="w-full h-full">
                <Image
                  src={item.img}
                  alt="Quality PPE Products"
                  className="z-10 object-cover h-full"
                  priority
                />
              </div>

              <div
                className={cn(
                  'flex w-[78.516%]  md:w-[60%] lg:w-[41.95%] flex-col gap-2 absolute top-1/2 transform -translate-y-1/2 z-30 text-white',
                  directionCss
                )}
              >
                <p className="text-center md:text-start font-bold w-full  text-2xl leading-[29.0496px]">
                  {item.title}
                </p>
                <p className="text-center  md:text-justify md:text-base text-sm  w-full leading-5">
                  {item.subtitle}
                </p>
              </div>
              {direction === 0 ? (
                <div className="hidden md:block absolute top-0 bg-left-banner-dark w-[70.46%] h-full z-10"></div>
              ) : (
                <div className="hidden md:block absolute top-0 right-0 w-[62.63%] bg-left-banner-dark h-full z-10 rotate-180"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiBanner;
