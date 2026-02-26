import React from 'react';
import { Truck, Box, CheckCircle } from 'lucide-react';

const EquipmentBox = ({
  name,
  assigned,
  total,
  inTransit
}: {
  name?: string;
  assigned?: number;
  total?: number;
  inTransit?: number;
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out  cursor-pointer overflow-hidden">
      <div className=" p-4 border-b-2 ">
        <h3 className="text-xl font-bold text-center ">
          {name ?? 'Equipment'}
        </h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Box className=" text-primary" size={24} />
            <span className="font-bold">Total Available</span>
          </div>
          <span className="font-bold bg-primary px-5 rounded-3xl">
            {total ?? 0}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-primary" size={24} />
            <span className="font-bold">Assigned</span>
          </div>
          <span className="font-bold bg-primary px-5 rounded-3xl">
            {assigned ?? 0}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="text-primary" size={24} />
            <span className="font-bold">In Transit</span>
          </div>
          <span className="font-bold bg-primary px-5 rounded-3xl">
            {inTransit ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentBox;
