'use client';

import { submitComplaint } from '@/actions/guest-user/complaint';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { Button } from '@/components/ui/button';
import {
  ComplaintFormSchema,
  ComplaintFormType
} from '@/validations/complaint/complaint';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const initialState: ComplaintFormType = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

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
    <div className="flex justify-center w-full p-[2.25rem] lg:p-[4.1563rem] pt-[3.3125rem]">
      <div className="w-full max-w-2xl border border-primary rounded-[.3125rem] p-7">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold text-center md:text-start md:text-[1.7781rem] text-xl leading-[2.1519rem] uppercase md:mt-[2.07rem] mt-[1.1875rem]">
            Submit a Complaint
          </h3>
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
            <Button className="rounded-full mt-[1.2rem] md:ml-auto mx-auto min-w-[19.89%] h-[2.3712rem]">
              {isLoading && <ButtonSpinner />}
              {isLoading ? 'Submitting...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintSection;
