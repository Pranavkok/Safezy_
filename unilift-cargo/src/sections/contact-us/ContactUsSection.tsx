'use client';

import addContactUsDetails from '@/actions/guest-user/contact-us';
import ASSETS from '@/assets';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { Button } from '@/components/ui/button';
import { ContactUsType } from '@/types/contact.types';
import { ContactUsFormSchema } from '@/validations/contactUs/contactUs';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { sendContactedSafezyEmail } from '@/actions/email';
import { MailIcon, PhoneCall } from 'lucide-react';

const initialState = {
  fName: '',
  lName: '',
  email: '',
  phoneNumber: '',
  requirement: ''
};

const ContactUsSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactUsType>({
    resolver: zodResolver(ContactUsFormSchema),
    defaultValues: initialState
  });

  const onSubmit = async (data: ContactUsType) => {
    setIsLoading(true);
    const res = await addContactUsDetails(data);

    if (res.success) {
      await sendContactedSafezyEmail(
        data.fName,
        data.lName,
        data.cName,
        data.email,
        data.phoneNumber,
        data.requirement
      );
      setIsLoading(false);
      toast.success(res.message);
      reset();
    } else {
      setIsLoading(false);
      toast.error(res.message);
    }
  };

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-7 md:gap-[1.3125rem] w-full p-[2.25rem]  lg:p-[4.1563rem] pt-[3.3125rem]">
      <div className="flex flex-col border border-primary rounded-[.3125rem] p-7">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold text-center md:text-start md:text-[1.7781rem] text-xl leading-[2.1519rem] uppercase md:mt-[2.07rem] mt-[1.1875rem]">
            Talk to our sales team
          </h3>
          <div className="mt-[1.965rem] flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.0075rem] ">
              <div className="flex flex-col gap-[.6125rem]">
                <InputFieldWithLabel
                  type="text"
                  label="First Name"
                  className="bg-white "
                  errorText={errors.fName?.message}
                  {...register('fName')}
                />
              </div>
              <div className="flex flex-col gap-[.6125rem]">
                <InputFieldWithLabel
                  type="text"
                  label="Last Name"
                  className="bg-white"
                  errorText={errors.lName?.message}
                  {...register('lName')}
                />
              </div>
              <div className="flex flex-col gap-[.6125rem]">
                <InputFieldWithLabel
                  type="text"
                  label="Email"
                  className="bg-white"
                  errorText={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <div className="flex flex-col gap-[.6125rem]">
                <InputFieldWithLabel
                  type="text"
                  label="Phone no."
                  className="bg-white"
                  errorText={errors.phoneNumber?.message}
                  {...register('phoneNumber')}
                />
              </div>
              <div className="flex flex-col gap-[.6125rem] col-span-full">
                <InputFieldWithLabel
                  type="text"
                  label="Company Name"
                  className="bg-white"
                  errorText={errors.cName?.message}
                  {...register('cName')}
                />
              </div>
              <div className="flex flex-col gap-[.6125rem] col-span-full">
                <TextAreaWithLabel
                  type="text"
                  label="Your Requirements"
                  className="bg-white h-[11.0625rem]"
                  rows={7}
                  errorText={errors.requirement?.message}
                  {...register('requirement')}
                />
              </div>
            </div>
            <Button className=" rounded-full mt-[1.2rem] md:ml-auto mx-auto min-w-[19.89%] h-[2.3712rem ]">
              {isLoading && <ButtonSpinner />}
              {isLoading ? 'Submitting...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>
      <div className="border border-primary rounded-[.3125rem] p-[1.625rem] md:h-full h-fit flex flex-col ">
        <div className="relative w-full aspect-[3/2]">
          <Image
            src={ASSETS.IMG.Contact_Us}
            alt="contact us"
            className="rounded-[.5rem]"
            priority
          />
        </div>
        <div className="flex text-start flex-col gap-8 lg:mt-10 md:mt-[1.875rem] mt-[1.3125rem]">
          <div className="flex gap-[1.4375rem]">
            <PhoneCall className=" h-[1.8462rem] w-[2.375rem] -ml-[10px]" />
            <a
              href="tel:+918591307077"
              className="md:text-2xl text-base font-medium hover:text-primary text-black"
            >
              +91 8591307077
            </a>
          </div>
          <div className="flex gap-[1.4375rem]">
            <MailIcon className="h-[1.875rem] w-[2.375rem] -ml-[10px]" />
            <a
              href="mailto:support@safezy.in"
              className="md:text-2xl text-base font-medium hover:text-primary text-black"
            >
              support@safezy.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsSection;
