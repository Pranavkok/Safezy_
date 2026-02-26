'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import {
  EhsNewsFormSchema,
  EhsNewsFormType
} from '@/sections/admin/ehs/ehs-news/EhsAddUpdateSection';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { addEhsNews } from '@/actions/admin/ehs/news';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';

type AddNewsModalProps = {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
};

const AddNewsModal: React.FC<AddNewsModalProps> = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EhsNewsFormType>({
    resolver: zodResolver(EhsNewsFormSchema),
    defaultValues: {}
  });

  const onSubmit = async (data: EhsNewsFormType) => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.linkpreview.net/?q=${encodeURIComponent(data.link)}`,
        {
          headers: {
            'X-Linkpreview-Api-Key':
              process.env.NEXT_PUBLIC_LINK_PREVIEW_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Link preview API error: ${errorText}`);
      }

      const previewData = await response.json();

      if (!previewData || !previewData.title || !previewData.image) {
        toast.error('Failed to fetch link preview. Please check the URL.');
        setLoading(false);
        return;
      }

      const payload = {
        link: data.link,
        title: previewData.title,
        description: previewData.description || '',
        image: previewData.image
      };

      const result = await addEhsNews(payload);

      if (result.success) {
        router.push(
          AppRoutes.ADMIN_EHS_NEWS_SAVE(result.data?.[0].id as number)
        );
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={state => setIsOpen(state)}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add Link to Scrap Data</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-2 mt-4">
            <InputFieldWithLabel
              type="url"
              label="Resource Link"
              errorText={errors.link?.message}
              required
              {...register('link')}
            />
          </div>

          <DialogFooter className="flex justify-center sm:justify-end gap-2 ">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Scraping...
                </span>
              ) : (
                'Scrap It'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewsModal;
