import React, { useCallback, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Images, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
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

const MAX_PREVIEW_THUMBNAILS = 4;

const ImageUploadSection = ({ prevImages }: ImageUploadSectionPropsType) => {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const currentImages = watchImages || [];
      const newImages = Array.from(files);
      const combinedImages = [...currentImages, ...newImages];
      setValue('image', combinedImages as File[]);
    },
    [watchImages, setValue]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(files);
      // Reset input so same file can be re-added after removal
      event.target.value = '';
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

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

  // Build a flat list of all images (prev + new) for thumbnail strip
  const prevThumbItems = (prevImages || []).map(img => ({
    type: 'prev' as const,
    id: img.id,
    src: img.image_url
  }));
  const newThumbItems = (watchImages || []).map((file, index) => ({
    type: 'new' as const,
    index,
    src: URL.createObjectURL(file),
    name: file.name
  }));
  const allThumbs = [...prevThumbItems, ...newThumbItems];
  const visibleThumbs = allThumbs.slice(0, MAX_PREVIEW_THUMBNAILS);
  const extraCount = allThumbs.length - MAX_PREVIEW_THUMBNAILS;

  const renderImagePreviews = () => {
    if (
      (!watchImages || watchImages.length === 0) &&
      (!prevImages || prevImages.length === 0)
    ) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
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
      <label className="capitalize font-medium text-sm" htmlFor="images">
        Upload Images
        <span className="ml-[2px] text-red-500">*</span>
        <span className="ml-2 text-xs text-gray-400 font-normal normal-case">
          (JPG, PNG, WEBP · Max 10 MB each · Multiple allowed)
        </span>
      </label>

      {/* Hidden file input */}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
      />

      {/* Drag-and-drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-6 px-4 select-none
          ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
      >
        <Upload
          className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-gray-400'}`}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {isDragging
              ? 'Drop images here'
              : 'Drag & drop images or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            You can select multiple images at once
          </p>
        </div>
      </div>

      {/* Thumbnail strip + View dialog */}
      {imageCount > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {/* Small thumbnails */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {visibleThumbs.map((thumb, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 shrink-0 bg-gray-100"
              >
                <Image
                  width={40}
                  height={40}
                  src={thumb.src}
                  alt={`thumb-${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gray-500">
                  +{extraCount}
                </span>
              </div>
            )}
          </div>

          {/* View / manage button */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 gap-1.5"
              >
                <Images className="w-4 h-4" />
                View all ({imageCount})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white">
              <DialogHeader>
                <DialogTitle>
                  Uploaded Images ({imageCount})
                </DialogTitle>
              </DialogHeader>
              {renderImagePreviews()}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {errors.image && (
        <p className="text-sm text-red-500">{errors.image.message as string}</p>
      )}{' '}
    </div>
  );
};

export default ImageUploadSection;
