import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { useFormContext } from 'react-hook-form';

const MediaUploadSection = () => {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div>
      <InputFieldWithLabel
        type="file"
        className="cursor-pointer"
        label="Training Video for right use"
        accept="video/*"
        {...register('trainingVideo')}
        errorText={errors.trainingVideo?.message as string}
      />
    </div>
  );
};

export default MediaUploadSection;
