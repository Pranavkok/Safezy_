import React from 'react';
import { Button } from '@/components/ui/button';
import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';

const Solutions = () => {
  return (
    <div className="flex flex-col items-center pt-[70px] pb-[2.6563rem] px-[5.555vw]">
      <h3 className="font-bold text-[1.5rem] leading-[1.8156rem] md:text-[1.875rem] md:leading-[2.2694rem] text-primary">
        Let’s Talk About Solutions
      </h3>
      <p className="text-sm text-justify  md:text-[22.0304px] leading-6 md:leading-[31.2096px] mt-[1.8125rem] mb-9">
        At Safezy, safety isn’t just a priority, it’s our core value. We believe
        that every workplace deserves top-tier protection, which is why we offer
        a wide range of personal protective equipment (PPE) tailored to meet the
        needs of various industries. From head-to-toe protection, we provide
        reliable solutions that ensure workers stay safe, productive, and
        compliant with industry regulations. Our expert team is here to guide
        you in choosing the right gear for your specific environment, ensuring
        the highest standards of safety at every step. Let’s talk about
        safeguarding your workforce and building a safer tomorrow.
      </p>
      <div className="flex gap-[1.0625rem]">
        <Link href={AppRoutes.PRODUCT_LISTING}>
          <Button className="rounded-full">Buy Now</Button>
        </Link>
        <Link href={AppRoutes.CONTACT_US}>
          <Button className="rounded-full">Enquire now</Button>
        </Link>
      </div>
    </div>
  );
};

export default Solutions;
