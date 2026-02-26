'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getToolboxTopicUserDetails } from '@/actions/admin/ehs/toolbox-talk';
import { EyeIcon } from '@/components/svgs';
import Spinner from '@/components/loaders/Spinner';

const ToolboxTalkUserDetailsModal = ({
  toolboxTalkId,
  topicName
}: {
  toolboxTalkId: number;
  topicName: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: response,
    error,
    isFetching
  } = useQuery({
    queryKey: ['toolboxUser', isOpen],
    queryFn: () => getToolboxTopicUserDetails(toolboxTalkId),
    enabled: isOpen,
    refetchOnWindowFocus: false
  });

  const isDataValid = response?.success && response.data;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="hover:bg-transparent">
          <EyeIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300 " />
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg w-full bg-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{topicName}</DialogTitle>
          <DialogDescription>
            Details of the user who completed this Toolbox Talk.
          </DialogDescription>
        </DialogHeader>

        {isFetching && (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isFetching && (!isDataValid || error) && (
          <div className="flex items-center justify-center">No users found</div>
        )}

        {!isFetching && isDataValid && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {response.data.map((user, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div className="flex items-center gap-1 text-gray-900 font-medium">
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-sm text-gray-600">[{user.email}]</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Session Date: {new Date(user.sessionDate).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="justify-center sm:justify-end">
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

export default ToolboxTalkUserDetailsModal;
