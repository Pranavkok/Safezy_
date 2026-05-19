'use client';

import { submitComplaint } from '@/actions/guest-user/complaint';
import ASSETS from '@/assets';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { Button } from '@/components/ui/button';
import {
  ComplaintFormSchema,
  ComplaintFormType
} from '@/validations/complaint/complaint';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Clock, MailIcon, PhoneCall } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const initialState: ComplaintFormType = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

const WHAT_TO_EXPECT = [
  {
    icon: <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
    text: 'Your complaint will be acknowledged within 24 hours.'
  },
  {
    icon: <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
    text: 'Our team will investigate and respond within 3–5 business days.'
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
    text: 'For urgent issues, please call us directly.'
  }
];

const ComplaintSection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ComplaintFormType>({
    resolver: zodResolver(ComplaintFormSchema),
    defaultValues: initialState
  });

  const onSubmit = async (data: ComplaintFormType) => {
    setIsLoading(true);
    const res = await submitComplaint(data);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      reset();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-7 md:gap-[1.3125rem] w-full p-[2.25rem] lg:p-[4.1563rem] pt-[3.3125rem]">
      {/* Left — Form */}
      <div className="flex flex-col border border-primary rounded-[.3125rem] p-7">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-3 md:mt-[2.07rem] mt-[1.1875rem]">
            <AlertCircle className="w-7 h-7 text-primary shrink-0" />
            <h3 className="font-bold md:text-[1.7781rem] text-xl leading-[2.1519rem] uppercase">
              Submit a Complaint
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            We take every concern seriously. Fill in the details below and our team will get back to you promptly.
          </p>

          <div className="mt-[1.965rem] flex flex-col gap-[1.0075rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.0075rem]">
              <div className="flex flex-col gap-[.6125rem]">
                <InputFieldWithLabel
                  type="text"
                  label="Name"
                  className="bg-white"
                  errorText={errors.name?.message}
                  {...register('name')}
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
            </div>

            <div className="flex flex-col gap-[.6125rem]">
              <InputFieldWithLabel
                type="text"
                label="Subject"
                className="bg-white"
                errorText={errors.subject?.message}
                {...register('subject')}
              />
            </div>

            <div className="flex flex-col gap-[.6125rem]">
              <TextAreaWithLabel
                type="text"
                label="Message"
                className="bg-white h-[11.0625rem]"
                rows={7}
                errorText={errors.message?.message}
                {...register('message')}
              />
            </div>

            <Button
              type="submit"
              className="rounded-full mt-[1.2rem] md:ml-auto mx-auto min-w-[19.89%] h-[2.3712rem]"
            >
              {isLoading && <ButtonSpinner />}
              {isLoading ? 'Submitting...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right — Info Panel */}
      <div className="border border-primary rounded-[.3125rem] p-[1.625rem] md:h-full h-fit flex flex-col">
        <div className="relative w-full aspect-[3/2]">
          <Image
            src={ASSETS.IMG.Contact_Us}
            alt="complaint support"
            className="rounded-[.5rem] object-cover"
            fill
            priority
          />
        </div>

        <div className="flex flex-col gap-5 lg:mt-8 md:mt-6 mt-5">
          <h4 className="font-bold text-lg uppercase">What to Expect</h4>
          <div className="flex flex-col gap-3">
            {WHAT_TO_EXPECT.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.icon}
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-5 flex flex-col gap-4">
            <div className="flex gap-[1.4375rem]">
              <PhoneCall className="h-[1.8462rem] w-[2.375rem] -ml-[10px]" />
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
                href="mailto:admin@safezy.in"
                className="md:text-2xl text-base font-medium hover:text-primary text-black"
              >
                admin@safezy.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintSection;
