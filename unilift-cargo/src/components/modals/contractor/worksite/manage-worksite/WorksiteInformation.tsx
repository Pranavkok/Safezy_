import React from 'react';
import { AddWorksiteType, UpdateWorksiteType } from '@/types/worksite.types';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

export type FieldType = {
  label: string;
  name: keyof AddWorksiteType | keyof UpdateWorksiteType;
  type: 'text' | 'email' | 'tel';
  required: boolean;
};

export const worksiteFields: FieldType[] = [
  { label: 'Site Name', name: 'site_name', type: 'text', required: true },
  { label: 'Email Address', name: 'email', type: 'email', required: true },
  { label: 'Contact No', name: 'contact_number', type: 'tel', required: true },
  {
    label: 'Site In-Charge',
    name: 'site_manager',
    type: 'text',
    required: true
  }
];

export const locationFields: FieldType[] = [
  { label: 'Address 1', name: 'address1', type: 'text', required: true },
  { label: 'Address 2', name: 'address2', type: 'text', required: false },
  { label: 'Locality', name: 'locality', type: 'text', required: false },
  { label: 'City', name: 'city', type: 'text', required: true },
  { label: 'Zipcode', name: 'zipcode', type: 'text', required: true },
  { label: 'State', name: 'state', type: 'text', required: true },
  { label: 'Country', name: 'country', type: 'text', required: true }
];

type WorksiteInformationPropsType = {
  isUpdate?: boolean;
  register: UseFormRegister<AddWorksiteType | UpdateWorksiteType>;
  errors: FieldErrors<AddWorksiteType | UpdateWorksiteType>;
};

function WorksiteInformation({
  register,
  errors
}: WorksiteInformationPropsType) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 overflow-y-scroll max-h-[75vh] p-1">
      {worksiteFields.map(field => (
        <InputFieldWithLabel
          key={field.name}
          label={field.label}
          type={field.type}
          required={field.required}
          errorText={errors[field.name]?.message as string}
          {...register(field.name)}
        />
      ))}

      {locationFields.map(field => (
        <InputFieldWithLabel
          key={field.name}
          label={field.label}
          type={field.type}
          required={field.required}
          errorText={errors[field.name]?.message as string}
          {...register(field.name)}
        />
      ))}
    </div>
  );
}

export default WorksiteInformation;
