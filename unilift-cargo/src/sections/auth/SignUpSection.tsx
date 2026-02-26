'use client';
// External Libraries
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

// Internal Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';
import { MultiSelect } from '@/components/inputs-fields/MultiSelect';

// Constants
import {
  GEOGRAPHICAL_LOCATIONS_OPTIONS,
  INDUSTRIES_SERVED_OPTIONS,
  TOTAL_NUMBER_OF_WORKERS_OPTIONS,
  TYPES_OF_SERVICES_PROVIDED_OPTIONS
} from '@/constants/contractor';

// Types
import { SignUpType } from '@/types/auth.types';

// Validations
import { SignUpFormSchema } from '@/validations/auth/sign-up';

// Actions
import { signUpUser } from '@/actions/auth';
import { AppRoutes } from '@/constants/AppRoutes';

const initialState = {
  fName: '',
  lName: '',
  cName: '',
  contactNumber: '',
  email: '',
  noOfWorkers: '',
  locations: [{ id: Date.now().toString(), value: '' }],
  companies: [{ id: Date.now().toString(), value: '' }],
  password: '',
  typeOfServicesProvided: [],
  industriesServed: []
};

const SignUpSection = () => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignUpType>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: initialState
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const watchIndustriesServed = watch('industriesServed');
  const watchTypeOfServicesProvided = watch('typeOfServicesProvided');

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation
  } = useFieldArray({
    control,
    name: 'locations'
  });

  const {
    fields: companyFields,
    append: appendCompany,
    remove: removeCompany
  } = useFieldArray({
    control,
    name: 'companies'
  });

  const addLocation = () =>
    appendLocation({ id: Date.now().toString(), value: '' });
  const addCompany = () =>
    appendCompany({ id: Date.now().toString(), value: '' });

  const onSubmit = async (data: SignUpType) => {
    setLoading(true);
    const res = await signUpUser(data);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
      if (res.redirectPath) router.push(res.redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid lg:grid-cols-2 lg:gap-x-4">
        <InputFieldWithLabel
          type="text"
          label="First Name"
          required
          errorText={errors.fName?.message as string}
          {...register('fName')}
        />
        <InputFieldWithLabel
          type="text"
          label="Last Name"
          required
          errorText={errors.lName?.message}
          {...register('lName')}
        />
        <InputFieldWithLabel
          type="text"
          label="Company Name"
          required
          errorText={errors.cName?.message}
          {...register('cName')}
        />
        <InputFieldWithLabel
          type="tel"
          label="Contact No."
          maxLength={10}
          minLength={10}
          errorText={errors.contactNumber?.message}
          required
          {...register('contactNumber')}
        />
        <InputFieldWithLabel
          type="text"
          label="Email Address"
          required
          errorText={errors.email?.message}
          {...register('email')}
        />

        <Controller
          control={control}
          name="noOfWorkers"
          render={({ field }) => (
            <SelectWithLabel
              label="Total No. of Workers"
              name="noOfWorkers"
              options={TOTAL_NUMBER_OF_WORKERS_OPTIONS}
              errorText={errors.noOfWorkers?.message}
              onChange={field.onChange}
              value={field.value}
              required
            />
          )}
        />

        <div className="space-y-2 pb-5">
          <label className="capitalize">
            Type of Service Provided
            <span className="ml-[2px] text-red-500">*</span>
          </label>
          <Controller
            name="typeOfServicesProvided"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={TYPES_OF_SERVICES_PROVIDED_OPTIONS}
                onValueChange={val => {
                  field.onChange(val);
                }}
                variant={'inverted'}
              />
            )}
          />
          {errors.typeOfServicesProvided?.message && (
            <div className="text-sm text-red-500">
              {errors.typeOfServicesProvided?.message}
            </div>
          )}
          {watchTypeOfServicesProvided.includes('other') && (
            <InputFieldWithLabel
              label="Other"
              required
              errorText={errors.typeOfServicesProvidedOther?.message}
              {...register('typeOfServicesProvidedOther')}
            />
          )}
        </div>

        <div className="space-y-2 pb-5">
          <label className="capitalize">
            Industries Served Type of Service Provided
            <span className="ml-[2px] text-red-500">*</span>
          </label>
          <Controller
            name="industriesServed"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={INDUSTRIES_SERVED_OPTIONS}
                onValueChange={field.onChange}
                value={field.value}
                variant={'inverted'}
              />
            )}
          />{' '}
          {errors.industriesServed?.message && (
            <div className="text-sm text-red-500">
              {errors.industriesServed?.message}
            </div>
          )}
          {watchIndustriesServed.includes('other') && (
            <InputFieldWithLabel
              label="Other"
              required
              errorText={errors.industriesServedOther?.message}
              {...register('industriesServedOther')}
            />
          )}
        </div>

        <div className="space-y-2 pb-5">
          <label className="capitalize">
            Locations Where Services Provided
          </label>
          <span className="ml-[2px] text-red-500">*</span>
          {locationFields.map((field, index) => {
            return (
              <>
                <div key={field.id} className="flex gap-1 items-center">
                  <Input
                    type="text"
                    {...register(`locations.${index}.value`, {
                      required: true
                    })}
                  />
                  <Button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="font-medium w-40"
                    variant={'outline'}
                    disabled={locationFields.length === 1}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
                {errors.locations?.[index]?.value && (
                  <p className="text-red-500 text-sm pt-0">
                    {errors.locations[index].value.message}
                  </p>
                )}{' '}
              </>
            );
          })}
          <Button
            type="button"
            onClick={() => addLocation()}
            className="font-bold capitalize text-sm w-40"
            variant={'outline'}
          >
            <Plus className="h-4 w-4 mr-2" /> Add More
          </Button>
        </div>

        <div className="space-y-2 pb-5">
          <label className="capitalize">
            Companies Where Services Provided
          </label>
          {companyFields.map((field, index) => (
            <div key={field.id} className="flex gap-1 items-center">
              <Input type="text" {...register(`companies.${index}.value`)} />
              <Button
                type="button"
                onClick={() => removeCompany(index)}
                className="font-medium w-40"
                variant={'outline'}
                disabled={companyFields.length === 1}
              >
                <X className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addCompany()}
            className="font-bold capitalize text-sm w-40"
            variant={'outline'}
          >
            <Plus className="h-4 w-4 mr-2" /> Add More
          </Button>
        </div>

        <div className="space-y-2 pb-5">
          <label className="capitalize">
            Sectors
            <span className="ml-[2px] text-red-500">*</span>
          </label>
          <Controller
            name="geographicalLocation"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={GEOGRAPHICAL_LOCATIONS_OPTIONS}
                onValueChange={val => {
                  field.onChange(val);
                }}
                variant={'inverted'}
              />
            )}
          />
          {errors.geographicalLocation?.message && (
            <div className="text-sm text-red-500">
              {errors.geographicalLocation?.message}
            </div>
          )}
        </div>

        <PasswordFieldWithLabel
          id="password"
          label="Password"
          errorText={errors.password?.message}
          {...register('password')}
          required
        />

        <div />
        <div className="flex flex-col  w-full">
          <PasswordFieldWithLabel
            id="confirmPassword"
            label="Confirm Password"
            errorText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            removeBottomPadding
            required
          />

          <p className="text-xs pt-2">
            By Signing up, you agree to our{' '}
            <span className="text-[#2A39C1] cursor-pointer underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-[#2A39C1] cursor-pointer underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
      <div className="pt-5 grid place-content-center">
        <Button
          type="submit"
          className="w-full lg:w-[390px] "
          disabled={loading}
        >
          {loading && <ButtonSpinner />}
          {loading ? 'Submitting...' : 'Create an account'}
        </Button>
        <Button
          type={'button'}
          variant={'link'}
          onClick={() => router.push(AppRoutes.LOGIN)}
        >
          Already have an account?
        </Button>
      </div>
    </form>
  );
};

export default SignUpSection;
