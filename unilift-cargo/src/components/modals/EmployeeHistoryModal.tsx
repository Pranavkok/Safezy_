'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import EyeIcon from '@/components/svgs/EyeIcon';
import { fetchEmployeeHistory } from '@/actions/contractor/employee';
import { EmployeeEquipmentHistory } from '@/types/employee.types';
import { formattedDate } from '@/lib';
import Spinner from '../loaders/Spinner';

const EmployeeHistoryModal = ({ employeeId }: { employeeId: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: history = [], isLoading } = useQuery<
    EmployeeEquipmentHistory[]
  >({
    queryKey: ['employeeHistory', employeeId],
    queryFn: async () => {
      const res = await fetchEmployeeHistory(employeeId);
      if (!res.success) {
        toast.error(res.message);
        return [];
      }
      return res.data as EmployeeEquipmentHistory[];
    },
    enabled: isOpen
  });

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center px-2 cursor-pointer">
          <EyeIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300" />
        </div>
      </DialogTrigger>

      <DialogContent className="bg-white w-[95%] max-w-5xl rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg text-start sm:text-xl md:text-2xl font-semibold text-gray-800">
            Employee Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              <Spinner />
            </p>
          ) : (
            <div className="relative w-full h-[400px]">
              <div className="absolute inset-0 border border-gray-300 rounded-lg overflow-hidden">
                <div className="h-full overflow-auto">
                  <table className="min-w-[800px] w-full divide-y divide-gray-300 text-xs sm:text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PPE
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Date
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiration Date
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining Life
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expected Renewal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {history?.length > 0 ? (
                        history?.map((item, i) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {item.product_name}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {formattedDate(item.assigned_date)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {formattedDate(item.expiration_date)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {item.remaining_life} days
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                              {formattedDate(item.renewal_date)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-3 text-center text-gray-500"
                          >
                            No history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center sm:justify-end mt-4 sm:mt-5">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeHistoryModal;
