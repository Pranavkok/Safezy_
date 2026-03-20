import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { AppRoutes } from '@/constants/AppRoutes';
import EyeIcon from '@/components/svgs/EyeIcon';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ComplaintsModalProps = {
  name: string;
  email: string;
  imageUrl: string | null;
  description: string;
  contact: string;
  order_id: string;
};

const ComplaintsModal = ({
  name,
  email,
  imageUrl,
  description,
  contact,
  order_id
}: ComplaintsModalProps) => {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <EyeIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300 " />
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md w-full bg-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
          <DialogDescription>
            Details of the complaint submitted by the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="w-full flex justify-center">
            <Image
              height={400}
              width={400}
              src={imageUrl as string}
              alt={`${name}'s complaint`}
              className="rounded-md max-h-48 w-auto object-cover"
            />
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex flex-col">
              <span className="font-semibold">Name:</span>
              <span>{name}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Email:</span>
              <span>{email}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Contact No:</span>
              <span>{contact}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold mb-1">Description:</span>
              <p className="text-gray-700">{description}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-center sm:justify-end">
          <Button
            type="submit"
            className="h-9 font-bold lg:min-w-32"
            variant="default"
            onClick={() => router.push(AppRoutes.ADMIN_ORDER_DETAILS(order_id))}
          >
            View Order Details
          </Button>

          <DialogClose asChild>
            <Button type="button" variant="default">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintsModal;
