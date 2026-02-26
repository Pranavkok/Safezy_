'use client';

import React from 'react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';
import { MultiSelect } from '@/components/inputs-fields/MultiSelect';
import {
  GEOGRAPHICAL_LOCATIONS_OPTIONS,
  INDUSTRIES_SERVED_OPTIONS,
  TOTAL_NUMBER_OF_WORKERS_OPTIONS,
  TYPES_OF_SERVICES_PROVIDED_OPTIONS
} from '@/constants/contractor';
import { ContractorType } from '@/types/index.types';
import { UpdateProfileType } from '@/types/contractor/profile';
import { UpdateProfileFormSchema } from '@/validations/contractor/update-profile';
import { updateContractorDetails } from '@/actions/contractor/contractor';
import DeleteCustomerAccount from '@/components/modals/contractor/DeleteCustomerAccount';

const UpdateProfileSection = ({
  profileDetails
}: {
  profileDetails: ContractorType;
}) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<UpdateProfileType>({
    resolver: zodResolver(UpdateProfileFormSchema),
    defaultValues: {
      fName: profileDetails.first_name,
      lName: profileDetails.last_name,
      cName: profileDetails.company_name as string,
      contactNumber: profileDetails.contact_number,
      email: profileDetails.email,
      noOfWorkers: profileDetails.total_workers as string,
      locations: profileDetails.locations_served as {
        id: string;
        value: string;
      }[],
      companies: profileDetails.companies_served as {
        id: string;
        value: string;
      }[],
      typeOfServicesProvided: profileDetails.service_type as string[],
      industriesServed: profileDetails.industries_type as string[],
      geographicalLocation: profileDetails.geographical_location as string[],
      industriesServedOther: profileDetails?.other_industries_type
        ? profileDetails?.other_industries_type
        : undefined,
      typeOfServicesProvidedOther: profileDetails?.other_services_type
        ? profileDetails?.other_services_type
        : undefined
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

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

  const onSubmit = async (data: UpdateProfileType) => {
    setLoading(true);
    const res = await updateContractorDetails(profileDetails.id, data);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className=" mb-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 my-2 font-bold">
        <div className="flex gap-1 mr-2">
          <p>Customer Code:</p>
          <p className="text-primary">{profileDetails?.user_unique_code}</p>
        </div>
        <Button
          variant="destructive"
          className="font-extrabold"
          onClick={() => setOpenDeleteModal(true)}
        >
          DELETE ACCOUNT
        </Button>
      </div>

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
            errorText={errors.lName?.message as string}
            {...register('lName')}
          />
          <InputFieldWithLabel
            type="text"
            label="Company Name"
            required
            errorText={errors.cName?.message as string}
            {...register('cName')}
          />
          <InputFieldWithLabel
            type="tel"
            label="Contact No."
            maxLength={10}
            minLength={10}
            pattern="[0-9]*"
            errorText={errors.contactNumber?.message as string}
            required
            {...register('contactNumber')}
            disabled
          />
          <InputFieldWithLabel
            type="text"
            label="Email Address"
            required
            errorText={errors.email?.message as string}
            {...register('email')}
            disabled
          />

          <Controller
            control={control}
            name="noOfWorkers"
            render={({ field }) => (
              <SelectWithLabel
                label="Total No. of Workers"
                name="noOfWorkers"
                options={TOTAL_NUMBER_OF_WORKERS_OPTIONS}
                errorText={errors.noOfWorkers?.message as string}
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
                  defaultValue={profileDetails.service_type as string[]}
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
                {errors.typeOfServicesProvided?.message as string}
              </div>
            )}
            {watchTypeOfServicesProvided?.includes('other') && (
              <InputFieldWithLabel
                label="Other"
                required
                errorText={
                  errors.typeOfServicesProvidedOther?.message as string
                }
                {...register('typeOfServicesProvidedOther')}
              />
            )}
          </div>

          <div className="space-y-2 pb-5">
            <label className="capitalize">
              Industries Served<span className="ml-[2px] text-red-500">*</span>
            </label>
            <Controller
              name="industriesServed"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  defaultValue={
                    (profileDetails.industries_type as string[]) || []
                  }
                  options={INDUSTRIES_SERVED_OPTIONS}
                  onValueChange={field.onChange}
                  value={field.value}
                  variant={'inverted'}
                />
              )}
            />{' '}
            {errors.industriesServed?.message && (
              <div className="text-sm text-red-500">
                {errors.industriesServed?.message as string}
              </div>
            )}
            {watchIndustriesServed?.includes('other') && (
              <InputFieldWithLabel
                label="Other"
                required
                errorText={errors.industriesServedOther?.message as string}
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
              Geographical Location
              <span className="ml-[2px] text-red-500">*</span>
            </label>
            <Controller
              name="geographicalLocation"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  defaultValue={
                    (profileDetails.geographical_location as string[]) || []
                  }
                  options={GEOGRAPHICAL_LOCATIONS_OPTIONS}
                  onValueChange={field.onChange}
                  value={field.value}
                  variant={'inverted'}
                />
              )}
            />{' '}
            {errors.geographicalLocation?.message && (
              <div className="text-sm text-red-500">
                {errors.geographicalLocation?.message}
              </div>
            )}
          </div>
        </div>

        <div className="pt-5 lg:grid lg:place-content-end">
          <Button
            type="submit"
            className="w-full lg:w-[390px]"
            disabled={loading}
          >
            {loading && <ButtonSpinner />}
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <DeleteCustomerAccount
          open={openDeleteModal}
          setIsOpen={setOpenDeleteModal}
          id={profileDetails.id}
        />
      </form>
    </div>
  );
};

export default UpdateProfileSection;
