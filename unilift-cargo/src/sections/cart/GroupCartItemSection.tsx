import { Badge } from '@/components/ui/badge';
import CartItemSection from './CartItemSection';
import { getProductCategoryLabel } from '@/utils';
import { GroupedCartItemType } from '@/hooks/useCartCalculations';
import Image from 'next/image';
import Link from 'next/link';

type GroupedCartItemProps = {
  group: GroupedCartItemType;
};

const GroupedCartItemSection: React.FC<GroupedCartItemProps> = ({ group }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm ">
    {/* Header Section */}
    <div className="p-4 md:p-6 space-y-4 md:space-y-0">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        {/* Image Section */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={group.items[0].product.image}
            width={1024}
            height={1024}
            alt={group.items[0].product.name}
            className="w-32 h-32 md:w-28 md:h-28 rounded-lg object-cover border-2 border-gray-100"
          />
        </div>

        {/* Content Section */}
        <div
          className="flex flex-col md:flex-row flex-grow justify-between space-y-4 md:space-y-0 
                      mt-4 md:mt-0 text-center md:text-left"
        >
          {/* Product Details */}
          <div className="space-y-2 flex flex-col">
            <Link
              href={`/products/${group.id}`}
              className="font-semibold text-gray-900 text-xl md:text-2xl leading-tight hover:text-primary"
            >
              {group.name}
            </Link>
            <Badge
              variant="outline"
              className="inline-flex items-center px-3 py-1 bg-gray-50 border-gray-200
                       text-gray-700 text-sm font-medium rounded-full hover:bg-gray-100 
                       transition-colors w-fit"
            >
              {getProductCategoryLabel(group.category)}
            </Badge>
            {/* {group.items[0]?.product.leadTimeTiers[0]?.days && (
              <p className="text-sm text-gray-500 font-medium">
                Expected Delivery:{' '}
                {getProductLeadTimeFromLeadTimeTiers(
                  group.totalQuantity,
                  group.items[0].product.leadTimeTiers
                )}{' '}
                Days{' '}
              </p>
            )}{" "} */}
          </div>

          {/* Price Details */}
          <div
            className="flex flex-col justify-center items-center md:items-end 
                        space-x-4 md:space-x-0 md:space-y-2 bg-gray-50 md:bg-transparent 
                        p-3 rounded-lg"
          >
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 font-medium ">
                Total Quantity: {group.totalQuantity}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                Product Price: ₹{group.items[0].unitPrice}{' '}
              </p>
              <p className="text-sm text-gray-500 font-medium mb-1">
                GST({group.gst}%): ₹
                {(group.items[0].unitPrice * group.gst) / 100}
              </p>
            </div>
            <div className="border-t pt-2 md:mt-2 border-gray-200">
              <p className="text-xl font-bold text-primary">
                ₹
                {(
                  group.totalPrice +
                  (group.totalPrice * group.gst) / 100
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Items Grid Section */}
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="p-4 md:p-6">
        <div className="grid  sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {group.items.map(item => (
            <CartItemSection key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default GroupedCartItemSection;
