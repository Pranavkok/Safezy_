import { ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartHeaderPropsType {
  onClearCart: () => Promise<void>;
  isClearing: boolean;
}

const CartHeaderSection = ({
  onClearCart,
  isClearing
}: CartHeaderPropsType) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <ShoppingBag className="w-6 h-6 text-primary" />
      <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
    </div>
    <Button
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={onClearCart}
      disabled={isClearing}
    >
      {isClearing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      {isClearing ? 'Clearing...' : 'Clear Cart'}
    </Button>
  </div>
);

export default CartHeaderSection;
