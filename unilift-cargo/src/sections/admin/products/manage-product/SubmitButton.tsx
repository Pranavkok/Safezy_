import { Button } from '@/components/ui/button';

type SubmitButtonPropsType = {
  loading: boolean;
  isUpdate?: boolean; // Optional prop with default value
};

const SubmitButton = ({ loading, isUpdate = false }: SubmitButtonPropsType) => (
  <div className="w-full flex justify-end">
    <Button type="submit" className="w-full lg:w-96" disabled={loading}>
      {loading
        ? isUpdate
          ? 'Updating Product...'
          : 'Adding Product...'
        : isUpdate
          ? 'Update Product'
          : 'Add Product'}
    </Button>
  </div>
);

export default SubmitButton;
