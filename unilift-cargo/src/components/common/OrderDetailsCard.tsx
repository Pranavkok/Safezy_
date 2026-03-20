import React from 'react';

interface OrderDetailItem {
  label: string;
  value: string | number;
}

interface OrderDetailsCardProps {
  details: OrderDetailItem[];
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ details }) => {
  return (
    <div className="p-4 border-2 rounded-md ">
      {details.map((item, index) => (
        <div key={index} className="flex justify-between mb-2">
          <span className="font-semibold whitespace-nowrap pr-5">
            {item.label}
          </span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderDetailsCard;
