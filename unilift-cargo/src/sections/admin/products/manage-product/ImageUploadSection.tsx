import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { deleteProductImage } from '@/actions/admin/product';

type ImageUploadSectionPropsType = {
  prevImages?: {
    id: number;
    image_url: string;
  }[];
};

const ImageUploadSection = ({ prevImages }: ImageUploadSectionPropsType) => {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchImages: File[] = watch('image') || [];
  const [isDeleting, setIsDeleting] = useState<{
    id: number | null;
    isLoading: boolean;
  }>({
    id: null,
    isLoading: false
  });

  const watchImageCount = watchImages ? watchImages.length : 0;
  const prevImageCount = prevImages ? prevImages.length : 0;
  const imageCount = watchImageCount + prevImageCount;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentImages = watchImages || [];
      const newImages = Array.from(files);

      const combinedImages = [...currentImages, ...newImages];

      setValue('image', combinedImages as File[]);
    }
  };

  const handleDeleteImage = (indexToRemove: number) => {
    if (watchImages && watchImages.length > 0) {
      const updatedImages = watchImages.filter(
        (_, index) => index !== indexToRemove
      );
      setValue('image', updatedImages);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderImagePreviews = () => {
    if (
      (!watchImages || watchImages.length === 0) &&
      (!prevImages || prevImages.length === 0)
    ) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <ImagePlus className="w-12 h-12 mb-2" />
          <p>No images uploaded</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-end mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
          >
            <ImagePlus className="mr-2 w-4 h-4" /> Add More
          </Button>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 
                      max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
        >
          {prevImages?.map((image, index) => (
            <div key={`prev-${image.id}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-xl shadow-md border">
                <Image
                  width={200}
                  height={200}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  src={image.image_url}
                  alt={`Previous Image ${index + 1}`}
                />
              </div>
              <Button
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 transition-all duration-300 shadow-md hover:shadow-lg"
                title="Delete Previous Image"
                onClick={async () => {
                  setIsDeleting({ id: image.id, isLoading: true });
                  await deleteProductImage(image.id);
                  setIsDeleting({ id: null, isLoading: false });
                }}
                type="button"
              >
                {isDeleting.id === image.id && isDeleting.isLoading ? (
                  <Loader2 className="text-red-500 w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="text-red-500 w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
          {watchImages &&
            watchImages.map((file, index) => {
              const objectUrl = URL.createObjectURL(file);

              return (
                <div key={index} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-xl shadow-md border">
                    <Image
                      width={200}
                      height={200}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      src={objectUrl}
                      alt={`Uploaded Image ${index + 1}`}
                      onLoad={() => URL.revokeObjectURL(objectUrl)}
                      onError={() => URL.revokeObjectURL(objectUrl)}
                    />
                  </div>

                  <Button
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Delete Image"
                    onClick={() => handleDeleteImage(index)}
                    type="button"
                  >
                    <Trash2 className="text-red-500 w-4 h-4" />
                  </Button>
                </div>
              );
            })}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-2">
      <label className="capitalize" htmlFor={'images'}>
        Upload Images
        <span className="ml-[2px] text-red-500">*</span>
      </label>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
      />
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={triggerFileInput}>
          <ImagePlus className="mr-2 w-4 h-4" /> Click to upload
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={imageCount === 0}
            >
              View Images ({imageCount})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white">
            <DialogHeader>
              <DialogTitle>Uploaded Images Preview</DialogTitle>
            </DialogHeader>
            {renderImagePreviews()}
          </DialogContent>
        </Dialog>
      </div>
      {errors.image && (
        <p className="text-sm text-red-500">{errors.image.message as string}</p>
      )}{' '}
    </div>
  );
};

export default ImageUploadSection;
